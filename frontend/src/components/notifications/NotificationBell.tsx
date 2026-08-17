"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/format";
import { notificationsApi } from "@/lib/api";
import type { AppNotification } from "@/types";

export function NotificationBell() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.getAll({ limit: 20 });
      setItems(data.items);
      setUnreadCount(data.unread_count);
    } catch {
      // silently fail — user may not be logged in yet
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

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
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5 text-gray-500 dark:text-[var(--text-muted)]" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unreadCount > 0 && (
            <button
              className="text-xs font-normal text-blue-600 dark:text-[var(--brand-accent)] hover:underline"
              onClick={handleMarkAllRead}
            >
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-gray-500 dark:text-[var(--text-muted)]">No notifications</p>
        ) : (
          items.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex flex-col items-start gap-0.5 whitespace-normal py-2 cursor-pointer"
              onClick={() => !n.isRead && handleMarkRead(n.id)}
            >
              <span className={n.isRead ? "text-gray-600 dark:text-[var(--text-muted)]" : "font-medium text-gray-900 dark:text-[var(--text-primary)]"}>
                {n.message}
              </span>
              <span className="text-xs text-gray-400 dark:text-[var(--text-muted)]">{formatRelativeTime(n.createdAt)}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
