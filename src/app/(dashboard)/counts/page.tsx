"use client";

import { useEffect, useState, useCallback } from "react";
import type { CountRecord } from "@/types";

const MOCK_RECORDS: CountRecord[] = [
  { id: "1", cameraId: "CAM-01", count: 4832, timestamp: new Date("2024-01-15T14:32:01") },
  { id: "2", cameraId: "CAM-01", count: 4831, timestamp: new Date("2024-01-15T14:31:58") },
  { id: "3", cameraId: "CAM-02", count: 892, timestamp: new Date("2024-01-15T14:30:00") },
  { id: "4", cameraId: "CAM-01", count: 4828, timestamp: new Date("2024-01-15T14:28:00") },
];

export default function CountsPage() {
  const [records, setRecords] = useState<CountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ cameraId: "", from: "", to: "" });

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.cameraId) params.set("cameraId", filter.cameraId);
      if (filter.from) params.set("from", filter.from);
      if (filter.to) params.set("to", filter.to);
      const res = await fetch(`/api/counts?${params}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setRecords(data.data);
      } else {
        setRecords(MOCK_RECORDS);
      }
    } catch {
      setRecords(MOCK_RECORDS);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  function exportCsv() {
    const header = "id,cameraId,count,timestamp\n";
    const rows = records.map((r) => `${r.id},${r.cameraId},${r.count},${r.timestamp instanceof Date ? r.timestamp.toISOString() : r.timestamp}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `counts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-orbitron text-[10px] text-[#444] tracking-[0.3em] mb-1">◆ DATA</div>
          <h1 className="font-orbitron text-2xl font-black text-white tracking-wider">COUNT HISTORY</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} disabled={records.length === 0} className="font-orbitron text-[10px] tracking-wider border border-[#AAFF0055] text-[#AAFF00] px-3 py-2 rounded hover:bg-[#AAFF0010] transition-all disabled:opacity-30 flex items-center gap-2">
            📥 EXPORT CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#111] border border-[#AAFF0033] rounded-lg p-4">
        <div className="font-orbitron text-[10px] text-[#444] tracking-[0.3em] mb-4">FILTER</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block font-orbitron text-[10px] text-[#444] tracking-widest mb-2">CAMERA</label>
            <input
              placeholder="All cameras"
              value={filter.cameraId}
              onChange={(e) => setFilter((f) => ({ ...f, cameraId: e.target.value }))}
              className="w-full bg-[#0A0A0A] border border-[#222] rounded px-3 py-2 font-orbitron text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#AAFF00] transition-all"
            />
          </div>
          <div>
            <label className="block font-orbitron text-[10px] text-[#444] tracking-widest mb-2">FROM</label>
            <input
              type="datetime-local"
              value={filter.from}
              onChange={(e) => setFilter((f) => ({ ...f, from: e.target.value }))}
              className="w-full bg-[#0A0A0A] border border-[#222] rounded px-3 py-2 font-orbitron text-sm text-white focus:outline-none focus:border-[#AAFF00] transition-all"
            />
          </div>
          <div>
            <label className="block font-orbitron text-[10px] text-[#444] tracking-widest mb-2">TO</label>
            <input
              type="datetime-local"
              value={filter.to}
              onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value }))}
              className="w-full bg-[#0A0A0A] border border-[#222] rounded px-3 py-2 font-orbitron text-sm text-white focus:outline-none focus:border-[#AAFF00] transition-all"
            />
          </div>
          <div className="flex items-end">
            <button onClick={loadRecords} className="w-full font-orbitron text-[10px] tracking-wider border border-[#AAFF0055] text-[#AAFF00] px-3 py-2 rounded hover:bg-[#AAFF0010] transition-all">
              🔍 SEARCH
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#AAFF00] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-[#111] border border-[#AAFF0033] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-[#AAFF0033]">
              <tr>
                {["TIME", "CAMERA", "COUNT", "TIMESTAMP"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-orbitron text-[10px] text-[#444] tracking-[0.2em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center font-orbitron text-xs text-[#333]">NO RECORDS FOUND</td>
                </tr>
              ) : records.map((r, i) => {
                const ts = r.timestamp instanceof Date ? r.timestamp : new Date(r.timestamp);
                return (
                  <tr key={r.id} className={`border-b border-[#1A1A1A] hover:bg-[#AAFF0005] transition-colors ${i === 0 ? "bg-[#AAFF0008]" : ""}`}>
                    <td className="px-4 py-3 font-orbitron text-xs text-[#666]">
                      {ts.toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 font-orbitron text-xs text-white">{r.cameraId}</td>
                    <td className="px-4 py-3 font-orbitron text-xs font-bold text-[#AAFF00] glow-green-text">
                      {r.count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-orbitron text-xs text-[#444]">
                      {ts.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
