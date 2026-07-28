import { cn } from "@/lib/utils";
import type { UserStatus } from "@/types";

const STATUS_STYLES: Record<UserStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
  INACTIVE: "bg-gray-100 text-gray-600 dark:bg-[var(--bg-surface-2)] dark:text-[var(--text-secondary)]",
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
};

export function UserStatusBadge({ status, className }: { status: UserStatus; className?: string }) {
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className
      )}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
