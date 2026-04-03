import { cn } from "@/lib/utils";

type Status = "ONLINE" | "OFFLINE" | "ERROR";

interface CameraStatusBadgeProps {
  status: Status;
  locale?: string;
}

const labels: Record<Status, Record<string, string>> = {
  ONLINE: { en: "Online", th: "ออนไลน์" },
  OFFLINE: { en: "Offline", th: "ออฟไลน์" },
  ERROR: { en: "Error", th: "ข้อผิดพลาด" },
};

export function CameraStatusBadge({ status, locale = "en" }: CameraStatusBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "w-2 h-2 rounded-full shrink-0",
          status === "ONLINE" && "online-indicator animate-pulse",
          status === "OFFLINE" && "offline-indicator",
          status === "ERROR" && "bg-yellow-500"
        )}
      />
      <span
        className={cn(
          "text-xs font-medium",
          status === "ONLINE" && "text-green-500",
          status === "OFFLINE" && "text-red-500",
          status === "ERROR" && "text-yellow-500"
        )}
      >
        {labels[status][locale]}
      </span>
    </div>
  );
}
