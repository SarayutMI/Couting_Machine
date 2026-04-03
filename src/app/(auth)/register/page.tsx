"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", username: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, username: form.username, password: form.password }),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = { success: false, error: "Server error — database not connected." };
    try { data = await res.json(); } catch {}
    setLoading(false);

    if (!data.success) {
      setError(data.error || "Registration failed.");
    } else {
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen w-full flex scanline">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[60%] relative overflow-hidden bg-[#050505] flex-col">
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-blob absolute top-1/4 left-1/4 w-96 h-96 bg-[#AAFF00] opacity-20 blur-3xl" />
          <div className="animate-blob animation-delay-2000 absolute top-1/2 left-1/2 w-80 h-80 bg-[#88DD00] opacity-15 blur-3xl" />
          <div className="animate-blob animation-delay-4000 absolute bottom-1/4 left-1/3 w-72 h-72 bg-[#CCFF66] opacity-10 blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-[#AAFF00] flex items-center justify-center text-[#AAFF00] text-xs font-orbitron">⬡</div>
            <span className="font-orbitron text-sm text-[#AAFF00] tracking-widest">CAMCOUNT</span>
          </div>
          <div>
            <div className="text-[#AAFF00] font-orbitron text-xs tracking-[0.3em] mb-4">◆━━━━━━━━━━━━◆</div>
            <h1 className="font-orbitron text-4xl font-black text-white leading-tight mb-4">
              INSIGHT<br />INTELLIGENCE<br />LAB
            </h1>
            <p className="font-orbitron text-[#AAFF00] text-lg tracking-widest glow-green-text">
              Count. Detect. Analyze.
            </p>
            <div className="text-[#AAFF00] font-orbitron text-xs tracking-[0.3em] mt-4">◆━━━━━━━━━━━━◆</div>
          </div>
          <div className="text-[#333] font-orbitron text-xs tracking-widest">
            POWERED BY AI VISION SYSTEM v2.4
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[40%] bg-[#0A0A0A] flex items-center justify-center p-8">
        <div className="w-full max-w-[380px]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 border border-[#AAFF00] flex items-center justify-center text-[#AAFF00] text-sm">⬡</div>
              <span className="font-orbitron text-sm text-white tracking-widest">CREATE ACCOUNT</span>
            </div>
            <p className="font-ibm-thai text-[#666] text-sm">สร้างบัญชี</p>
          </div>

          {error && (
            <div className="mb-4 border border-[#FF333355] bg-[#FF333308] rounded px-4 py-2">
              <p className="font-orbitron text-xs text-[#FF3333]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-orbitron text-xs text-[#666] tracking-widest mb-2">USERNAME</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                required
                className="w-full bg-[#111] border border-[#222] rounded px-4 py-3 font-orbitron text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#AAFF00] focus:shadow-[0_0_10px_rgba(170,255,0,0.2)] transition-all"
              />
            </div>
            <div>
              <label className="block font-orbitron text-xs text-[#666] tracking-widest mb-2">EMAIL</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                className="w-full bg-[#111] border border-[#222] rounded px-4 py-3 font-orbitron text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#AAFF00] focus:shadow-[0_0_10px_rgba(170,255,0,0.2)] transition-all"
              />
            </div>
            <div>
              <label className="block font-orbitron text-xs text-[#666] tracking-widest mb-2">PASSWORD</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                className="w-full bg-[#111] border border-[#222] rounded px-4 py-3 font-orbitron text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#AAFF00] focus:shadow-[0_0_10px_rgba(170,255,0,0.2)] transition-all"
              />
            </div>
            <div>
              <label className="block font-orbitron text-xs text-[#666] tracking-widest mb-2">CONFIRM PASSWORD</label>
              <input
                type="password"
                value={form.confirm}
                onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                required
                className="w-full bg-[#111] border border-[#222] rounded px-4 py-3 font-orbitron text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#AAFF00] focus:shadow-[0_0_10px_rgba(170,255,0,0.2)] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-transparent border border-[#AAFF00] text-[#AAFF00] font-orbitron text-sm tracking-widest py-3 rounded hover:bg-[#AAFF0015] hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "CREATING ACCOUNT..." : <><span>▶</span> REGISTER</>}
            </button>
          </form>

          <div className="flex justify-center mt-6">
            <span className="font-ibm-thai text-xs text-[#444]">มีบัญชีแล้ว?&nbsp;</span>
            <Link href="/login" className="font-orbitron text-xs text-[#AAFF00] hover:underline tracking-wider">→ LOGIN</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
