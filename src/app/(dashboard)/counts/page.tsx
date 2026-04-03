"use client";

import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CountRecord } from "@/types";

export default function CountsPage() {
  const [records, setRecords] = useState<CountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ cameraId: "", from: "", to: "" });

  async function loadRecords() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.cameraId) params.set("cameraId", filter.cameraId);
    if (filter.from) params.set("from", filter.from);
    if (filter.to) params.set("to", filter.to);

    const res = await fetch(`/api/counts?${params}`);
    const data = await res.json();
    if (data.success) setRecords(data.data);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadRecords(); }, []);

  function exportCsv() {
    const header = "id,cameraId,count,timestamp\n";
    const rows = records.map((r) => `${r.id},${r.cameraId},${r.count},${r.timestamp}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `counts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Count History</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadRecords}>
            <RefreshCw size={16} />
          </Button>
          <Button variant="outline" onClick={exportCsv} disabled={records.length === 0}>
            <Download size={16} className="mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Camera ID</Label>
            <Input
              placeholder="Filter by camera ID"
              value={filter.cameraId}
              onChange={(e) => setFilter((f) => ({ ...f, cameraId: e.target.value }))}
            />
          </div>
          <div>
            <Label>From</Label>
            <Input
              type="datetime-local"
              value={filter.from}
              onChange={(e) => setFilter((f) => ({ ...f, from: e.target.value }))}
            />
          </div>
          <div>
            <Label>To</Label>
            <Input
              type="datetime-local"
              value={filter.to}
              onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value }))}
            />
          </div>
        </div>
        <Button className="mt-4" onClick={loadRecords}>Apply Filter</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
          No count records found.
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 text-muted-foreground font-medium">Camera ID</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Count</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-xs">{r.cameraId}</td>
                  <td className="p-4 font-mono font-bold text-primary">{r.count.toLocaleString()}</td>
                  <td className="p-4 text-muted-foreground">{new Date(r.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
