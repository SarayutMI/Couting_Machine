interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: boolean;
}

export function StatCard({ label, value, sublabel, accent = true }: StatCardProps) {
  return (
    <div className="bg-[#111] border border-[#AAFF0033] rounded-lg p-6 relative overflow-hidden hover:shadow-[0_0_20px_rgba(170,255,0,0.1)] transition-all">
      {accent && <div className="absolute top-0 left-0 w-1 h-full bg-[#AAFF00]" />}
      <div className="font-orbitron text-[10px] text-[#444] tracking-[0.25em] mb-3">{label}</div>
      <div className="font-orbitron text-4xl font-black text-[#AAFF00] glow-green-text">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {sublabel && <div className="font-orbitron text-xs text-[#444] mt-2">{sublabel}</div>}
    </div>
  );
}
