"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#AAFF00] border-t-transparent rounded-full animate-spin" />
          <span className="font-orbitron text-xs text-[#AAFF00] tracking-widest">LOADING...</span>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] scanline">
      <Sidebar locale={locale} />
      <Topbar locale={locale} onLocaleChange={setLocale} user={session.user} />
      <main className="ml-16 lg:ml-[220px] pt-14 min-h-screen">{children}</main>
    </div>
  );
}
