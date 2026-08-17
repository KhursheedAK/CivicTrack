"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { complaintsApi } from "@/lib/api";
import type { ComplaintStatus } from "@/types";

const NEXT_ACTIONS: Partial<Record<ComplaintStatus, { label: string; next: ComplaintStatus }[]>> = {
  SUBMITTED: [{ label: "Move to Under Review", next: "UNDER_REVIEW" }],
  UNDER_REVIEW: [
    { label: "Start Progress", next: "IN_PROGRESS" },
    { label: "Reject", next: "REJECTED" },
  ],
  IN_PROGRESS: [{ label: "Mark Resolved", next: "RESOLVED" }],
  RESOLVED: [{ label: "Close Complaint", next: "CLOSED" }],
};

const ALL_STATUSES: { label: string; value: ComplaintStatus }[] = [
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
  { label: "Rejected", value: "REJECTED" },
];

interface StatusUpdatePanelProps {
  complaintId: string;
  currentStatus: ComplaintStatus;
  allowAllTransitions?: boolean;
  onStatusChange?: (newStatus: ComplaintStatus) => void;
  disabled?: boolean;
}

export function StatusUpdatePanel({
  complaintId,
  currentStatus,
  allowAllTransitions = false,
  onStatusChange,
  disabled = false,
}: StatusUpdatePanelProps) {
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState<ComplaintStatus | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<ComplaintStatus | "">("");
  const actions = NEXT_ACTIONS[currentStatus] ?? [];

  async function handleUpdate(next: ComplaintStatus) {
    if (next === "REJECTED" && comment.trim().length < 10) {
      toast.error("Please add a clear rejection reason (at least 10 characters).");
      return;
    }
    setSaving(next);
    try {
      await complaintsApi.updateStatus(complaintId, next, comment.trim() || undefined);
      toast.success(`Status updated to ${next.replace(/_/g, " ")}`);
      setComment("");
      setOverrideStatus("");
      onStatusChange?.(next);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to update status.";
      toast.error(msg);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">Status Action</h2>
      {disabled ? (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          This complaint is frozen pending admin review of your reassignment request. You cannot change its status.
        </p>
      ) : actions.length === 0 && !allowAllTransitions ? (
        <p className="mt-2 text-sm text-gray-500 dark:text-[var(--text-muted)]">No action available for this status.</p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="status-comment">Comment</Label>
            <Textarea
              id="status-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add an update for the citizen timeline"
              disabled={disabled}
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {actions.map((action) => (
              <Button
                key={action.next}
                type="button"
                variant={action.next === "REJECTED" ? "destructive" : "default"}
                disabled={saving !== null || disabled}
                onClick={() => handleUpdate(action.next)}
              >
                {saving === action.next && <Loader2 className="h-4 w-4 animate-spin" />}
                {action.label}
              </Button>
            ))}
          </div>

          {allowAllTransitions && (
            <div className="space-y-2 border-t border-gray-100 dark:border-[var(--border-subtle)] pt-4">
              <Label htmlFor="status-override">Admin Override</Label>
              <div className="flex flex-wrap gap-2">
                <Select value={overrideStatus} onValueChange={(v) => setOverrideStatus(v as ComplaintStatus)} disabled={disabled}>
                  <SelectTrigger id="status-override" className="w-full sm:w-56">
                    <SelectValue placeholder="Set status to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STATUSES.filter((s) => s.value !== currentStatus).map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving !== null || !overrideStatus || disabled}
                  onClick={() => overrideStatus && handleUpdate(overrideStatus)}
                >
                  {saving !== null && saving === overrideStatus && <Loader2 className="h-4 w-4 animate-spin" />}
                  Apply Override
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
