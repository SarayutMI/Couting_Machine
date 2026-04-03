"use client";

import { useEffect, useState } from "react";
import type { DashboardStats } from "@/types";

const MOCK_CHART = [
  { time: "08:00", count: 120 },
  { time: "09:00", count: 340 },
  { time: "10:00", count: 580 },
  { time: "11:00", count: 720 },
  { time: "12:00", count: 950 },
  { time: "13:00", count: 1100 },
  { time: "14:00", count: 1247 },
];

const MOCK_CAMERAS = [
  { id: "1", name: "CAM-01", location: "Entrance Gate", count: 4832, status: "ONLINE" },
  { id: "2", name: "CAM-02", location: "Exit Gate", count: 892, status: "ONLINE" },
  { id: "3", name: "CAM-03", location: "Parking Lot", count: 0, status: "OFFLINE" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCameras: 3,
    onlineCameras: 2,
    totalCountToday: 1247,
    totalCountThisHour: 347,
  });
  const [counts] = useState(MOCK_CHART);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); })
      .catch(() => {});
  }, []);

  const maxCount = Math.max(...counts.map((c) => c.count));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="font-orbitron text-[10px] text-[#444] tracking-[0.3em] mb-1">◆ SYSTEM OVERVIEW</div>
        <h1 className="font-orbitron text-2xl font-black text-white tracking-wider">DASHBOARD</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Count */}
        <div className="bg-[#111] border border-[#AAFF0033] rounded-lg p-6 relative overflow-hidden hover:shadow-[0_0_20px_rgba(170,255,0,0.1)] transition-all">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#AAFF00]" />
          <div className="font-orbitron text-[10px] text-[#444] tracking-[0.25em] mb-3">TOTAL COUNT</div>
          <div className="font-orbitron text-4xl font-black text-[#AAFF00] glow-green-text">
            {stats.totalCountToday.toLocaleString()}
          </div>
          <div className="font-orbitron text-xs text-[#444] mt-2">↑ +58/MIN</div>
        </div>

        {/* Active Cams */}
        <div className="bg-[#111] border border-[#AAFF0033] rounded-lg p-6 relative overflow-hidden hover:shadow-[0_0_20px_rgba(170,255,0,0.1)] transition-all">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#AAFF00]" />
          <div className="font-orbitron text-[10px] text-[#444] tracking-[0.25em] mb-3">ACTIVE CAMERAS</div>
          <div className="font-orbitron text-4xl font-black text-[#AAFF00] glow-green-text">
            {stats.onlineCameras}/{stats.totalCameras}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-[#AAFF00] animate-pulse-green" />
            <span className="font-orbitron text-xs text-[#AAFF00]">ONLINE</span>
          </div>
        </div>

        {/* Today Scanned */}
        <div className="bg-[#111] border border-[#AAFF0033] rounded-lg p-6 relative overflow-hidden hover:shadow-[0_0_20px_rgba(170,255,0,0.1)] transition-all">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#AAFF00]" />
          <div className="font-orbitron text-[10px] text-[#444] tracking-[0.25em] mb-3">THIS HOUR</div>
          <div className="font-orbitron text-4xl font-black text-[#AAFF00] glow-green-text">
            {stats.totalCountThisHour.toLocaleString()}
          </div>
          <div className="font-orbitron text-xs text-[#444] mt-2">↑ +12%</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-[#111] border border-[#AAFF0033] rounded-lg p-6">
          <div className="font-orbitron text-[10px] text-[#444] tracking-[0.25em] mb-4">COUNT TREND — LAST 24H</div>
          <div className="flex items-end gap-2 h-40">
            {counts.map(({ time, count }) => {
              const heightPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={time} className="flex flex-col items-center flex-1 gap-1">
                  <div
                    className="w-full bg-[#AAFF00] rounded-t opacity-80 hover:opacity-100 transition-opacity"
                    style={{ height: `${heightPct}%`, minHeight: count > 0 ? "4px" : 0, boxShadow: "0 0 6px rgba(170,255,0,0.5)" }}
                  />
                  <span className="font-orbitron text-[9px] text-[#444]">{time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Camera Status */}
        <div className="bg-[#111] border border-[#AAFF0033] rounded-lg p-6">
          <div className="font-orbitron text-[10px] text-[#444] tracking-[0.25em] mb-4">CAMERA STATUS</div>
          <div className="space-y-4">
            {MOCK_CAMERAS.map((cam) => (
              <div key={cam.id} className="border-b border-[#1A1A1A] pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-orbitron text-xs text-white">{cam.name}</span>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${cam.status === "ONLINE" ? "bg-[#AAFF00] animate-pulse-green" : "bg-[#FF3333]"}`} />
                    <span className={`font-orbitron text-[10px] ${cam.status === "ONLINE" ? "text-[#AAFF00]" : "text-[#FF3333]"}`}>
                      {cam.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-ibm-thai text-[10px] text-[#444]">{cam.location}</span>
                  <span className="font-orbitron text-[10px] text-[#666]">
                    {cam.status === "ONLINE" ? cam.count.toLocaleString() : "— —"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
