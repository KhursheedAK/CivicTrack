import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-gray-300 dark:text-[var(--border-strong)]" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500 dark:text-[var(--text-muted)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
