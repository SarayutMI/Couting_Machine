"use client";

import { Moon, Sun, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    <header className="fixed top-0 right-0 left-16 lg:left-64 h-16 bg-card border-b border-border z-30 flex items-center justify-between px-4">
      <div>
        {isDemo && (
          <span className="inline-flex items-center rounded-md border border-cyan-400 bg-cyan-400/10 px-2 py-0.5 text-xs font-semibold text-cyan-300">
            DEMO
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">EN</Label>
          <Switch
            checked={locale === "th"}
            onCheckedChange={(checked) => onLocaleChange(checked ? "th" : "en")}
          />
          <Label className="text-xs text-muted-foreground">TH</Label>
        </div>
        <div className="flex items-center gap-2">
          <Sun size={14} className="text-muted-foreground" />
          <Switch
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
          <Moon size={14} className="text-muted-foreground" />
        </div>
        <Button variant="ghost" size="icon">
          <Bell size={18} />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.image ?? ""} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
