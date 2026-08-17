"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, BarChart3, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComplaintsListView } from "@/components/complaints/ComplaintsListView";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { analyticsApi, type AnalyticsStats } from "@/lib/api";
import type { Complaint } from "@/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [recent, setRecent] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.getStats(), analyticsApi.getRecent()])
      .then(([s, r]) => {
        setStats(s);
        setRecent(r);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const urgent = recent.filter((c) => c.status === "SUBMITTED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="City-wide operational overview and recent complaint activity."
        action={
          <Button asChild>
            <Link href="/admin/users/new">Add User</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          label="Total Complaints"
          value={loading ? "—" : stats?.total ?? 0}
          icon={FileText}
          color="blue"
        />
        <StatCard
          label="Open Cases"
          value={loading ? "—" : stats?.open ?? 0}
          icon={BarChart3}
          color="orange"
        />
        <StatCard
          label="Urgent Intake"
          value={loading ? "—" : urgent}
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          label="Resolved"
          value={loading ? "—" : (stats?.resolved ?? 0) + (stats?.closed ?? 0)}
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {stats && (
        <div className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50 px-4 py-3 dark:border-[rgba(52,211,153,0.25)] dark:bg-[var(--success-bg)]">
          <p className="text-sm text-green-800 dark:text-[var(--text-primary)]">
            <span className="font-medium">Avg. Resolution Time:</span>{" "}
            <span className="dark:text-[var(--success)]">{stats.avg_resolution_days.toFixed(1)} days</span>
          </p>
          <Button size="sm" variant="outline" asChild>
            <Link href="/admin/complaints">View All Complaints</Link>
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">Recent Complaints</h2>
        <Link href="/admin/complaints" className="text-sm font-medium text-blue-600 dark:text-[var(--brand-accent)] hover:underline">
          View All
        </Link>
      </div>

      <ComplaintsListView complaints={recent} variant="officer" basePath="/admin/complaints" loading={loading} />
    </div>
  );
}
