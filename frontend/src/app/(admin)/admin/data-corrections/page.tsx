"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataCorrectionReviewDialog } from "@/components/admin/DataCorrectionReviewDialog";
import { dataCorrectionsApi } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DataCorrectionRequest, DataCorrectionStatus } from "@/types";

const STATUS_STYLES: Record<DataCorrectionStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 pill-warning",
  APPROVED: "bg-green-100 text-green-800 pill-success",
  REJECTED: "bg-red-100 text-red-800 pill-danger",
};

const FILTERS: { label: string; value: DataCorrectionStatus | "ALL" }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "All", value: "ALL" },
];

export default function AdminDataCorrectionsPage() {
  const [filter, setFilter] = useState<DataCorrectionStatus | "ALL">("PENDING");
  const [items, setItems] = useState<DataCorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<DataCorrectionRequest | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    dataCorrectionsApi
      .getAll(filter === "ALL" ? undefined : filter)
      .then((data) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Correction Requests"
        description="Review corrections officers have flagged on complaints or their own profile."
      />

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              filter === f.value
                ? "bg-blue-50 text-blue-700 dark:bg-[var(--brand-accent-glow)] dark:text-[var(--brand-accent)]"
                : "text-gray-600 dark:text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--bg-surface-2)]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="elev-1 overflow-hidden rounded-lg border border-gray-200 dark:border-transparent bg-white">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-400 dark:text-[var(--text-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading requests...
          </div>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500 dark:text-[var(--text-muted)]">No requests here.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-base)] text-xs uppercase tracking-wider text-gray-500 dark:text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3">Requested By</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Fields</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-[var(--border-subtle)] last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-[var(--text-primary)]">{item.requestedBy.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-[var(--text-muted)]">
                    {item.complaint ? `#${item.complaint.trackingCode}` : "Own profile"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-[var(--text-muted)]">{item.fieldsFlagged.join(", ")}</td>
                  <td className="px-4 py-3 text-gray-400 dark:text-[var(--text-muted)]">{formatRelativeTime(item.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_STYLES[item.status])}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => setReviewing(item)}>
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {reviewing && (
        <DataCorrectionReviewDialog
          request={reviewing}
          open={!!reviewing}
          onOpenChange={(open) => !open && setReviewing(null)}
          onResolved={load}
        />
      )}
    </div>
  );
}
