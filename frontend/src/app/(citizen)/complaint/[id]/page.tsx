"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { StatusBadge } from "@/components/complaints/StatusBadge";
import { ComplaintTimeline } from "@/components/complaints/ComplaintTimeline";
import { CommentForm } from "@/components/complaints/CommentForm";
import { MapWidget } from "@/components/complaints/MapWidget";
import { CloseComplaintButton } from "@/components/complaints/CloseComplaintButton";
import { complaintsApi } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Complaint } from "@/types";

export default function ComplaintDetailPage({ params }: { params: { id: string } }) {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintsApi.getById(params.id)
      .then(setComplaint)
      .catch(() => setComplaint(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-[var(--bg-surface-2)]" />
        ))}
      </div>
    );
  }

  if (!complaint) return notFound();

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Complaints", href: "/complaints" }, { label: complaint.trackingCode }]} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{complaint.title}</h1>
          <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] mt-1">Tracking Code: {complaint.trackingCode}</p>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="elev-1 bg-white rounded-lg border border-gray-200 dark:border-transparent p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">Complaint Details</h2>
            <p className="text-sm text-gray-600 dark:text-[var(--text-muted)]">{complaint.description}</p>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)]">Location</dt>
                <dd className="text-sm text-gray-700 dark:text-[var(--text-secondary)] mt-0.5">{complaint.location}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)]">Department</dt>
                <dd className="text-sm text-gray-700 dark:text-[var(--text-secondary)] mt-0.5">{complaint.departmentName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)]">Category</dt>
                <dd className="text-sm text-gray-700 dark:text-[var(--text-secondary)] mt-0.5">{complaint.categoryName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)]">Date Submitted</dt>
                <dd className="text-sm text-gray-700 dark:text-[var(--text-secondary)] mt-0.5">{formatDate(complaint.createdAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="elev-1 bg-white rounded-lg border border-gray-200 dark:border-transparent p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">Evidence &amp; Attachments</h2>
            {complaint.attachments.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {complaint.attachments.map((attachment) => (
                  <div key={attachment.id} className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-[var(--border-subtle)]">
                    <Image src={attachment.fileUrl} alt={attachment.fileName} fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">No attachments were submitted with this complaint.</p>
            )}
            <MapWidget location={complaint.location} latitude={complaint.latitude} longitude={complaint.longitude} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="elev-1 bg-white rounded-lg border border-gray-200 dark:border-transparent p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)] mb-4">Complaint History</h2>
            <ComplaintTimeline updates={complaint.updates} />
            <CommentForm
              complaintId={complaint.id}
              locked={complaint.status === "CLOSED" || complaint.status === "REJECTED"}
              onCommentAdded={setComplaint}
            />
          </div>

          {complaint.status === "RESOLVED" && (
            <div className="elev-1 bg-white rounded-lg border border-gray-200 dark:border-transparent p-6">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-[var(--text-secondary)] mb-2">Satisfied with the resolution?</h2>
              <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] mb-4">
                Closing the complaint confirms the issue has been resolved to your satisfaction.
              </p>
              <CloseComplaintButton
                complaintId={complaint.id}
                trackingCode={complaint.trackingCode}
                onClose={() => setComplaint((prev) => prev ? { ...prev, status: "CLOSED" } : prev)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
