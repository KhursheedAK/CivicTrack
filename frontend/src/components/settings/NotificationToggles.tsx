"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { authApi } from "@/lib/api";

export interface ToggleGroup {
  title?: string;
  items: { id: string; label: string; description: string; defaultChecked?: boolean }[];
}

interface NotificationTogglesProps {
  title?: string;
  groups: ToggleGroup[];
  showReset?: boolean;
  banner?: React.ReactNode;
}

export function NotificationToggles({ title = "Notifications", groups, showReset, banner }: NotificationTogglesProps) {
  const defaults = Object.fromEntries(
    groups.flatMap((g) => g.items.map((item) => [item.id, item.defaultChecked ?? true]))
  );
  const [values, setValues] = useState<Record<string, boolean>>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    authApi
      .getNotificationPreferences()
      .then((saved) => {
        if (cancelled) return;
        setValues((prev) => ({ ...prev, ...saved }));
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load notification preferences");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await authApi.updateNotificationPreferences(values);
      setValues((prev) => ({ ...prev, ...updated }));
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Failed to save notification preferences");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="elev-1 bg-white rounded-lg border border-gray-200 dark:border-transparent p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">{title}</h2>
      {groups.map((group) => (
        <div key={group.title ?? "default"} className="space-y-3">
          {group.title && <h3 className="text-sm font-semibold text-gray-700 dark:text-[var(--text-secondary)]">{group.title}</h3>}
          {group.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border border-gray-200 dark:border-[var(--border-subtle)] p-4">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">{item.description}</p>
              </div>
              <Switch
                checked={values[item.id]}
                disabled={loading}
                onCheckedChange={(checked) => setValues((prev) => ({ ...prev, [item.id]: checked }))}
                aria-label={`Toggle ${item.label}`}
              />
            </div>
          ))}
        </div>
      ))}

      {banner}

      <div className="flex justify-end gap-3">
        {showReset && (
          <Button type="button" variant="outline" disabled={loading || saving} onClick={() => setValues(defaults)}>
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
        )}
        <Button type="submit" disabled={loading || saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save {showReset ? "Changes" : "Preferences"}
        </Button>
      </div>
    </form>
  );
}
