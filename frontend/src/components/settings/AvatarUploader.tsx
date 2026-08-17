"use client";

import { getInitials } from "@/lib/format";
import { Button } from "@/components/ui/button";

export function AvatarUploader({ name, label = "Photo" }: { name: string; label?: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-[var(--bg-surface-2)] text-lg font-semibold text-gray-700 dark:text-[var(--text-secondary)]">
        {getInitials(name)}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)]">{label}</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm">
            Change Photo
          </Button>
          <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:text-red-700 dark:text-[var(--danger)] dark:hover:text-[var(--danger)]">
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
