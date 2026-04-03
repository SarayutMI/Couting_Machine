"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    label: "SYSTEM",
    items: [
      { href: "/dashboard", icon: "◈", label: "OVERVIEW", labelTh: "ภาพรวม" },
      { href: "/counting", icon: "⚡", label: "COUNTING", labelTh: "นับ" },
      { href: "/cameras", icon: "📷", label: "CAMERAS", labelTh: "กล้อง" },
    ],
  },
  {
    label: "DATA",
    items: [
      { href: "/counts", icon: "📊", label: "HISTORY", labelTh: "ประวัติ" },
    ],
  },
  {
    label: "CONFIG",
    items: [
      { href: "/settings", icon: "⚙", label: "SETTINGS", labelTh: "ตั้งค่า" },
    ],
  },
];

interface SidebarProps {
  locale?: string;
}

export function Sidebar({ locale = "en" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-16 lg:w-[220px] h-screen bg-[#0A0A0A] border-r border-[#AAFF0033] fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-[#AAFF0033]">
        <div className="w-8 h-8 border border-[#AAFF00] flex items-center justify-center text-[#AAFF00] text-sm shrink-0">⬡</div>
        <span className="hidden lg:block font-orbitron text-sm text-white tracking-widest truncate">CAMCOUNT</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            <div className="hidden lg:block px-3 py-2 font-orbitron text-[10px] text-[#333] tracking-[0.3em]">
              {section.label}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200 mb-0.5",
                    isActive
                      ? "bg-[#AAFF0015] text-[#AAFF00] border-l-2 border-[#AAFF00] shadow-[0_0_10px_rgba(170,255,0,0.1)]"
                      : "text-[#666] hover:bg-[#AAFF0008] hover:text-[#AAFF00] border-l-2 border-transparent"
                  )}
                >
                  <span className="shrink-0 text-base">{item.icon}</span>
                  <span className="hidden lg:block font-orbitron text-xs tracking-wider truncate">
                    {locale === "th" ? item.labelTh : item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Status + Logout */}
      <div className="p-2 border-t border-[#AAFF0033]">
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-[#AAFF00] animate-pulse-green shrink-0" />
          <span className="font-orbitron text-[10px] text-[#AAFF00] tracking-widest">SYSTEM ONLINE</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded text-sm text-[#444] hover:bg-[#FF333310] hover:text-[#FF3333] transition-all"
        >
          <span className="shrink-0">⏻</span>
          <span className="hidden lg:block font-orbitron text-xs tracking-wider">
            {locale === "th" ? "ออกจากระบบ" : "LOGOUT"}
          </span>
        </button>
      </div>
    </aside>
  );
}
