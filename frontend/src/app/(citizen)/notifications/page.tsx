"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { notificationsApi } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";
import type { AppNotification } from "@/types";

export default function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const data = await notificationsApi.getAll({ limit: 50 });
      setItems(data.items);
      setUnreadCount(data.unread_count);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleMarkAllRead() {
    try {
      await notificationsApi.markAllAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  }

  async function handleMarkRead(id: string) {
    try {
      await notificationsApi.markAsRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated on your complaint status changes and alerts."
        action={
          unreadCount > 0 ? (
            <Button variant="outline" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-200 dark:bg-[var(--bg-surface-2)]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You'll be notified when your complaint status changes."
        />
      ) : (
        <div className="rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white divide-y divide-gray-100 dark:divide-[var(--border-subtle)]">
          {items.map((n) => (
            <button
              key={n.id}
              className="w-full text-left px-5 py-4 hover:bg-gray-50 dark:hover:bg-[var(--bg-surface-2)] transition-colors flex items-start gap-4"
              onClick={() => !n.isRead && handleMarkRead(n.id)}
            >
              <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.isRead ? "bg-transparent" : "bg-blue-500"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.isRead ? "text-gray-600 dark:text-[var(--text-muted)]" : "font-medium text-gray-900 dark:text-[var(--text-primary)]"}`}>
                  {n.message}
                </p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-[var(--text-muted)]">{formatRelativeTime(n.createdAt)}</p>
              </div>
              {!n.isRead && (
                <Badge variant="secondary" className="shrink-0 text-xs">New</Badge>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
