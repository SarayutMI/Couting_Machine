import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  span?: "1" | "2" | "3" | "4";
  rowSpan?: "1" | "2";
}

export function BentoCard({ children, className, glow = false, span, rowSpan }: BentoCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-xl p-4 transition-all duration-300",
        glow && "glow-border",
        span === "2" && "md:col-span-2",
        span === "3" && "md:col-span-3",
        span === "4" && "col-span-full",
        rowSpan === "2" && "row-span-2",
        className
      )}
    >
      {children}
    </div>
  );
}
