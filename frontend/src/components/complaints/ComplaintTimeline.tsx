import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import type { ComplaintStatus, ComplaintUpdate } from "@/types";

const DOT_STYLES: Record<ComplaintStatus, string> = {
  SUBMITTED: "bg-blue-500",
  UNDER_REVIEW: "bg-amber-500",
  IN_PROGRESS: "bg-orange-500",
  RESOLVED: "bg-green-500",
  CLOSED: "bg-gray-400 dark:bg-[var(--bg-surface-3)]",
  REJECTED: "bg-red-500",
};

const STATUS_TITLES: Record<ComplaintStatus, string> = {
  SUBMITTED: "Complaint Submitted",
  UNDER_REVIEW: "Status: Under Review",
  IN_PROGRESS: "Status: In Progress",
  RESOLVED: "Status: Resolved",
  CLOSED: "Status: Closed",
  REJECTED: "Status: Rejected",
};

const ROLE_LABELS: Record<string, string> = {
  CITIZEN: "Citizen",
  OFFICER: "Municipal Team",
  ADMIN: "Admin Officer",
};

interface ComplaintTimelineProps {
  updates: ComplaintUpdate[];
  showAuthor?: boolean;
}

export function ComplaintTimeline({ updates, showAuthor = true }: ComplaintTimelineProps) {
  return (
    <ol className="space-y-6">
      {updates.map((update, index) => {
        const isStatusChange = update.statusChangedTo !== null;
        const dotColor = isStatusChange ? DOT_STYLES[update.statusChangedTo!] : "bg-gray-300 dark:bg-[var(--bg-surface-3)]";
        const isLast = index === updates.length - 1;
        return (
          <li key={update.id} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "h-3 w-3 rounded-full ring-4 ring-white dark:ring-[var(--bg-surface)] dark:shadow-[0_0_10px_var(--brand-accent-glow)]",
                  dotColor
                )}
              />
              {!isLast && <span className="mt-1 w-px flex-1 bg-gray-200 dark:bg-[var(--bg-surface-2)]" />}
            </div>
            <div className={cn("pb-1", !isLast && "pb-6")}>
              <p className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">
                {isStatusChange ? STATUS_TITLES[update.statusChangedTo!] : "Comment"}
              </p>
              <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] mt-0.5">{formatDateTime(update.createdAt)}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-[var(--text-muted)]">
                {showAuthor && (
                  <span className="font-medium text-gray-700 dark:text-[var(--text-secondary)]">
                    {ROLE_LABELS[update.authorRole] ?? update.authorName}:{" "}
                  </span>
                )}
                {update.comment}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
