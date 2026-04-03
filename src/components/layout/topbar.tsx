"use client";

import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface TopbarProps {
  locale: string;
  onLocaleChange: (locale: string) => void;
  user?: { name?: string | null; email?: string | null; image?: string | null; id?: string | null };
}

export function Topbar({ locale, onLocaleChange, user }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const isDemo = user?.id === "demo" || user?.email === "demo@camcount.com";

  return (
    <header className="fixed top-0 right-0 left-16 lg:left-[220px] h-14 bg-[#0A0A0A] border-b border-[#AAFF0033] z-30 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        {isDemo && (
          <span className="inline-flex items-center border border-[#AAFF0055] bg-[#AAFF0010] px-2 py-0.5 font-orbitron text-[10px] text-[#AAFF00] tracking-widest rounded">
            DEMO MODE
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Language toggle */}
        <div className="flex items-center gap-2">
          <span className={cn("font-orbitron text-[10px] tracking-widest transition-colors", locale === "en" ? "text-[#AAFF00]" : "text-[#444]")}>EN</span>
          <Switch
            checked={locale === "th"}
            onCheckedChange={(checked) => onLocaleChange(checked ? "th" : "en")}
            className="data-[state=checked]:bg-[#AAFF00] data-[state=unchecked]:bg-[#222]"
          />
          <span className={cn("font-ibm-thai text-[10px] tracking-widest transition-colors", locale === "th" ? "text-[#AAFF00]" : "text-[#444]")}>TH</span>
        </div>
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="w-8 h-8 border border-[#222] rounded flex items-center justify-center text-[#444] hover:border-[#AAFF00] hover:text-[#AAFF00] transition-all font-orbitron text-xs"
        >
          {isDark ? "🌙" : "☀️"}
        </button>
        {/* User */}
        <div className="flex items-center gap-2 border border-[#222] rounded px-3 py-1.5">
          <div className="w-6 h-6 rounded-full bg-[#AAFF0020] border border-[#AAFF0055] flex items-center justify-center text-[#AAFF00] font-orbitron text-xs">
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <span className="hidden lg:block font-orbitron text-xs text-[#666] tracking-wider">
            {user?.name ?? user?.email?.split("@")[0] ?? "USER"}
          </span>
        </div>
      </div>
    </header>
  );
}
