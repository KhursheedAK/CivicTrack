import { Progress } from "@/components/ui/progress";

export function CapacityBar({ label, value, target }: { label: string; value: number; target: number }) {
  const percent = Math.min(100, Math.round((value / target) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-[var(--text-muted)]">{label}</span>
        <span className="font-medium text-gray-900 dark:text-[var(--text-primary)]">{percent}%</span>
      </div>
      <Progress value={percent} />
      <p className="text-xs text-gray-400 dark:text-[var(--text-muted)]">
        {value} of {target} target staffing
      </p>
    </div>
  );
}
