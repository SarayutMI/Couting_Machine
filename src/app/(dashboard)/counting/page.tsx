"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

// Status types
type CountStatus = "idle" | "requesting" | "counting" | "paused" | "stopped" | "offline" | "error";

interface DeviceInfo {
  deviceId: string;
  label: string;
}

const MOCK_LOG = [
  { time: "14:32:01", delta: "+1", total: 4832 },
  { time: "14:31:58", delta: "+1", total: 4831 },
  { time: "14:31:45", delta: "+1", total: 4830 },
  { time: "14:31:32", delta: "+1", total: 4829 },
  { time: "14:31:20", delta: "+1", total: 4828 },
];

export default function CountingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CountStatus>("idle");
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [count] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [log] = useState(MOCK_LOG);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Enumerate all available cameras
  const loadDevices = useCallback(async () => {
    try {
      // Must request permission first to get device labels
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      tempStream.getTracks().forEach(track => track.stop());

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices
        .filter(device => device.kind === "videoinput")
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
        }));

      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDevice) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
    } catch {
      setError("Camera permission denied. Please allow camera access.");
      setStatus("error");
    }
  }, [selectedDevice]);

  // Start camera stream
  const startCamera = useCallback(async (deviceId?: string) => {
    setStatus("requesting");
    setError("");

    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

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
          // Start session timer
          timerRef.current = setInterval(() => {
            setSessionTime(prev => prev + 1);
          }, 1000);
        };
      }
    } catch (err: unknown) {
      console.error("Camera error:", err);
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
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStatus("stopped");
  }, []);

  // Toggle pause/resume — pauses the video element and session timer
  const togglePause = useCallback(() => {
    setStatus(prev => {
      if (prev === "paused") {
        // Resume video and timer
        videoRef.current?.play();
        timerRef.current = setInterval(() => {
          setSessionTime(prevTime => prevTime + 1);
        }, 1000);
        return "counting";
      } else {
        // Pause video and timer
        videoRef.current?.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return "paused";
      }
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Listen for device changes (plug/unplug)
  useEffect(() => {
    navigator.mediaDevices?.addEventListener("devicechange", loadDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener("devicechange", loadDevices);
    };
  }, [loadDevices]);

  // Format session time
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
  };

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

  return (
    <div className="flex flex-col h-full">
      {/* Page top bar */}
      <div className="flex items-center justify-between px-3 h-11 border-b border-[#AAFF0022] bg-[#0A0A0A] shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/dashboard" className="font-orbitron text-[10px] text-[#444] hover:text-[#AAFF00] transition-colors shrink-0">
            ←
          </Link>
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              backgroundColor: current.color,
              boxShadow: status === "counting" ? `0 0 6px ${current.color}` : "none",
              animation: status === "counting" ? "pulse 2s infinite" : "none",
            }}
          />
          <span className="font-orbitron text-[10px] text-white truncate">{current.label}</span>
        </div>

        {/* Camera selector */}
        {devices.length > 1 && (
          <select
            value={selectedDevice}
            onChange={e => {
              setSelectedDevice(e.target.value);
              if (status === "counting" || status === "paused") {
                startCamera(e.target.value);
              }
            }}
            className="bg-[#111] border border-[#222] text-[#AAFF00] font-orbitron text-[9px] rounded-lg px-2 py-1 max-w-[140px] truncate"
          >
            {devices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label.length > 20 ? device.label.slice(0, 20) + "…" : device.label}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          {status === "idle" || status === "stopped" || status === "error" ? (
            <button
              onClick={() => {
                if (devices.length === 0) {
                  loadDevices().then(() => startCamera(selectedDevice));
                } else {
                  startCamera(selectedDevice);
                }
              }}
              className="font-orbitron text-[10px] tracking-wider border border-[#AAFF0055] text-[#AAFF00] px-3 py-1.5 rounded-lg hover:bg-[#AAFF0015] transition-all"
            >
              ▶ START
            </button>
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

      {/* Main content — landscape: row, portrait: column */}
      <div className="flex flex-1 overflow-hidden flex-col landscape:flex-row">

        {/* CAMERA FEED — 70% landscape, 60% portrait */}
        <div className="relative bg-black border-b landscape:border-b-0 landscape:border-r border-[#AAFF0022]
                        h-[60%] landscape:h-full landscape:w-[70%]">

          {/* Video element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ display: status === "counting" || status === "paused" ? "block" : "none" }}
          />

          {/* Placeholder when no feed */}
          {status !== "counting" && status !== "paused" && (
            <div className="w-full h-full bg-[#050505] flex flex-col items-center justify-center gap-4">
              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#AAFF00]" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#AAFF00]" />
              <div className="absolute bottom-10 left-3 w-6 h-6 border-b-2 border-l-2 border-[#AAFF00]" />
              <div className="absolute bottom-10 right-3 w-6 h-6 border-b-2 border-r-2 border-[#AAFF00]" />

              {status === "error" ? (
                <>
                  <div className="text-[#FF3333] font-orbitron text-sm text-center px-4">⚠ {error}</div>
                  <button
                    onClick={() => { loadDevices(); }}
                    className="font-orbitron text-[10px] border border-[#AAFF0055] text-[#AAFF00] px-4 py-2 rounded-xl hover:bg-[#AAFF0015] transition-all"
                  >
                    RETRY
                  </button>
                </>
              ) : status === "requesting" ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-[#AAFF00] border-t-transparent rounded-full animate-spin" />
                  <div className="font-orbitron text-[#AAFF00] text-xs">CONNECTING CAMERA...</div>
                  <div className="font-ibm-thai text-[#444] text-xs">กำลังเชื่อมต่อกล้อง</div>
                </div>
              ) : (
                <>
                  <div className="font-orbitron text-[#AAFF00] text-sm glow-green-text">NO FEED</div>
                  <div className="font-ibm-thai text-[#333] text-xs">กดปุ่ม START เพื่อเชื่อมต่อกล้อง</div>
                  <button
                    onClick={() => {
                      if (devices.length === 0) {
                        loadDevices().then(() => startCamera(selectedDevice));
                      } else {
                        startCamera(selectedDevice);
                      }
                    }}
                    className="mt-2 font-orbitron text-xs border border-[#AAFF00] text-[#AAFF00] px-6 py-2.5 rounded-xl hover:bg-[#AAFF0015] transition-all shadow-[0_0_15px_#AAFF0030]"
                  >
                    ▶ CONNECT CAMERA
                  </button>
                  {devices.length > 0 && (
                    <div className="font-orbitron text-[#444] text-[10px]">{devices.length} device(s) found</div>
                  )}
                </>
              )}
            </div>
          )}

          {/* HUD Overlay when counting */}
          {(status === "counting" || status === "paused") && (
            <>
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#AAFF00] opacity-70" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#AAFF00] opacity-70" />
              <div className="absolute bottom-10 left-3 w-6 h-6 border-b-2 border-l-2 border-[#AAFF00] opacity-70" />
              <div className="absolute bottom-10 right-3 w-6 h-6 border-b-2 border-r-2 border-[#AAFF00] opacity-70" />
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur border border-[#AAFF0033] rounded-lg px-2 py-1">
                <span className="font-orbitron text-[10px] text-[#AAFF00]">● LIVE</span>
              </div>
            </>
          )}

          {/* Bottom info bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-[#AAFF0022] px-3 py-1.5 flex gap-4 overflow-x-auto">
            {devices.length > 0 ? (
              <span className="font-orbitron text-[10px] text-[#AAFF00] shrink-0">
                {devices.find(device => device.deviceId === selectedDevice)?.label?.slice(0, 30) || "CAMERA"}
              </span>
            ) : (
              <span className="font-orbitron text-[10px] text-[#333]">NO DEVICE</span>
            )}
            <span className="font-orbitron text-[10px] text-[#333] shrink-0">BROWSER CAMERA API</span>
          </div>
        </div>

        {/* RIGHT PANEL — 30% landscape, 40% portrait */}
        <div className="landscape:w-[30%] h-[40%] landscape:h-full flex flex-col landscape:flex-col flex-row overflow-hidden bg-[#0A0A0A]">

          {/* TOTAL COUNT */}
          <div className="flex-1 landscape:flex-none flex flex-col items-center justify-center p-3 border-b landscape:border-b border-r landscape:border-r-0 border-[#AAFF0022]">
            <div className="font-orbitron text-[9px] text-[#444] tracking-[0.3em] mb-1">TOTAL</div>
            <div className="font-orbitron font-black text-[#AAFF00] leading-none text-4xl landscape:text-5xl"
                 style={{ textShadow: "0 0 20px #AAFF00" }}>
              {count.toLocaleString()}
            </div>
            <div className="font-ibm-thai text-[10px] text-[#333] mt-1">รายการที่ตรวจพบ</div>
          </div>

          {/* STATUS + SESSION */}
          <div className="flex-1 landscape:flex-none flex flex-col p-3 gap-2 overflow-y-auto">
            {/* Status */}
            <div className="bg-[#111] border border-[#AAFF0015] rounded-xl p-3">
              <div className="font-orbitron text-[9px] text-[#333] tracking-widest mb-2">STATUS</div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: current.color,
                    boxShadow: status === "counting" ? `0 0 8px ${current.color}` : "none",
                  }}
                />
                <span className="font-orbitron text-xs" style={{ color: current.color }}>
                  {current.label}
                </span>
              </div>
              <div className="font-ibm-thai text-[10px] text-[#444] mt-1">{current.labelTh}</div>
            </div>

            {/* Session */}
            <div className="bg-[#111] border border-[#AAFF0015] rounded-xl p-3">
              <div className="font-orbitron text-[9px] text-[#333] tracking-widest mb-2">SESSION</div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-orbitron text-[9px] text-[#333]">TIME</span>
                <span className="font-orbitron text-[9px] text-[#AAFF00] text-right">{formatTime(sessionTime)}</span>
                <span className="font-orbitron text-[9px] text-[#333]">RATE</span>
                <span className="font-orbitron text-[9px] text-white text-right">—/MIN</span>
              </div>
            </div>

            {/* Log — hidden on very small screens */}
            <div className="bg-[#111] border border-[#AAFF0015] rounded-xl p-3 hidden landscape:block flex-1">
              <div className="font-orbitron text-[9px] text-[#333] tracking-widest mb-2">LOG</div>
              <div className="space-y-1">
                {log.slice(0, 5).map((entry, i) => (
                  <div key={entry.time} className={`flex justify-between font-orbitron text-[9px] ${i === 0 ? "text-[#AAFF00]" : "text-[#333]"}`}>
                    <span>{entry.time}</span>
                    <span>{entry.delta}</span>
                    <span className={i === 0 ? "text-white" : ""}>{entry.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
