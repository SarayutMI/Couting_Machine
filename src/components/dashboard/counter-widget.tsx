"use client";

import { useEffect, useState } from "react";
import { BentoCard } from "@/components/bento/bento-card";
import { cn } from "@/lib/utils";

interface CounterWidgetProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
  glow?: boolean;
}

function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

export function CounterWidget({ label, value, icon, color = "text-primary", glow }: CounterWidgetProps) {
  const animatedValue = useCountUp(value);

  return (
    <BentoCard glow={glow}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
          {icon && <span className={cn("opacity-70", color)}>{icon}</span>}
        </div>
        <div className={cn("text-4xl lg:text-5xl font-mono font-bold counter-number animate-count-up", color)}>
          {animatedValue.toLocaleString()}
        </div>
      </div>
    </BentoCard>
  );
}
