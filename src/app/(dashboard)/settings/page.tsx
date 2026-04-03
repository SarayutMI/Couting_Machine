"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

const TABS = [
  { id: "account", label: "ACCOUNT", labelTh: "บัญชี" },
  { id: "appearance", label: "APPEARANCE", labelTh: "รูปแบบ" },
  { id: "language", label: "LANGUAGE", labelTh: "ภาษา" },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState("en");

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    toast({ title: "Password changed", description: "Your password has been updated." });
    setPasswords({ current: "", new: "", confirm: "" });
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="font-orbitron text-[10px] text-[#444] tracking-[0.3em] mb-1">◆ CONFIG</div>
        <h1 className="font-orbitron text-2xl font-black text-white tracking-wider">SETTINGS</h1>
      </div>

      <div className="flex gap-6">
        {/* Tab nav */}
        <div className="w-48 shrink-0">
          <div className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded font-orbitron text-xs tracking-wider transition-all border-l-2 ${
                  activeTab === tab.id
                    ? "border-[#AAFF00] text-[#AAFF00] bg-[#AAFF0010]"
                    : "border-transparent text-[#444] hover:text-[#AAFF00] hover:bg-[#AAFF0008]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1">
          {activeTab === "account" && (
            <div className="space-y-4">
              {/* Profile */}
              <div className="bg-[#111] border border-[#AAFF0033] rounded-lg p-6">
                <div className="font-orbitron text-[10px] text-[#444] tracking-[0.3em] mb-4">PROFILE</div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#AAFF0020] border border-[#AAFF0055] flex items-center justify-center font-orbitron text-xl text-[#AAFF00]">
                    {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                  <div>
                    <div className="font-orbitron text-sm text-white">{session?.user?.name ?? "DEMO USER"}</div>
                    <div className="font-orbitron text-xs text-[#444]">{session?.user?.email ?? "demo@camcount.com"}</div>
                  </div>
                </div>
              </div>

              {/* Change password */}
              <div className="bg-[#111] border border-[#AAFF0033] rounded-lg p-6">
                <div className="font-orbitron text-[10px] text-[#444] tracking-[0.3em] mb-4">CHANGE PASSWORD</div>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {[
                    { label: "CURRENT PASSWORD", key: "current" },
                    { label: "NEW PASSWORD", key: "new" },
                    { label: "CONFIRM NEW PASSWORD", key: "confirm" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block font-orbitron text-[10px] text-[#444] tracking-widest mb-2">{f.label}</label>
                      <input
                        type="password"
                        value={passwords[f.key as keyof typeof passwords]}
                        onChange={(e) => setPasswords((p) => ({ ...p, [f.key]: e.target.value }))}
                        required
                        className="w-full bg-[#0A0A0A] border border-[#222] rounded px-4 py-3 font-orbitron text-sm text-white focus:outline-none focus:border-[#AAFF00] transition-all"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={saving}
                    className="font-orbitron text-xs tracking-wider border border-[#AAFF00] text-[#AAFF00] px-4 py-2 rounded hover:bg-[#AAFF0015] hover:shadow-[0_0_15px_rgba(170,255,0,0.2)] transition-all disabled:opacity-50"
                  >
                    {saving ? "SAVING..." : "▶ UPDATE PASSWORD"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="bg-[#111] border border-[#AAFF0033] rounded-lg p-6 space-y-4">
              <div className="font-orbitron text-[10px] text-[#444] tracking-[0.3em] mb-4">APPEARANCE</div>
              <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]">
                <div>
                  <div className="font-orbitron text-xs text-white">THEME</div>
                  <div className="font-ibm-thai text-xs text-[#444] mt-0.5">รูปแบบสีของหน้าจอ</div>
                </div>
                <div className="flex gap-2">
                  {["DARK", "LIGHT"].map((t) => (
                    <button key={t} className={`font-orbitron text-[10px] tracking-wider px-3 py-1.5 rounded border transition-all ${t === "DARK" ? "border-[#AAFF00] text-[#AAFF00] bg-[#AAFF0010]" : "border-[#222] text-[#444]"}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-orbitron text-xs text-white">ACCENT COLOR</div>
                  <div className="font-ibm-thai text-xs text-[#444] mt-0.5">สีเน้น</div>
                </div>
                <div className="flex gap-2">
                  {["#AAFF00", "#00AAFF", "#FF6600", "#FF3399"].map((color) => (
                    <div key={color} className={`w-6 h-6 rounded-full cursor-pointer border-2 ${color === "#AAFF00" ? "border-white" : "border-transparent"}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "language" && (
            <div className="bg-[#111] border border-[#AAFF0033] rounded-lg p-6">
              <div className="font-orbitron text-[10px] text-[#444] tracking-[0.3em] mb-4">LANGUAGE / ภาษา</div>
              <div className="flex gap-3">
                {[{ code: "en", label: "ENGLISH", labelTh: "อังกฤษ" }, { code: "th", label: "ไทย", labelTh: "Thai" }].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`flex-1 py-4 rounded border font-orbitron text-sm tracking-wider transition-all ${lang === l.code ? "border-[#AAFF00] text-[#AAFF00] bg-[#AAFF0010]" : "border-[#222] text-[#444] hover:border-[#AAFF0055]"}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
