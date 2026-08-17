"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, UserCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { complaintsApi, usersApi } from "@/lib/api";
import type { Complaint, User } from "@/types";

interface Props {
  complaint: Complaint;
  onAssigned: (updated: Complaint) => void;
}

export function AssignOfficerPanel({ complaint, onAssigned }: Props) {
  const [officers, setOfficers] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState<string>(complaint.assignedOfficerId ?? "");
  // Track what is actually saved so (current) label and disabled state stay correct
  const [savedOfficerId, setSavedOfficerId] = useState<string>(complaint.assignedOfficerId ?? "");
  const [saving, setSaving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (complaint.departmentId) {
      usersApi.getOfficersByDepartment(complaint.departmentId).then(setOfficers).catch(() => {});
    }
  }, [complaint.departmentId]);

  // Keep in sync if parent refreshes the complaint (e.g. after auto-assign on load)
  useEffect(() => {
    setSavedOfficerId(complaint.assignedOfficerId ?? "");
    setSelectedId(complaint.assignedOfficerId ?? "");
  }, [complaint.assignedOfficerId]);

  async function handleAssign() {
    if (!selectedId) return;
    setSaving(true);
    setError(null);
    try {
      await complaintsApi.assignOfficer(complaint.id, selectedId);
      setSavedOfficerId(selectedId);
      const updated = await complaintsApi.getById(complaint.id);
      onAssigned(updated);
    } catch {
      setError("Failed to assign officer. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRejectReassignment() {
    setRejecting(true);
    setError(null);
    try {
      const updated = await complaintsApi.rejectReassignment(complaint.id);
      onAssigned(updated);
    } catch {
      setError("Failed to reject reassignment request. Please try again.");
    } finally {
      setRejecting(false);
    }
  }

  const isReassign = !!savedOfficerId;
  const unchanged = selectedId === savedOfficerId;
  const locked = complaint.status === "CLOSED" || complaint.status === "REJECTED";
  const hasPendingRequest = complaint.reassignmentRequested === true;

  return (
    <div className="rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white p-6 space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">
        <UserCheck className="h-5 w-5 text-blue-600" />
        {isReassign ? "Reassign Officer" : "Assign Officer"}
      </h2>

      {/* ── Pending Reassignment Request Banner ── */}
      {hasPendingRequest && (
        <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Officer Requested Reassignment
              </p>
              {complaint.reassignmentReason && (
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                  <span className="font-medium">Reason:</span> &ldquo;{complaint.reassignmentReason}&rdquo;
                </p>
              )}
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-500">
                Select a new officer below and click <strong>Approve &amp; Assign</strong>, or click <strong>Reject</strong> to deny
                the request and keep the current assignment. Rejection permanently blocks further requests for this complaint.
              </p>
            </div>
          </div>

          {/* Reject button — inside the banner */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRejectReassignment}
              disabled={rejecting}
              className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
            >
              <XCircle className="h-4 w-4" />
              {rejecting ? "Rejecting…" : "Reject Request"}
            </Button>
          </div>
        </div>
      )}

      {locked ? (
        <p className="text-sm text-gray-400 dark:text-[var(--text-muted)]">
          Assignment is disabled for {complaint.status === "CLOSED" ? "closed" : "rejected"} complaints.
        </p>
      ) : officers.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">No officers in this department.</p>
      ) : (
        <div className="space-y-3">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-surface-2)] px-3 py-2 text-sm text-gray-700 dark:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Select an officer —</option>
            {officers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}{o.id === savedOfficerId ? " (current)" : ""}
              </option>
            ))}
          </select>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <Button
            onClick={handleAssign}
            disabled={!selectedId || unchanged || saving}
            className="w-full"
          >
            <CheckCircle2 className="h-4 w-4" />
            {saving
              ? "Saving…"
              : hasPendingRequest
              ? "Approve & Assign"
              : isReassign
              ? "Reassign"
              : "Assign"}
          </Button>
        </div>
      )}
    </div>
  );
}
