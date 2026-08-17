"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, UserPlus, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { UsersTable } from "@/components/admin/UsersTable";
import { usersApi } from "@/lib/api";
import type { Role, User } from "@/types";

const PAGE_SIZE = 25;
const ROLES: Array<Role | "ALL"> = ["ALL", "CITIZEN", "OFFICER", "ADMIN"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = useCallback(async (p: number, q: string, r: Role | "ALL") => {
    setLoading(true);
    try {
      const data = await usersApi.getAll({
        page: p,
        limit: PAGE_SIZE,
        role: r === "ALL" ? undefined : r,
        search: q.trim() || undefined,
      });
      setUsers(data.items);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      load(1, search, role);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, role, load]);

  // When page changes (but not search/role — those reset to 1 above)
  useEffect(() => {
    load(page, search, role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function handleDeleteUser(userId: string) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    try {
      await usersApi.delete(userId);
      toast.success(`${user.name} removed.`);
      load(page, search, role);
    } catch {
      toast.error("Failed to remove user.");
    }
  }

  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage citizens, officers, and administrators."
        action={
          <Button asChild>
            <Link href="/admin/users/new">
              <UserPlus className="h-4 w-4" />
              Add User
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Total Users" value={total} icon={UsersRound} color="rose" />
        <StatCard label="Citizens" value={users.filter((u) => u.role === "CITIZEN").length} />
        <StatCard label="Officers" value={users.filter((u) => u.role === "OFFICER").length} />
        <StatCard label="Admins" value={users.filter((u) => u.role === "ADMIN").length} />
      </div>

      <div className="rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-200 dark:border-[var(--border-subtle)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerClassName="sm:w-80"
          />
          <div className="flex flex-wrap gap-2">
            {ROLES.map((item) => (
              <Button
                key={item}
                size="sm"
                variant={role === item ? "default" : "outline"}
                onClick={() => { setRole(item); setPage(1); }}
              >
                {item === "ALL" ? "All Roles" : item}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(8)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded-md bg-gray-100 dark:bg-[var(--bg-surface-2)]" />)}
          </div>
        ) : (
          <UsersTable users={users} onToggleStatus={handleDeleteUser} />
        )}

        {/* Pagination footer */}
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-[var(--border-subtle)] px-4 py-3">
          <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">
            {total === 0 ? "No users" : `${start}–${end} of ${total} users`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-[var(--text-muted)]">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
