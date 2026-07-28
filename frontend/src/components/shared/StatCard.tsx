import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatColor = "blue" | "green" | "amber" | "orange" | "violet" | "rose";

const COLOR_STYLES: Record<StatColor, string> = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  green: "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
};

const BORDER_STYLES: Record<StatColor, string> = {
  blue: "stat-border-blue",
  green: "stat-border-green",
  amber: "stat-border-amber",
  orange: "stat-border-orange",
  violet: "stat-border-violet",
  rose: "stat-border-rose",
};

interface StatCardProps {
  label: string;
  value: string | number;
  subNote?: string;
  icon?: LucideIcon;
  color?: StatColor;
  /** Escape hatch for a fully custom badge style; overrides `color`. */
  accentClassName?: string;
}

export function StatCard({ label, value, subNote, icon: Icon, color, accentClassName }: StatCardProps) {
  return (
    <div
      className={cn(
        "elev-1 elev-hover group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-transparent",
        BORDER_STYLES[color ?? "blue"]
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-[var(--text-muted)] dark:text-xs dark:uppercase dark:tracking-wide">{label}</p>
        {Icon && (
          <div className={cn("rounded-lg p-2.5 transition-transform group-hover:scale-105", accentClassName ?? COLOR_STYLES[color ?? "blue"])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-[var(--text-primary)] dark:text-4xl">{value}</p>
      {subNote && <p className="mt-1 text-xs text-gray-400 dark:text-[var(--text-muted)]">{subNote}</p>}
    </div>
  );
}
