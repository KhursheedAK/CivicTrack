"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SidebarContent } from "@/components/layout/Sidebar";
import type { Role, User } from "@/types";

interface MobileSidebarProps {
  role: Role;
  user: User;
}

export function MobileSidebar({ role, user }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open navigation menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5 text-gray-600 dark:text-[var(--text-muted)]" />
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-gray-950/30 transition-opacity duration-200 dark:bg-black/50",
            open ? "opacity-100" : "opacity-0"
          )}
          aria-label="Close navigation menu"
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            "relative flex h-full w-72 max-w-[85vw] flex-col border-r border-gray-200 bg-white shadow-xl transition-transform duration-200 ease-out dark:border-[var(--border-subtle)] dark:bg-[var(--bg-chrome)]",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5 text-gray-600 dark:text-[var(--text-muted)]" />
          </Button>
          <SidebarContent role={role} user={user} onNavigate={() => setOpen(false)} />
        </aside>
      </div>
    </>
  );
}
