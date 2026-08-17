import { cn } from "@/lib/utils";
import type { ComplaintStatus } from "@/types";

const STATUS_LABELS: Record<ComplaintStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REJECTED: "Rejected",
};

const STATUS_STYLES: Record<ComplaintStatus, string> = {
  SUBMITTED: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
  UNDER_REVIEW: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  IN_PROGRESS: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-400",
  RESOLVED: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
  CLOSED: "bg-gray-100 text-gray-600 dark:bg-[var(--bg-surface-2)] dark:text-[var(--text-secondary)]",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
};

export function StatusBadge({ status, className }: { status: ComplaintStatus; className?: string }) {
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
