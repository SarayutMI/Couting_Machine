type Status = "counting" | "scanning" | "offline" | "paused" | "standby";

const statusConfig: Record<Status, { color: string; label: string; pulse: boolean }> = {
  counting: { color: "#AAFF00", label: "COUNTING", pulse: true },
  scanning: { color: "#00AAFF", label: "SCANNING", pulse: true },
  offline: { color: "#FF3333", label: "OFFLINE", pulse: false },
  paused: { color: "#FFAA00", label: "PAUSED", pulse: false },
  standby: { color: "#666666", label: "STANDBY", pulse: false },
};

export function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status] ?? statusConfig.standby;
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full shrink-0 ${cfg.pulse ? "pulse-green" : ""}`}
        style={{ backgroundColor: cfg.color }}
      />
      <span className="font-orbitron text-[10px] tracking-wider" style={{ color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
  );
}
