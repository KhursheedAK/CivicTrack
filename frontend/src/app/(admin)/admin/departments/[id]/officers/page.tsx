"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, UserCheck, UserPlus, UsersRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { CapacityBar } from "@/components/shared/CapacityBar";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { UserStatusBadge } from "@/components/shared/UserStatusBadge";
import { departmentsApi, usersApi } from "@/lib/api";
import { formatDate, getInitials } from "@/lib/format";
import type { Department, User } from "@/types";

export default function ManageDepartmentOfficersPage() {
  const params = useParams<{ id: string }>();
  const [department, setDepartment] = useState<Department | null>(null);
  const [officers, setOfficers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound404, setNotFound404] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [depts, officersRes] = await Promise.all([
          departmentsApi.getAllForAdmin(),
          usersApi.getAll({ role: "OFFICER", department_id: params.id, limit: 100 }),
        ]);
        const dept = depts.find((d) => d.id === params.id);
        if (!dept) { setNotFound404(true); return; }
        setDepartment(dept);
        setOfficers(officersRes.items);
      } catch {
        setNotFound404(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-[var(--text-muted)]">Loading...</div>;
  if (notFound404 || !department) return notFound();

  const active = officers.filter((o) => o.status === "ACTIVE").length;
  const pending = officers.filter((o) => o.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Departments", href: "/admin/departments" }, { label: department.name }, { label: "Officers" }]} />
      <PageHeader
        title="Manage Department Officers"
        description={`Staffing and access for ${department.name}.`}
        action={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button asChild>
              <Link href="/admin/users/new">
                <UserPlus className="h-4 w-4" />
                Add Officer
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total Officers" value={officers.length} icon={UsersRound} color="rose" />
        <StatCard label="Active Duty" value={active} icon={UserCheck} color="green" />
        <StatCard label="Pending Approval" value={pending} icon={UserPlus} color="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white lg:col-span-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[var(--text-muted)]">Officer</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[var(--text-muted)]">Status</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[var(--text-muted)]">Joined</TableHead>
                <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[var(--text-muted)]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {officers.map((officer) => (
                <TableRow key={officer.id} className="hover:bg-gray-50 dark:hover:bg-[var(--bg-surface-2)]">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{getInitials(officer.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-[var(--text-primary)]">{officer.name}</p>
                        <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">{officer.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <UserStatusBadge status={officer.status} />
                  </TableCell>
                  <TableCell className="text-gray-500 dark:text-[var(--text-muted)]">{formatDate(officer.joinedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/users/${officer.id}/edit`}>Manage</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="space-y-4 rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">Department Policy</h2>
          <CapacityBar label="Staffing capacity" value={active} target={5} />
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-500 dark:text-[var(--text-muted)]">SLA adherence</span>
              <span className="font-medium text-gray-900 dark:text-[var(--text-primary)]">88%</span>
            </div>
            <Progress value={88} />
          </div>
          <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">
            Target staffing is five active officers for high-volume departments.
          </p>
        </div>
      </div>
    </div>
  );
}
