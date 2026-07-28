import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import type { User } from "@/types";

interface TopbarProps {
  user: User;
  action?: React.ReactNode;
}

export function Topbar({ user, action }: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-[var(--border-subtle)] dark:bg-[var(--bg-chrome)] sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <MobileSidebar role={user.role} user={user} />
        <p className="text-sm font-semibold text-gray-900 dark:text-[var(--text-primary)]">CivicTrack</p>
      </div>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Help">
          <HelpCircle className="h-5 w-5 text-gray-500 dark:text-[var(--text-muted)]" />
        </Button>
        <NotificationBell />
        {action}
      </div>
    </header>
  );
}
