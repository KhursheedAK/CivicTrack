"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dataCorrectionsApi, departmentsApi, categoriesApi, complaintsApi } from "@/lib/api";
import type { ApproveDataCorrectionPayload } from "@/lib/api";
import type { DataCorrectionRequest, Department, Category } from "@/types";

interface DataCorrectionReviewDialogProps {
  request: DataCorrectionRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolved: () => void;
}

export function DataCorrectionReviewDialog({
  request,
  open,
  onOpenChange,
  onResolved,
}: DataCorrectionReviewDialogProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [name, setName] = useState("");
  const [ownDepartmentId, setOwnDepartmentId] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingDefaults, setLoadingDefaults] = useState(true);

  const flags = request.fieldsFlagged;
  const isComplaint = request.targetType === "COMPLAINT";
  const isPending = request.status === "PENDING";

  useEffect(() => {
    if (!open) return;
    setLoadingDefaults(true);
    departmentsApi.getAllForAdmin().then(setDepartments).catch(() => setDepartments([]));

    if (isComplaint && request.complaint) {
      complaintsApi
        .getById(request.complaint.id)
        .then((full) => {
          setTitle(full.title);
          setDescription(full.description);
          setLocation(full.location);
          setDepartmentId(full.departmentId);
          setCategoryId(full.categoryId);
        })
        .finally(() => setLoadingDefaults(false));
    } else {
      setName(request.requestedBy.name);
      setLoadingDefaults(false);
    }
  }, [open, isComplaint, request]);

  useEffect(() => {
    const deptForCategories = isComplaint ? departmentId : undefined;
    if (!deptForCategories) {
      setCategories([]);
      return;
    }
    categoriesApi.getAll(deptForCategories).then(setCategories).catch(() => setCategories([]));
  }, [departmentId, isComplaint]);

  async function handleApprove() {
    setSubmitting(true);
    try {
      const payload: ApproveDataCorrectionPayload = { admin_notes: adminNotes || undefined };
      if (isComplaint) {
        if (flags.includes("title")) payload.title = title;
        if (flags.includes("description")) payload.description = description;
        if (flags.includes("location")) payload.location = location;
        if (flags.includes("department")) payload.department_id = departmentId;
        if (flags.includes("category")) payload.category_id = categoryId;
      } else {
        if (flags.includes("name")) payload.name = name;
        if (flags.includes("own_department")) payload.own_department_id = ownDepartmentId || null;
      }
      await dataCorrectionsApi.approve(request.id, payload);
      toast.success("Correction approved and applied");
      onResolved();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to approve request";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!rejectNotes.trim()) {
      toast.error("A reason is required to reject a request");
      return;
    }
    setSubmitting(true);
    try {
      await dataCorrectionsApi.reject(request.id, rejectNotes);
      toast.success("Correction request rejected");
      onResolved();
      onOpenChange(false);
    } catch {
      toast.error("Failed to reject request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Review Correction Request</DialogTitle>
          <DialogDescription>
            Requested by {request.requestedBy.name} —{" "}
            {request.complaint ? `complaint #${request.complaint.trackingCode}` : "own profile"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)]">Current (per officer)</p>
            <p className="mt-0.5 whitespace-pre-line text-gray-700 dark:text-[var(--text-secondary)]">{request.currentData}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)]">Requested correction</p>
            <p className="mt-0.5 whitespace-pre-line text-gray-700 dark:text-[var(--text-secondary)]">{request.requestedCorrection}</p>
          </div>
        </div>

        {!isPending ? (
          <div className="rounded-lg border border-gray-200 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-base)] p-3 text-sm text-gray-600 dark:text-[var(--text-muted)]">
            This request was already <strong>{request.status.toLowerCase()}</strong>
            {request.resolvedByName ? ` by ${request.resolvedByName}` : ""}.
            {request.adminNotes && <p className="mt-1">Note: {request.adminNotes}</p>}
          </div>
        ) : loadingDefaults ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-[var(--text-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading current data...
          </div>
        ) : (
          <div className="space-y-4 border-t border-gray-200 dark:border-[var(--border-subtle)] pt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)]">Enter the corrected value(s) to apply:</p>

            {isComplaint ? (
              <>
                {flags.includes("title") && (
                  <div className="space-y-1">
                    <Label htmlFor="fix-title">Title</Label>
                    <Input id="fix-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                )}
                {flags.includes("description") && (
                  <div className="space-y-1">
                    <Label htmlFor="fix-description">Description</Label>
                    <Textarea id="fix-description" value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                )}
                {flags.includes("location") && (
                  <div className="space-y-1">
                    <Label htmlFor="fix-location">Location</Label>
                    <Input id="fix-location" value={location} onChange={(e) => setLocation(e.target.value)} />
                  </div>
                )}
                {flags.includes("department") && (
                  <div className="space-y-1">
                    <Label>Department</Label>
                    <Select value={departmentId} onValueChange={(v) => setDepartmentId(v ?? "")}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {flags.includes("category") && (
                  <div className="space-y-1">
                    <Label>Category</Label>
                    <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")} disabled={categories.length === 0}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            ) : (
              <>
                {flags.includes("name") && (
                  <div className="space-y-1">
                    <Label htmlFor="fix-name">Name</Label>
                    <Input id="fix-name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                )}
                {flags.includes("own_department") && (
                  <div className="space-y-1">
                    <Label>Department Assignment</Label>
                    <Select value={ownDepartmentId} onValueChange={(v) => setOwnDepartmentId(v ?? "")}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <div className="space-y-1">
              <Label htmlFor="admin-notes">Approval note (optional)</Label>
              <Textarea id="admin-notes" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
            </div>
          </div>
        )}

        {isPending && (
          <div className="space-y-1 border-t border-gray-200 dark:border-[var(--border-subtle)] pt-4">
            <Label htmlFor="reject-notes">Rejection reason (required if rejecting)</Label>
            <Textarea id="reject-notes" value={rejectNotes} onChange={(e) => setRejectNotes(e.target.value)} />
          </div>
        )}

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Close</DialogClose>
          {isPending && (
            <>
              <Button type="button" variant="destructive" disabled={submitting} onClick={handleReject}>
                Reject
              </Button>
              <Button type="button" disabled={submitting || loadingDefaults} onClick={handleApprove}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve & Apply"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
