"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Home, Camera, Zap, BarChart2, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Home, label: "HOME", labelTh: "หน้าหลัก" },
  { href: "/counting", icon: Zap, label: "COUNT", labelTh: "นับ" },
  { href: "/cameras", icon: Camera, label: "CAMS", labelTh: "กล้อง" },
  { href: "/counts", icon: BarChart2, label: "HISTORY", labelTh: "ประวัติ" },
  { href: "/settings", icon: Settings, label: "CONFIG", labelTh: "ตั้งค่า" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#AAFF00] border-t-transparent rounded-full animate-spin" />
          <span className="font-orbitron text-[10px] text-[#AAFF00] tracking-widest">LOADING...</span>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0A0A0A] flex flex-col">
      {/* TOP BAR — compact 48px */}
      <header className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-[#AAFF0022] bg-[#0A0A0A]/95 backdrop-blur-xl z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 border border-[#AAFF00] rounded flex items-center justify-center text-[#AAFF00] font-orbitron text-[10px] font-black">
            IIL
          </div>
          <span className="font-orbitron text-xs font-bold text-white tracking-wider hidden sm:block">
            CAMCOUNT
          </span>
        </div>
        <span className="font-orbitron text-[10px] text-[#AAFF00] tracking-widest hidden md:block">
          INSIGHT INTELLIGENCE LAB
        </span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#AAFF00] animate-pulse" />
          <span className="font-orbitron text-[10px] text-[#666]">
            {session.user?.name || "DEMO"}
          </span>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR — icon only on tablet, full on desktop, hidden on mobile */}
        <aside className="hidden md:flex flex-col w-14 lg:w-[180px] shrink-0 border-r border-[#AAFF0022] bg-[#0A0A0A] pt-2 pb-4">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 mx-2 px-2 py-2.5 rounded-xl mb-1 transition-all group
                  ${active
                    ? "bg-[#AAFF0015] border border-[#AAFF0044] text-[#AAFF00]"
                    : "text-[#444] hover:text-[#AAFF00] hover:bg-[#AAFF0008]"
                  }`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="font-orbitron text-[10px] tracking-wider hidden lg:block">{label}</span>
              </Link>
            );
          })}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* BOTTOM NAV — mobile only */}
      <nav className="md:hidden flex items-center justify-around h-14 shrink-0 border-t border-[#AAFF0022] bg-[#0A0A0A]/95 backdrop-blur-xl">
        {NAV_ITEMS.map(({ href, icon: Icon, labelTh }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all
                ${active ? "text-[#AAFF00]" : "text-[#444]"}`}
            >
              <Icon size={20} />
              <span className="font-ibm-thai text-[9px]">{labelTh}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
