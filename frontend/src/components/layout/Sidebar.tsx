"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MapPin,
  Settings,
  Building2,
  Tag,
  Users,
  LogOut,
  ShieldCheck,
  Home,
  ClipboardEdit,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import type { Role, User } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  CITIZEN: [
    { label: "Home", href: "/", icon: Home },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Complaints", href: "/complaints", icon: FileText },
    { label: "Track Complaints", href: "/track", icon: MapPin },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  OFFICER: [
    { label: "Home", href: "/", icon: Home },
    { label: "Dashboard", href: "/officer/dashboard", icon: LayoutDashboard },
    { label: "Track Complaints", href: "/track", icon: MapPin },
    { label: "Settings", href: "/officer/settings", icon: Settings },
  ],
  ADMIN: [
    { label: "Home", href: "/", icon: Home },
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Complaints", href: "/admin/complaints", icon: FileText },
    { label: "Departments", href: "/admin/departments", icon: Building2 },
    { label: "Categories", href: "/admin/categories", icon: Tag },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Data Corrections", href: "/admin/data-corrections", icon: ClipboardEdit },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

const ROLE_ACCENT: Record<Role, { active: string; bar: string; icon: string }> = {
  CITIZEN: { active: "bg-blue-50 text-blue-700 dark:bg-[var(--bg-surface-2)] dark:text-[var(--brand-accent)]", bar: "bg-blue-600 dark:bg-[var(--brand-accent)]", icon: "text-blue-600 dark:text-[var(--brand-accent)]" },
  OFFICER: { active: "bg-blue-50 text-blue-700 dark:bg-[var(--bg-surface-2)] dark:text-[var(--brand-accent)]", bar: "bg-blue-600 dark:bg-[var(--brand-accent)]", icon: "text-blue-600 dark:text-[var(--brand-accent)]" },
  ADMIN: { active: "bg-blue-50 text-blue-700 dark:bg-[var(--bg-surface-2)] dark:text-[var(--brand-accent)]", bar: "bg-blue-600 dark:bg-[var(--brand-accent)]", icon: "text-blue-600 dark:text-[var(--brand-accent)]" },
};

const ROLE_LABEL: Record<Role, string> = {
  CITIZEN: "Citizen Portal",
  OFFICER: "Officer Portal",
  ADMIN: "Admin Portal",
};

interface SidebarContentProps {
  role: Role;
  user: User;
  onNavigate?: () => void;
}

export function SidebarContent({ role, user, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const accent = ROLE_ACCENT[role];
  const items = NAV_ITEMS[role];

  return (
    <>
      <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-200 dark:border-[var(--border-subtle)]">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-md text-white", accent.bar)}>
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-[var(--text-primary)]">CivicTrack</p>
          <p className="text-xs text-gray-400 dark:text-[var(--text-muted)]">{ROLE_LABEL[role]}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? accent.active : "text-gray-600 hover:bg-gray-50 dark:text-[var(--text-muted)] dark:hover:bg-[var(--bg-surface-2-50)]"
              )}
            >
              {isActive && <span className={cn("absolute left-0 top-1 bottom-1 w-0.5 dark:w-[3px] rounded-r", accent.bar)} />}
              <item.icon className={cn("h-4 w-4", isActive ? accent.icon : "text-gray-400 dark:text-[var(--text-muted)]")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4 dark:border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700 dark:bg-[var(--bg-surface-2)] dark:text-[var(--text-secondary)]">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">{user.name}</p>
            <p className="truncate text-xs text-gray-400 dark:text-[var(--text-muted)]">
              {role === "CITIZEN" ? "Citizen" : role.charAt(0) + role.slice(1).toLowerCase()}
            </p>
          </div>
          <button
            onClick={() => { onNavigate?.(); logout(); }}
            className="text-gray-400 hover:text-gray-600 dark:text-[var(--text-muted)] dark:hover:text-[var(--text-secondary)]"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}

export function Sidebar({ role, user }: { role: Role; user: User }) {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col border-r border-gray-200 bg-white dark:border-[var(--border-subtle)] dark:bg-[var(--bg-chrome)]">
      <SidebarContent role={role} user={user} />
    </aside>
  );
}
