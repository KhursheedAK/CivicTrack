"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { dataCorrectionsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import type { DataCorrectionRequest, DataCorrectionStatus } from "@/types";

const STATUS_STYLES: Record<DataCorrectionStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 pill-warning",
  APPROVED: "bg-green-100 text-green-800 pill-success",
  REJECTED: "bg-red-100 text-red-800 pill-danger",
};

export function MyCorrectionRequests() {
  const [items, setItems] = useState<DataCorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    dataCorrectionsApi
      .getMine()
      .then((data) => {
        if (!cancelled) setItems(data.items);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-[var(--text-muted)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading your requests...
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="text-sm text-gray-400 dark:text-[var(--text-muted)]">You haven&apos;t submitted any correction requests yet.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-gray-200 dark:border-[var(--border-subtle)] p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-gray-900 dark:text-[var(--text-primary)]">
              {item.complaint ? `Complaint #${item.complaint.trackingCode}` : "Your profile"} —{" "}
              {item.fieldsFlagged.join(", ")}
            </p>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                STATUS_STYLES[item.status]
              )}
            >
              {item.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-[var(--text-muted)]">{formatRelativeTime(item.createdAt)}</p>
          {item.status !== "PENDING" && item.adminNotes && (
            <p className="mt-1 text-xs text-gray-500 dark:text-[var(--text-muted)]">Admin note: {item.adminNotes}</p>
          )}
        </div>
      ))}
    </div>
  );
}
