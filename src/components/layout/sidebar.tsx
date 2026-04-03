"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Camera, BarChart3, Settings, LogOut, Cpu } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "dashboard" },
  { href: "/cameras", icon: Camera, labelKey: "cameras" },
  { href: "/counts", icon: BarChart3, labelKey: "counts" },
  { href: "/settings", icon: Settings, labelKey: "settings" },
];

interface SidebarProps {
  locale?: string;
}

export function Sidebar({ locale = "en" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-16 lg:w-64 h-screen bg-card border-r border-border fixed left-0 top-0 z-40">
      <div className="flex items-center gap-3 p-4 h-16 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
          <Cpu size={20} />
        </div>
        <span className="hidden lg:block font-semibold text-sm truncate">
          {locale === "th" ? "เครื่องนับกล้อง" : "Counting Machine"}
        </span>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          const label = {
            dashboard: locale === "th" ? "แดชบอร์ด" : "Dashboard",
            cameras: locale === "th" ? "กล้อง" : "Cameras",
            counts: locale === "th" ? "ประวัติการนับ" : "Count History",
            settings: locale === "th" ? "การตั้งค่า" : "Settings",
          }[item.labelKey] || item.labelKey;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary glow-border"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span className="hidden lg:block">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="hidden lg:block">
            {locale === "th" ? "ออกจากระบบ" : "Logout"}
          </span>
        </button>
      </div>
    </aside>
  );
}
