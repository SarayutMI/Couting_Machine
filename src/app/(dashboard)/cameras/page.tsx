"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCw, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CameraStatusBadge } from "@/components/camera/camera-status-badge";
import { useToast } from "@/components/ui/use-toast";
import type { Camera } from "@/types";

export default function CamerasPage() {
  const { toast } = useToast();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", ip: "", port: "80", username: "", password: "", protocol: "ONVIF" });

  async function loadCameras() {
    setLoading(true);
    const res = await fetch("/api/cameras");
    const data = await res.json();
    if (data.success) setCameras(data.data);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadCameras(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/cameras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, port: parseInt(form.port) }),
    });
    const data = await res.json();
    if (data.success) {
      toast({ title: "Camera added" });
      setShowAdd(false);
      setForm({ name: "", ip: "", port: "80", username: "", password: "", protocol: "ONVIF" });
      loadCameras();
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/cameras/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast({ title: "Camera deleted" });
      loadCameras();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cameras</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadCameras}>
            <RefreshCw size={16} />
          </Button>
          <Button onClick={() => setShowAdd(!showAdd)}>
            <Plus size={16} className="mr-2" /> Add Camera
          </Button>
        </div>
      </div>

      {showAdd && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Add Camera</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Camera Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <Label>IP Address</Label>
              <Input value={form.ip} onChange={(e) => setForm((f) => ({ ...f, ip: e.target.value }))} required />
            </div>
            <div>
              <Label>Port</Label>
              <Input type="number" value={form.port} onChange={(e) => setForm((f) => ({ ...f, port: e.target.value }))} />
            </div>
            <div>
              <Label>Protocol</Label>
              <Input value={form.protocol} onChange={(e) => setForm((f) => ({ ...f, protocol: e.target.value }))} />
            </div>
            <div>
              <Label>Username</Label>
              <Input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} required />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : cameras.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
          No cameras added yet. Click &quot;Add Camera&quot; to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cameras.map((cam) => (
            <div key={cam.id} className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{cam.name}</h3>
                  <p className="text-xs text-muted-foreground">{cam.ip}:{cam.port}</p>
                </div>
                <CameraStatusBadge status={cam.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{cam.protocol}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Edit size={12} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(cam.id)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
