import { cn } from "@/lib/utils";
import { getStatusBadgeStyle, resolveLeadStatus } from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const resolvedStatus = resolveLeadStatus(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        getStatusBadgeStyle(status),
        className
      )}
    >
      {resolvedStatus}
    </span>
  );
}
