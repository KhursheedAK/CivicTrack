"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ComplaintTimeline } from "@/components/complaints/ComplaintTimeline";
import { CommentForm } from "@/components/complaints/CommentForm";
import { MapWidget } from "@/components/complaints/MapWidget";
import { StatusBadge } from "@/components/complaints/StatusBadge";
import { StatusUpdatePanel } from "@/components/officer/StatusUpdatePanel";
import { AssignOfficerPanel } from "@/components/admin/AssignOfficerPanel";
import { complaintsApi } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Complaint, ComplaintStatus } from "@/types";

export default function AdminComplaintDetailPage({ params }: { params: { id: string } }) {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintsApi.getById(params.id)
      .then(setComplaint)
      .catch(() => setComplaint(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  function handleStatusChange(newStatus: ComplaintStatus) {
    setComplaint((prev) => prev ? { ...prev, status: newStatus } : prev);
    complaintsApi.getById(params.id).then(setComplaint).catch(console.error);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-[var(--bg-surface-2)]" />)}
      </div>
    );
  }

  if (!complaint) return notFound();

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Complaints", href: "/admin/complaints" }, { label: complaint.trackingCode }]} />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{complaint.title}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-[var(--text-muted)]">Tracking Code: {complaint.trackingCode}</p>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">Complaint Details</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-[var(--text-muted)]">{complaint.description}</p>
              </div>
              {complaint.citizenId && (
                <Button asChild variant="outline">
                  <Link href={`/admin/citizens/${complaint.citizenId}`}>
                    <UserRound className="h-4 w-4" />
                    Reporter Profile
                  </Link>
                </Button>
              )}
            </div>
            <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)]">Citizen</dt>
                <dd className="mt-0.5 text-sm text-gray-700 dark:text-[var(--text-secondary)]">{complaint.citizenName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)]">Location</dt>
                <dd className="mt-0.5 text-sm text-gray-700 dark:text-[var(--text-secondary)]">{complaint.location}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)]">Department</dt>
                <dd className="mt-0.5 text-sm text-gray-700 dark:text-[var(--text-secondary)]">{complaint.departmentName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)]">Category</dt>
                <dd className="mt-0.5 text-sm text-gray-700 dark:text-[var(--text-secondary)]">{complaint.categoryName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)]">Assigned Officer</dt>
                <dd className="mt-0.5 text-sm text-gray-700 dark:text-[var(--text-secondary)]">{complaint.assignedOfficerName ?? "Unassigned"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)]">Submitted</dt>
                <dd className="mt-0.5 text-sm text-gray-700 dark:text-[var(--text-secondary)]">{formatDate(complaint.createdAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">Evidence &amp; Location</h2>
            {complaint.attachments.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {complaint.attachments.map((attachment) => (
                  <div key={attachment.id} className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-[var(--border-subtle)]">
                    <Image src={attachment.fileUrl} alt={attachment.fileName} fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <MapWidget location={complaint.location} latitude={complaint.latitude} longitude={complaint.longitude} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <AssignOfficerPanel complaint={complaint} onAssigned={setComplaint} />
          <StatusUpdatePanel
            complaintId={complaint.id}
            currentStatus={complaint.status}
            allowAllTransitions
            onStatusChange={handleStatusChange}
          />
          <div className="rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">Timeline</h2>
            <ComplaintTimeline updates={complaint.updates} />
            <CommentForm
              complaintId={complaint.id}
              locked={complaint.status === "CLOSED" || complaint.status === "REJECTED"}
              onCommentAdded={setComplaint}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
