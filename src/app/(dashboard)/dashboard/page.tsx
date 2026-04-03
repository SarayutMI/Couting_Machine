"use client";

import { useEffect, useState } from "react";
import { Users, Camera, TrendingUp, Activity } from "lucide-react";
import { CounterWidget } from "@/components/dashboard/counter-widget";
import { BentoCard } from "@/components/bento/bento-card";
import type { DashboardStats } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCameras: 0,
    onlineCameras: 0,
    totalCountToday: 0,
    totalCountThisHour: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="bento-grid">
        <CounterWidget
          label="Today's Count"
          value={stats.totalCountToday}
          icon={<TrendingUp size={20} />}
          color="text-primary"
          glow
        />
        <CounterWidget
          label="This Hour"
          value={stats.totalCountThisHour}
          icon={<Activity size={20} />}
          color="text-cyan-400"
        />
        <CounterWidget
          label="Online Cameras"
          value={stats.onlineCameras}
          icon={<Camera size={20} />}
          color="text-green-500"
        />
        <CounterWidget
          label="Total Cameras"
          value={stats.totalCameras}
          icon={<Users size={20} />}
          color="text-muted-foreground"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BentoCard span="2">
          <h2 className="text-lg font-semibold mb-4">Count History (24h)</h2>
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            Chart visualization coming soon
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
