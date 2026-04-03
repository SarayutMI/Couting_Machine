"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Camera } from "@/types";

const MOCK_CAMERAS: Camera[] = [
  { id: "1", name: "CAM-01", ip: "192.168.1.100", port: 8080, username: "admin", password: "", protocol: "ONVIF", status: "ONLINE", ownerId: "", createdAt: new Date(), updatedAt: new Date() },
  { id: "2", name: "CAM-02", ip: "192.168.1.101", port: 8080, username: "admin", password: "", protocol: "ONVIF", status: "ONLINE", ownerId: "", createdAt: new Date(), updatedAt: new Date() },
  { id: "3", name: "CAM-03", ip: "192.168.1.102", port: 8080, username: "admin", password: "", protocol: "RTSP", status: "OFFLINE", ownerId: "", createdAt: new Date(), updatedAt: new Date() },
];

export default function CamerasPage() {
  const { toast } = useToast();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", ip: "", port: "8080", username: "", password: "", protocol: "ONVIF" });

  const loadCameras = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cameras");
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setCameras(data.data);
      } else {
        setCameras(MOCK_CAMERAS);
      }
    } catch {
      setCameras(MOCK_CAMERAS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCameras(); }, [loadCameras]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/cameras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, port: parseInt(form.port) }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Camera added" });
        setShowAdd(false);
        setForm({ name: "", ip: "", port: "8080", username: "", password: "", protocol: "ONVIF" });
        loadCameras();
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not connect to server.", variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/cameras/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Camera deleted" });
        loadCameras();
      }
    } catch {
      toast({ title: "Error", description: "Could not delete camera.", variant: "destructive" });
    }
  }

  const statusColor: Record<string, string> = {
    ONLINE: "#AAFF00",
    OFFLINE: "#FF3333",
    ERROR: "#FFAA00",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-orbitron text-[10px] text-[#444] tracking-[0.3em] mb-1">◆ SYSTEM</div>
          <h1 className="font-orbitron text-2xl font-black text-white tracking-wider">CAMERA MANAGEMENT</h1>
          <p className="font-ibm-thai text-sm text-[#444] mt-1">จัดการกล้อง</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="font-orbitron text-xs tracking-wider border border-[#AAFF00] text-[#AAFF00] px-4 py-2 rounded hover:bg-[#AAFF0015] hover:shadow-[0_0_15px_rgba(170,255,0,0.2)] transition-all flex items-center gap-2"
        >
          <span>+</span> ADD CAMERA
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-[#111] border border-[#AAFF0033] rounded-lg p-6">
          <div className="font-orbitron text-xs text-[#444] tracking-[0.3em] mb-4">NEW CAMERA</div>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "CAMERA NAME", key: "name", type: "text" },
              { label: "IP ADDRESS", key: "ip", type: "text" },
              { label: "PORT", key: "port", type: "number" },
              { label: "PROTOCOL", key: "protocol", type: "text" },
              { label: "USERNAME", key: "username", type: "text" },
              { label: "PASSWORD", key: "password", type: "password" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block font-orbitron text-[10px] text-[#444] tracking-widest mb-2">{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  required={field.key !== "password"}
                  className="w-full bg-[#0A0A0A] border border-[#222] rounded px-3 py-2 font-orbitron text-sm text-white focus:outline-none focus:border-[#AAFF00] transition-all"
                />
              </div>
            ))}
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="font-orbitron text-xs tracking-wider border border-[#AAFF00] text-[#AAFF00] px-4 py-2 rounded hover:bg-[#AAFF0015] transition-all">
                SAVE
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="font-orbitron text-xs tracking-wider border border-[#222] text-[#444] px-4 py-2 rounded hover:border-[#444] transition-all">
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Camera Cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#AAFF00] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {cameras.map((cam) => (
            <div key={cam.id} className="bg-[#111] border border-[#AAFF0033] rounded-lg p-5 border-l-4 hover:shadow-[0_0_20px_rgba(170,255,0,0.08)] transition-all" style={{ borderLeftColor: statusColor[cam.status] ?? "#222" }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border border-[#AAFF0033] flex items-center justify-center text-[#AAFF00] text-sm rounded">⬡</div>
                  <div>
                    <div className="font-orbitron text-sm font-bold text-white">{cam.name}</div>
                    <div className="font-ibm-thai text-xs text-[#444]">Entrance Gate</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor[cam.status] ?? "#666" }} />
                  <span className="font-orbitron text-xs" style={{ color: statusColor[cam.status] ?? "#666" }}>{cam.status}</span>
                </div>
              </div>
              <div className="flex gap-6 mb-4">
                <span className="font-orbitron text-[10px] text-[#444]">IP: <span className="text-white">{cam.ip}</span></span>
                <span className="font-orbitron text-[10px] text-[#444]">PORT: <span className="text-white">{cam.port}</span></span>
                <span className="font-orbitron text-[10px] text-[#444]">PROTOCOL: <span className="text-white">{cam.protocol}</span></span>
              </div>
              <div className="flex gap-2">
                <button type="button" aria-label={`Start counting on ${cam.name}`} className="font-orbitron text-[10px] tracking-wider border border-[#AAFF0055] text-[#AAFF00] px-3 py-1.5 rounded hover:bg-[#AAFF0010] transition-all">
                  ▶ START COUNTING
                </button>
                <button type="button" aria-label={`Snapshot from ${cam.name}`} className="font-orbitron text-[10px] tracking-wider border border-[#222] text-[#444] px-3 py-1.5 rounded hover:border-[#AAFF00] hover:text-[#AAFF00] transition-all">
                  📸 SNAPSHOT
                </button>
                <button type="button" aria-label={`Edit ${cam.name}`} className="font-orbitron text-[10px] tracking-wider border border-[#222] text-[#444] px-3 py-1.5 rounded hover:border-[#AAFF00] hover:text-[#AAFF00] transition-all">
                  ✏ EDIT
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${cam.name}`}
                  onClick={() => handleDelete(cam.id)}
                  className="font-orbitron text-[10px] tracking-wider border border-[#FF333333] text-[#FF3333] px-3 py-1.5 rounded hover:bg-[#FF333310] transition-all ml-auto"
                >
                  🗑 DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
