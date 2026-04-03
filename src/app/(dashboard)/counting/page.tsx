"use client";

import { useState } from "react";
import Link from "next/link";

const MOCK_LOG = [
  { time: "14:32:01", delta: "+1", total: 4832 },
  { time: "14:31:58", delta: "+1", total: 4831 },
  { time: "14:31:45", delta: "+1", total: 4830 },
  { time: "14:31:32", delta: "+1", total: 4829 },
  { time: "14:31:20", delta: "+1", total: 4828 },
];

type CountStatus = "counting" | "paused" | "stopped" | "offline";

export default function CountingPage() {
  const [status, setStatus] = useState<CountStatus>("counting");

  const statusConfig: Record<CountStatus, { color: string; label: string; labelTh: string; pulse: boolean }> = {
    counting: { color: "#AAFF00", label: "COUNTING ACTIVE", labelTh: "กำลังนับ...", pulse: true },
    paused: { color: "#FFAA00", label: "PAUSED", labelTh: "หยุดชั่วคราว", pulse: false },
    stopped: { color: "#666666", label: "STANDBY", labelTh: "รอ", pulse: false },
    offline: { color: "#FF3333", label: "CAMERA OFFLINE", labelTh: "กล้องออฟไลน์", pulse: false },
  };

  const current = statusConfig[status];

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Page top bar */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-[#AAFF0033] bg-[#0A0A0A] shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="font-orbitron text-xs text-[#444] hover:text-[#AAFF00] transition-colors">
            ← BACK
          </Link>
          <span className="font-orbitron text-xs text-white tracking-wider">CAM-01 — Entrance Gate</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#AAFF00] animate-pulse-green" />
            <span className="font-orbitron text-[10px] text-[#AAFF00] tracking-wider">COUNTING</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatus(status === "paused" ? "counting" : "paused")}
            className="font-orbitron text-[10px] tracking-wider border border-[#FFAA0055] text-[#FFAA00] px-3 py-1.5 rounded hover:bg-[#FFAA0010] transition-all"
          >
            {status === "paused" ? "▶ RESUME" : "⏸ PAUSE"}
          </button>
          <button
            onClick={() => setStatus("stopped")}
            className="font-orbitron text-[10px] tracking-wider border border-[#FF333355] text-[#FF3333] px-3 py-1.5 rounded hover:bg-[#FF333310] transition-all"
          >
            ⏹ STOP
          </button>
          <button className="font-orbitron text-[10px] tracking-wider border border-[#222] text-[#444] px-3 py-1.5 rounded hover:border-[#AAFF00] hover:text-[#AAFF00] transition-all">
            ⚙ CONFIG
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — 70% camera feed */}
        <div className="w-[70%] relative bg-black border-r border-[#AAFF0033]">
          <div className="relative w-full h-full">
            {/* Camera feed area */}
            <div className="w-full h-full bg-[#050505] bg-grid flex items-center justify-center">
              {/* Corner brackets F1 HUD */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#AAFF00]" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#AAFF00]" />
              <div className="absolute bottom-12 left-4 w-8 h-8 border-b-2 border-l-2 border-[#AAFF00]" />
              <div className="absolute bottom-12 right-4 w-8 h-8 border-b-2 border-r-2 border-[#AAFF00]" />

              {/* Mock bounding box */}
              <div className="absolute border-2 border-[#AAFF00] w-32 h-40 top-1/3 left-1/4 shadow-[0_0_15px_#AAFF00]">
                <span className="absolute -top-6 left-0 font-orbitron text-[#AAFF00] text-[10px] tracking-wider">
                  OBJ_001 [DETECTED]
                </span>
              </div>

              {/* No feed placeholder */}
              <div className="text-center">
                <div className="font-orbitron text-[#AAFF00] text-xl mb-2 glow-green-text">AWAITING FEED</div>
                <div className="font-orbitron text-[#333] text-sm">CONNECT CAMERA TO BEGIN</div>
              </div>
            </div>

            {/* Bottom info bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur border-t border-[#AAFF0033] p-3 flex gap-8">
              <span className="font-orbitron text-xs text-[#AAFF00]">CAM: 192.168.1.100</span>
              <span className="font-orbitron text-xs text-[#666]">FPS: 24</span>
              <span className="font-orbitron text-xs text-[#666]">RES: 1080p</span>
              <span className="font-orbitron text-xs text-[#666]">PROTOCOL: ONVIF</span>
              <span className="font-orbitron text-xs text-[#666]">LATENCY: 12ms</span>
            </div>
          </div>
        </div>

        {/* RIGHT — 30% */}
        <div className="w-[30%] flex flex-col gap-3 p-4 overflow-y-auto bg-[#0A0A0A]">
          {/* Total count big number */}
          <div className="bg-[#111] border border-[#AAFF0033] rounded-lg p-6 text-center shadow-[0_0_30px_#AAFF0015]">
            <div className="font-orbitron text-[10px] text-[#444] tracking-[0.3em] mb-2">TOTAL COUNT</div>
            <div className="font-orbitron text-7xl font-black text-[#AAFF00] glow-green-text leading-none">
              4,832
            </div>
            <div className="font-orbitron text-[10px] text-[#333] mt-2">OBJECTS DETECTED</div>
          </div>

          {/* Status */}
          <div className="bg-[#111] border border-[#AAFF0033] rounded-lg p-4">
            <div className="font-orbitron text-[10px] text-[#444] tracking-[0.3em] mb-3">SYSTEM STATUS</div>
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full shrink-0 ${current.pulse ? "animate-pulse-green" : ""}`}
                style={{ backgroundColor: current.color }}
              />
              <span className="font-orbitron text-sm" style={{ color: current.color }}>{current.label}</span>
            </div>
            <div className="font-ibm-thai text-xs text-[#444] mt-1 ml-6">{current.labelTh}</div>
          </div>

          {/* Session info */}
          <div className="bg-[#111] border border-[#AAFF0033] rounded-lg p-4">
            <div className="font-orbitron text-[10px] text-[#444] tracking-[0.3em] mb-3">SESSION</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-orbitron text-[10px] text-[#333]">START</span>
                <span className="font-orbitron text-[10px] text-white">08:30:00</span>
              </div>
              <div className="flex justify-between">
                <span className="font-orbitron text-[10px] text-[#333]">ELAPSED</span>
                <span className="font-orbitron text-[10px] text-[#AAFF00]">01:24:35</span>
              </div>
              <div className="flex justify-between">
                <span className="font-orbitron text-[10px] text-[#333]">RATE</span>
                <span className="font-orbitron text-[10px] text-white">58 / MIN</span>
              </div>
            </div>
          </div>

          {/* Count Log */}
          <div className="bg-[#111] border border-[#AAFF0033] rounded-lg p-4 flex-1">
            <div className="font-orbitron text-[10px] text-[#444] tracking-[0.3em] mb-3">COUNT LOG</div>
            <div className="space-y-1.5">
              {MOCK_LOG.map((entry, i) => (
                <div key={entry.time} className={`flex justify-between font-orbitron text-[10px] ${i === 0 ? "text-[#AAFF00]" : "text-[#444]"}`}>
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
  );
}
