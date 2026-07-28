"use client";

import { cn } from "@/lib/utils";

interface FilterTabsProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterTabs({ options, value, onChange, className }: FilterTabsProps) {
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-[var(--bg-surface-2)] p-1", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === option.value
              ? "bg-white dark:bg-[var(--bg-surface-3)] text-gray-900 dark:text-[var(--brand-accent)] shadow-sm dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
              : "text-gray-600 dark:text-[var(--text-muted)] hover:text-gray-900 dark:hover:text-[var(--text-primary)]"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
