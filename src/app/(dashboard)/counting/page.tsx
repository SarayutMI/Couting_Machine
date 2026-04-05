"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { detectFrame, checkApiHealth, type Detection } from "@/lib/yolo-client";

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────
type CountStatus = "idle" | "requesting" | "counting" | "paused" | "stopped" | "offline" | "error";
type ApiStatus = "checking" | "online" | "offline";

interface DeviceInfo {
  deviceId: string;
  label: string;
}

interface LogEntry {
  time: string;
  frameCount: number;
  total: number;
}

// Mock detections for DEMO mode
function generateMockDetections(): Detection[] {
  const count = Math.floor(Math.random() * 3) + 1;
  return Array.from({ length: count }, (_, i) => ({
    class_id: 0,
    class_name: "person",
    confidence: 0.75 + Math.random() * 0.2,
    bbox: {
      x1: 0.1 + i * 0.25 + Math.random() * 0.05,
      y1: 0.1 + Math.random() * 0.1,
      x2: 0.1 + i * 0.25 + 0.2 + Math.random() * 0.05,
      y2: 0.85 + Math.random() * 0.1,
    },
  }));
}

// ─────────────────────────────────────────────────
// Canvas drawing helpers
// ─────────────────────────────────────────────────
function drawBoundingBoxes(
  ctx: CanvasRenderingContext2D,
  detections: Detection[],
  width: number,
  height: number,
) {
  ctx.clearRect(0, 0, width, height);

  for (const det of detections) {
    const { x1, y1, x2, y2 } = det.bbox;
    const bx = x1 * width;
    const by = y1 * height;
    const bw = (x2 - x1) * width;
    const bh = (y2 - y1) * height;
    const bracketSize = Math.min(bw, bh) * 0.2;

    // Glow shadow
    ctx.shadowColor = "#AAFF00";
    ctx.shadowBlur = 8;

    // Box border
    ctx.strokeStyle = "#AAFF00";
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);

    // F1-style corner brackets — top-left
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx, by + bracketSize);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx + bracketSize, by);
    ctx.stroke();
    // top-right
    ctx.beginPath();
    ctx.moveTo(bx + bw - bracketSize, by);
    ctx.lineTo(bx + bw, by);
    ctx.lineTo(bx + bw, by + bracketSize);
    ctx.stroke();
    // bottom-left
    ctx.beginPath();
    ctx.moveTo(bx, by + bh - bracketSize);
    ctx.lineTo(bx, by + bh);
    ctx.lineTo(bx + bracketSize, by + bh);
    ctx.stroke();
    // bottom-right
    ctx.beginPath();
    ctx.moveTo(bx + bw - bracketSize, by + bh);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw, by + bh - bracketSize);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Confidence label
    const label = `${det.class_name.toUpperCase()} ${Math.round(det.confidence * 100)}%`;
    ctx.font = "bold 11px 'Courier New', monospace";
    const textWidth = ctx.measureText(label).width;
    const labelX = bx;
    const labelY = by > 18 ? by - 6 : by + bh + 16;

    ctx.fillStyle = "#AAFF00CC";
    ctx.fillRect(labelX - 2, labelY - 12, textWidth + 6, 16);
    ctx.fillStyle = "#000000";
    ctx.fillText(label, labelX + 1, labelY);
  }
}

// ─────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────
export default function CountingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [status, setStatus] = useState<CountStatus>("idle");
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const [demoMode, setDemoMode] = useState(false);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [currentFrameCount, setCurrentFrameCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [inferenceMs, setInferenceMs] = useState<number | null>(null);

  // ── API health check (runs on mount, re-checks every 10 s) ──
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const result = await checkApiHealth();
      if (!cancelled) setApiStatus(result?.model_loaded ? "online" : "offline");
    };
    check();
    const id = setInterval(check, 10_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // ── Enumerate cameras ──
  const loadDevices = useCallback(async () => {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      tempStream.getTracks().forEach(track => track.stop());
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices
        .filter(d => d.kind === "videoinput")
        .map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 8)}` }));
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDevice) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
    } catch {
      setError("Camera permission denied. Please allow camera access.");
      setStatus("error");
    }
  }, [selectedDevice]);

  // ── Detection loop ──
  const runDetection = useCallback(async () => {
    const video = videoRef.current;
    const capture = captureCanvasRef.current;
    const overlay = overlayCanvasRef.current;
    if (!video || !capture || !overlay || video.readyState < 2) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (w === 0 || h === 0) return;

    capture.width = w;
    capture.height = h;
    overlay.width = w;
    overlay.height = h;

    const ctx2d = capture.getContext("2d");
    if (!ctx2d) return;
    ctx2d.drawImage(video, 0, 0, w, h);

    let detections: Detection[] = [];

    if (demoMode) {
      detections = generateMockDetections();
      setInferenceMs(null);
    } else {
      try {
        const result = await detectFrame(capture, 0.7);
        detections = result.detections;
        setInferenceMs(result.inference_ms);
      } catch {
        // API unavailable — skip this frame silently
        return;
      }
    }

    const overlayCtx = overlay.getContext("2d");
    if (overlayCtx) drawBoundingBoxes(overlayCtx, detections, w, h);

    const frameCount = detections.length;
    setCurrentFrameCount(frameCount);
    setTotalCount(prev => {
      const next = prev + frameCount;
      if (frameCount > 0) {
        const now = new Date();
        const timeStr = now.toTimeString().slice(0, 8);
        setLog(prevLog => [{ time: timeStr, frameCount, total: next }, ...prevLog].slice(0, 20));
      }
      return next;
    });
  }, [demoMode]);

  // ── Start camera ──
  const startCamera = useCallback(async (deviceId?: string) => {
    setStatus("requesting");
    setError("");

    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setStatus("counting");
          timerRef.current = setInterval(() => setSessionTime(p => p + 1), 1000);
          detectIntervalRef.current = setInterval(runDetection, 500);
        };
      }
    } catch (err: unknown) {
      const domErr = err as { name?: string; message?: string };
      if (domErr.name === "NotAllowedError") {
        setError("Camera access denied. Please check browser permissions.");
      } else if (domErr.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else if (domErr.name === "NotReadableError") {
        setError("Camera is in use by another application.");
      } else {
        setError(`Camera error: ${domErr.message ?? "Unknown error"}`);
      }
      setStatus("error");
    }
  }, [runDetection]);

  // ── Stop camera ──
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (detectIntervalRef.current) { clearInterval(detectIntervalRef.current); detectIntervalRef.current = null; }

    // Clear overlay
    const overlay = overlayCanvasRef.current;
    if (overlay) overlay.getContext("2d")?.clearRect(0, 0, overlay.width, overlay.height);

    setCurrentFrameCount(0);
    setStatus("stopped");
  }, []);

  // ── Pause / resume ──
  const togglePause = useCallback(() => {
    setStatus(prev => {
      if (prev === "paused") {
        videoRef.current?.play();
        timerRef.current = setInterval(() => setSessionTime(p => p + 1), 1000);
        detectIntervalRef.current = setInterval(runDetection, 500);
        return "counting";
      } else {
        videoRef.current?.pause();
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        if (detectIntervalRef.current) { clearInterval(detectIntervalRef.current); detectIntervalRef.current = null; }
        return "paused";
      }
    });
  }, [runDetection]);

  // ── Start DEMO mode ──
  const startDemo = useCallback(() => {
    setDemoMode(true);
    if (devices.length === 0) {
      loadDevices().then(() => startCamera(selectedDevice));
    } else {
      startCamera(selectedDevice);
    }
  }, [devices.length, loadDevices, selectedDevice, startCamera]);

  // ── Cleanup ──
  useEffect(() => () => { stopCamera(); }, [stopCamera]);
  useEffect(() => {
    navigator.mediaDevices?.addEventListener("devicechange", loadDevices);
    return () => navigator.mediaDevices?.removeEventListener("devicechange", loadDevices);
  }, [loadDevices]);

  // ── Re-attach detection interval when demoMode changes while counting ──
  useEffect(() => {
    if (status === "counting") {
      if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
      detectIntervalRef.current = setInterval(runDetection, 500);
    }
  }, [demoMode, status, runDetection]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 3600).toString().padStart(2, "0")}:${Math.floor((s % 3600) / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const statusConfig: Record<CountStatus, { color: string; label: string; labelTh: string }> = {
    idle:       { color: "#666666", label: "STANDBY",         labelTh: "พร้อมใช้งาน" },
    requesting: { color: "#00AAFF", label: "CONNECTING...",   labelTh: "กำลังเชื่อมต่อ..." },
    counting:   { color: "#AAFF00", label: "COUNTING ACTIVE", labelTh: "กำลังนับ..." },
    paused:     { color: "#FFAA00", label: "PAUSED",          labelTh: "หยุดชั่วคราว" },
    stopped:    { color: "#444444", label: "STOPPED",         labelTh: "หยุดแล้ว" },
    offline:    { color: "#FF3333", label: "CAMERA OFFLINE",  labelTh: "กล้องออฟไลน์" },
    error:      { color: "#FF3333", label: "ERROR",           labelTh: "เกิดข้อผิดพลาด" },
  };

  const current = statusConfig[status];
  const isActive = status === "counting" || status === "paused";
  const isIdle = status === "idle" || status === "stopped" || status === "error";

  return (
    <div className="flex flex-col h-full">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-3 h-11 border-b border-[#AAFF0022] bg-[#0A0A0A] shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/dashboard" className="font-orbitron text-[10px] text-[#444] hover:text-[#AAFF00] transition-colors shrink-0">←</Link>
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              backgroundColor: current.color,
              boxShadow: status === "counting" ? `0 0 6px ${current.color}` : "none",
              animation: status === "counting" ? "pulse 2s infinite" : "none",
            }}
          />
          <span className="font-orbitron text-[10px] text-white truncate">{current.label}</span>

          {/* API health badge */}
          <span
            className="font-orbitron text-[9px] px-1.5 py-0.5 rounded border shrink-0"
            style={{
              color: apiStatus === "online" ? "#AAFF00" : apiStatus === "offline" ? "#FF3333" : "#888",
              borderColor: apiStatus === "online" ? "#AAFF0044" : apiStatus === "offline" ? "#FF333344" : "#33333344",
              backgroundColor: apiStatus === "online" ? "#AAFF0011" : apiStatus === "offline" ? "#FF333311" : "#11111144",
            }}
          >
            {demoMode ? "DEMO" : apiStatus === "online" ? "API ✓" : apiStatus === "offline" ? "API ✗" : "API …"}
          </span>
        </div>

        {/* Camera selector */}
        {devices.length > 1 && (
          <select
            value={selectedDevice}
            onChange={e => {
              setSelectedDevice(e.target.value);
              if (isActive) startCamera(e.target.value);
            }}
            className="bg-[#111] border border-[#222] text-[#AAFF00] font-orbitron text-[9px] rounded-lg px-2 py-1 max-w-[140px] truncate"
          >
            {devices.map(d => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label.length > 20 ? d.label.slice(0, 20) + "…" : d.label}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          {isIdle ? (
            <>
              <button
                onClick={() => {
                  setDemoMode(false);
                  if (devices.length === 0) loadDevices().then(() => startCamera(selectedDevice));
                  else startCamera(selectedDevice);
                }}
                className="font-orbitron text-[10px] tracking-wider border border-[#AAFF0055] text-[#AAFF00] px-3 py-1.5 rounded-lg hover:bg-[#AAFF0015] transition-all"
              >
                ▶ START
              </button>
              <button
                onClick={startDemo}
                className="font-orbitron text-[10px] border border-[#FFAA0055] text-[#FFAA00] px-3 py-1.5 rounded-lg hover:bg-[#FFAA0010] transition-all"
              >
                DEMO
              </button>
            </>
          ) : (
            <>
              <button
                onClick={togglePause}
                className="font-orbitron text-[10px] border border-[#FFAA0055] text-[#FFAA00] px-2 py-1.5 rounded-lg hover:bg-[#FFAA0010] transition-all"
              >
                {status === "paused" ? "▶" : "⏸"}
              </button>
              <button
                onClick={stopCamera}
                className="font-orbitron text-[10px] border border-[#FF333355] text-[#FF3333] px-2 py-1.5 rounded-lg hover:bg-[#FF333310] transition-all"
              >
                ⏹
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-1 overflow-hidden flex-col landscape:flex-row">

        {/* CAMERA FEED — 70% landscape */}
        <div className="relative bg-black border-b landscape:border-b-0 landscape:border-r border-[#AAFF0022] h-[60%] landscape:h-full landscape:w-[70%]">

          {/* Video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ display: isActive ? "block" : "none" }}
          />

          {/* Hidden capture canvas */}
          <canvas ref={captureCanvasRef} className="hidden" />

          {/* Bounding box overlay */}
          <canvas
            ref={overlayCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ display: isActive ? "block" : "none" }}
          />

          {/* Placeholder */}
          {!isActive && (
            <div className="w-full h-full bg-[#050505] flex flex-col items-center justify-center gap-4">
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#AAFF00]" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#AAFF00]" />
              <div className="absolute bottom-10 left-3 w-6 h-6 border-b-2 border-l-2 border-[#AAFF00]" />
              <div className="absolute bottom-10 right-3 w-6 h-6 border-b-2 border-r-2 border-[#AAFF00]" />

              {status === "error" ? (
                <>
                  <div className="text-[#FF3333] font-orbitron text-sm text-center px-4">⚠ {error}</div>
                  <button onClick={loadDevices} className="font-orbitron text-[10px] border border-[#AAFF0055] text-[#AAFF00] px-4 py-2 rounded-xl hover:bg-[#AAFF0015] transition-all">RETRY</button>
                </>
              ) : status === "requesting" ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-[#AAFF00] border-t-transparent rounded-full animate-spin" />
                  <div className="font-orbitron text-[#AAFF00] text-xs">CONNECTING CAMERA...</div>
                  <div className="font-ibm-thai text-[#444] text-xs">กำลังเชื่อมต่อกล้อง</div>
                </div>
              ) : (
                <>
                  <div className="font-orbitron text-[#AAFF00] text-sm" style={{ textShadow: "0 0 10px #AAFF00" }}>NO FEED</div>
                  <div className="font-ibm-thai text-[#333] text-xs">กดปุ่ม START เพื่อเชื่อมต่อกล้อง</div>
                  <button
                    onClick={() => {
                      setDemoMode(false);
                      if (devices.length === 0) loadDevices().then(() => startCamera(selectedDevice));
                      else startCamera(selectedDevice);
                    }}
                    className="mt-2 font-orbitron text-xs border border-[#AAFF00] text-[#AAFF00] px-6 py-2.5 rounded-xl hover:bg-[#AAFF0015] transition-all shadow-[0_0_15px_#AAFF0030]"
                  >
                    ▶ CONNECT CAMERA
                  </button>
                  {devices.length > 0 && <div className="font-orbitron text-[#444] text-[10px]">{devices.length} device(s) found</div>}

                  {/* API offline instructions */}
                  {apiStatus === "offline" && !demoMode && (
                    <div className="mt-3 mx-4 p-3 border border-[#FF333333] rounded-xl bg-[#FF333308] max-w-xs text-center">
                      <div className="font-orbitron text-[#FF3333] text-[9px] mb-1">API OFFLINE</div>
                      <div className="font-ibm-thai text-[#555] text-[10px] leading-relaxed">
                        รัน Python server ก่อน:<br />
                        <span className="font-mono text-[#888] text-[9px]">cd python && uvicorn main:app --port 8000</span>
                      </div>
                      <button
                        onClick={startDemo}
                        className="mt-2 font-orbitron text-[9px] border border-[#FFAA0055] text-[#FFAA00] px-3 py-1 rounded-lg hover:bg-[#FFAA0010] transition-all"
                      >
                        ▶ RUN DEMO INSTEAD
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* HUD overlay when active */}
          {isActive && (
            <>
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#AAFF00] opacity-70" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#AAFF00] opacity-70" />
              <div className="absolute bottom-10 left-3 w-6 h-6 border-b-2 border-l-2 border-[#AAFF00] opacity-70" />
              <div className="absolute bottom-10 right-3 w-6 h-6 border-b-2 border-r-2 border-[#AAFF00] opacity-70" />
              {/* LIVE badge */}
              <div className="absolute top-3 left-10 bg-black/60 backdrop-blur border border-[#AAFF0033] rounded-lg px-2 py-0.5">
                <span className="font-orbitron text-[10px] text-[#AAFF00]">● {demoMode ? "DEMO" : "LIVE"}</span>
              </div>
              {/* Frame count overlay */}
              <div className="absolute top-3 right-10 bg-black/70 backdrop-blur border border-[#AAFF0033] rounded-lg px-2 py-0.5 flex items-center gap-1">
                <span className="font-orbitron text-[10px] text-[#888]">FRAME</span>
                <span className="font-orbitron text-[10px] text-white font-bold">{currentFrameCount}</span>
              </div>
            </>
          )}

          {/* Bottom info bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-[#AAFF0022] px-3 py-1.5 flex gap-4 overflow-x-auto">
            {devices.length > 0 ? (
              <span className="font-orbitron text-[10px] text-[#AAFF00] shrink-0">
                {devices.find(d => d.deviceId === selectedDevice)?.label?.slice(0, 30) || "CAMERA"}
              </span>
            ) : (
              <span className="font-orbitron text-[10px] text-[#333]">NO DEVICE</span>
            )}
            {inferenceMs !== null && (
              <span className="font-orbitron text-[10px] text-[#444] shrink-0">{inferenceMs}ms</span>
            )}
            <span className="font-orbitron text-[10px] text-[#333] shrink-0">YOLOv8n</span>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="landscape:w-[30%] h-[40%] landscape:h-full flex flex-col landscape:flex-col flex-row overflow-hidden bg-[#0A0A0A]">

          {/* COUNT DISPLAY */}
          <div className="flex-1 landscape:flex-none flex flex-col items-center justify-center p-3 border-b landscape:border-b border-r landscape:border-r-0 border-[#AAFF0022] gap-2">
            {/* Current frame count */}
            <div className="text-center">
              <div className="font-orbitron text-[9px] text-[#444] tracking-[0.3em] mb-0.5">CURRENT FRAME</div>
              <div
                className="font-orbitron font-black text-white leading-none text-3xl landscape:text-4xl"
                style={{ textShadow: currentFrameCount > 0 ? "0 0 15px #AAFF00" : "none" }}
              >
                {currentFrameCount}
              </div>
              <div className="font-ibm-thai text-[9px] text-[#333] mt-0.5">คนในภาพปัจจุบัน</div>
            </div>
            {/* Session total */}
            <div className="text-center">
              <div className="font-orbitron text-[9px] text-[#444] tracking-[0.3em] mb-0.5">SESSION TOTAL</div>
              <div
                className="font-orbitron font-black text-[#AAFF00] leading-none text-4xl landscape:text-5xl"
                style={{ textShadow: "0 0 20px #AAFF00" }}
              >
                {totalCount.toLocaleString()}
              </div>
              <div className="font-ibm-thai text-[10px] text-[#333] mt-0.5">รวมทั้ง Session</div>
            </div>
          </div>

          {/* STATUS + SESSION + LOG */}
          <div className="flex-1 landscape:flex-none flex flex-col p-3 gap-2 overflow-y-auto">
            {/* Status */}
            <div className="bg-[#111] border border-[#AAFF0015] rounded-xl p-3">
              <div className="font-orbitron text-[9px] text-[#333] tracking-widest mb-2">STATUS</div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: current.color, boxShadow: status === "counting" ? `0 0 8px ${current.color}` : "none" }} />
                <span className="font-orbitron text-xs" style={{ color: current.color }}>{current.label}</span>
              </div>
              <div className="font-ibm-thai text-[10px] text-[#444] mt-1">{current.labelTh}</div>
            </div>

            {/* Session */}
            <div className="bg-[#111] border border-[#AAFF0015] rounded-xl p-3">
              <div className="font-orbitron text-[9px] text-[#333] tracking-widest mb-2">SESSION</div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-orbitron text-[9px] text-[#333]">TIME</span>
                <span className="font-orbitron text-[9px] text-[#AAFF00] text-right">{formatTime(sessionTime)}</span>
                <span className="font-orbitron text-[9px] text-[#333]">TOTAL</span>
                <span className="font-orbitron text-[9px] text-white text-right">{totalCount.toLocaleString()}</span>
                <span className="font-orbitron text-[9px] text-[#333]">MODE</span>
                <span className="font-orbitron text-[9px] text-right" style={{ color: demoMode ? "#FFAA00" : "#AAFF00" }}>
                  {demoMode ? "DEMO" : "LIVE"}
                </span>
              </div>
            </div>

            {/* Detection log */}
            <div className="bg-[#111] border border-[#AAFF0015] rounded-xl p-3 hidden landscape:flex flex-col flex-1 min-h-0">
              <div className="font-orbitron text-[9px] text-[#333] tracking-widest mb-2">DETECTION LOG</div>
              <div className="space-y-1 overflow-y-auto flex-1">
                {log.length === 0 ? (
                  <div className="font-orbitron text-[9px] text-[#222]">— no detections yet —</div>
                ) : (
                  log.slice(0, 10).map((entry, i) => (
                    <div key={`${entry.time}-${i}`} className={`flex justify-between font-orbitron text-[9px] ${i === 0 ? "text-[#AAFF00]" : "text-[#333]"}`}>
                      <span>{entry.time}</span>
                      <span>+{entry.frameCount}</span>
                      <span className={i === 0 ? "text-white" : ""}>{entry.total.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
