"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, FileText, Loader2, Mail, MapPin, Phone, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb, type BreadcrumbItem } from "@/components/shared/Breadcrumb";
import { StatCard } from "@/components/shared/StatCard";
import { UserStatusBadge } from "@/components/shared/UserStatusBadge";
import { ComplaintsListView } from "@/components/complaints/ComplaintsListView";
import { usersApi } from "@/lib/api";
import type { Complaint, User } from "@/types";

interface ReporterProfileViewProps {
  citizen: User;
  citizenComplaints: Complaint[];
  breadcrumbItems: BreadcrumbItem[];
  basePath: string;
  /** Admins can block/unblock citizens; officers can only view. */
  variant: "officer" | "admin";
}

export function ReporterProfileView({ citizen, citizenComplaints, breadcrumbItems, basePath, variant }: ReporterProfileViewProps) {
  const [isBlocked, setIsBlocked] = useState(Boolean(citizen.isBlocked));
  const [saving, setSaving] = useState(false);

  const resolved = citizenComplaints.filter((complaint) => ["RESOLVED", "CLOSED"].includes(complaint.status)).length;
  const successRate = citizenComplaints.length ? Math.round((resolved / citizenComplaints.length) * 100) : 0;

  async function toggleBlock() {
    const next = !isBlocked;
    setSaving(true);
    try {
      await usersApi.update(citizen.id, { is_blocked: next });
      setIsBlocked(next);
      toast.success(
        next
          ? `${citizen.name} has been blocked from submitting new complaints or comments.`
          : `${citizen.name} has been unblocked.`,
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to update block status.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{citizen.name}</h1>
            <UserStatusBadge status={citizen.status} />
            {isBlocked && (
              <span className="pill-danger inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                <ShieldX className="h-3 w-3" />
                Blocked
              </span>
            )}
          </div>
          {citizen.address && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-[var(--text-muted)]">
              <MapPin className="h-3.5 w-3.5" />
              {citizen.address}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`mailto:${citizen.email}`}>
              <Mail className="h-4 w-4" />
              Contact Reporter
            </Link>
          </Button>
          {variant === "admin" && (
            <Button variant={isBlocked ? "outline" : "destructive"} disabled={saving} onClick={toggleBlock}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isBlocked ? (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Unblock User
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4" />
                  Block User
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">Contact Information</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)]">
              <Mail className="h-3.5 w-3.5" />
              Email
            </dt>
            <dd className="mt-0.5 text-sm text-gray-700 dark:text-[var(--text-secondary)]">{citizen.email}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)]">
              <Phone className="h-3.5 w-3.5" />
              Phone
            </dt>
            <dd className="mt-0.5 text-sm text-gray-700 dark:text-[var(--text-secondary)]">{citizen.phone ?? "Not provided"}</dd>
          </div>
        </dl>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total Complaints" value={citizenComplaints.length} icon={FileText} />
        <StatCard label="Resolved" value={resolved} icon={CheckCircle2} color="green" />
        <StatCard label="Success Rate" value={`${successRate}%`} icon={ShieldCheck} color="violet" />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">Complaint History</h2>
        <ComplaintsListView complaints={citizenComplaints} variant="officer" basePath={basePath} />
      </div>
    </div>
  );
}
