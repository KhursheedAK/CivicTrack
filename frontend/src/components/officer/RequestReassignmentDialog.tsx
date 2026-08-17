"use client";

import { useState } from "react";
import { ArrowRightLeft, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { complaintsApi } from "@/lib/api";
import type { Complaint } from "@/types";

interface Props {
  complaint: Complaint;
  onReassigned: (updated: Complaint) => void;
}

export function RequestReassignmentDialog({ complaint, onReassigned }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Complaint is permanently blocked from further reassignment requests
  if (complaint.reassignmentRejected) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500 dark:text-red-400" />
        <div>
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">Reassignment Request Rejected</p>
          <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
            An admin has rejected your reassignment request. No further requests can be made for this complaint.
          </p>
        </div>
      </div>
    );
  }

  // A request is already pending — complaint is frozen
  if (complaint.reassignmentRequested) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400" />
        <div>
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Reassignment Pending Admin Review</p>
          <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
            Your request is awaiting admin action. This complaint is currently frozen — you cannot update its status until
            the admin approves or rejects the request.
          </p>
          {complaint.reassignmentReason && (
            <p className="mt-1.5 text-xs italic text-amber-600 dark:text-amber-400">
              Reason stated: &ldquo;{complaint.reassignmentReason}&rdquo;
            </p>
          )}
        </div>
      </div>
    );
  }

  // Closed / rejected complaints — don't show the button at all
  if (complaint.status === "CLOSED" || complaint.status === "REJECTED") {
    return null;
  }

  async function handleSubmit() {
    if (!reason.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await complaintsApi.requestReassignment(complaint.id, reason.trim());
      onReassigned(updated);
      setOpen(false);
      setReason("");
    } catch {
      setError("Failed to submit reassignment request. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <ArrowRightLeft className="h-4 w-4" />
        Request Reassignment
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Request Reassignment</h3>
        <p className="mt-0.5 text-xs text-blue-600 dark:text-blue-400">
          Provide a reason. An admin will review your request and assign another officer if approved. You will not be
          able to update this complaint&apos;s status while the request is pending.
        </p>
      </div>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for requesting reassignment…"
        rows={3}
        maxLength={500}
        className="w-full rounded-md border border-gray-300 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-surface-2)] px-3 py-2 text-sm text-gray-700 dark:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <p className="text-right text-xs text-gray-400">{reason.length}/500</p>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!reason.trim() || saving}
          size="sm"
          className="flex-1"
        >
          {saving ? "Submitting…" : "Submit Request"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => { setOpen(false); setReason(""); }}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
