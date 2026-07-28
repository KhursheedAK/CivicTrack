"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/format";

export function PublicHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-[var(--border-subtle)] dark:bg-[var(--bg-chrome)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold text-blue-600 dark:text-blue-400">
          CivicTrack
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-[var(--text-muted)] dark:hover:text-[var(--text-primary)]">
            Home
          </Link>
          {user && (
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-[var(--text-muted)] dark:hover:text-[var(--text-primary)]">
              Dashboard
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <NotificationBell />
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700 dark:bg-[var(--bg-surface-2)] dark:text-[var(--text-secondary)]">
                {getInitials(user.name)}
              </div>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">Log In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
