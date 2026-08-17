"use client";

import { useRef, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Circle, ClipboardEdit, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InfoBanner } from "@/components/shared/InfoBanner";
import { dataCorrectionsApi } from "@/lib/api";
import type { Complaint } from "@/types";

const COMPLAINT_FIELDS = [
  { value: "title", label: "Title" },
  { value: "description", label: "Description" },
  { value: "category", label: "Category" },
  { value: "department", label: "Department" },
  { value: "location", label: "Location" },
];

const PROFILE_FIELDS = [
  { value: "name", label: "Contact Information" },
  { value: "own_department", label: "Department Assignment" },
];

const MULTILINE_FIELDS = new Set(["description"]);

interface DataCorrectionDialogProps {
  target: "complaint" | "profile";
  complaint?: Complaint;
  profileName?: string;
  profileDepartmentName?: string;
}

export function DataCorrectionDialog({
  target,
  complaint,
  profileName,
  profileDepartmentName,
}: DataCorrectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [newValues, setNewValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [chipError, setChipError] = useState(false);
  const [chipFlash, setChipFlash] = useState(false);
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const discardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wheelListenerRef = useRef<((e: WheelEvent) => void) | null>(null);
  const wheelElRef = useRef<HTMLDivElement | null>(null);

  function attachWheelListener(el: HTMLDivElement | null) {
    if (wheelListenerRef.current && wheelElRef.current) {
      wheelElRef.current.removeEventListener("wheel", wheelListenerRef.current);
    }
    wheelElRef.current = el;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      const atTop = el.scrollTop === 0 && e.deltaY < 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1 && e.deltaY > 0;
      if (!atTop && !atBottom) {
        e.preventDefault();
        e.stopPropagation();
        el.scrollBy({ top: e.deltaY, behavior: "smooth" });
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    wheelListenerRef.current = handler;
  }

  const fields = target === "complaint" ? COMPLAINT_FIELDS : PROFILE_FIELDS;

  function getCurrentValue(fieldValue: string): string {
    if (target === "complaint") {
      switch (fieldValue) {
        case "title": return complaint?.title ?? "";
        case "description": return complaint?.description ?? "";
        case "category": return complaint?.categoryName ?? "";
        case "department": return complaint?.departmentName ?? "";
        case "location": return complaint?.location ?? "";
        default: return "";
      }
    }
    switch (fieldValue) {
      case "name": return profileName ?? "";
      case "own_department": return profileDepartmentName ?? "Unassigned";
      default: return "";
    }
  }

  function toggleField(value: string) {
    const isAdding = !selectedFields.includes(value);
    setSelectedFields((prev) =>
      isAdding ? [...prev, value] : prev.filter((f) => f !== value)
    );
    if (isAdding) {
      setChipError(false);
      // scroll new block into view after render
      setTimeout(() => {
        fieldRefs.current[value]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    } else {
      setFieldErrors((prev) => { const next = { ...prev }; delete next[value]; return next; });
    }
  }

  function resetForm() {
    setSelectedFields([]);
    setNewValues({});
    setFieldErrors({});
    setChipError(false);
    setDiscardConfirm(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      const hasData = selectedFields.length > 0 || Object.values(newValues).some((v) => v.trim());
      if (hasData && !discardConfirm) return; // let Cancel button handle confirm
      resetForm();
    }
    setOpen(next);
  }

  function handleCancel() {
    const hasData = selectedFields.length > 0 || Object.values(newValues).some((v) => v.trim());
    if (!hasData) { resetForm(); setOpen(false); return; }
    if (discardConfirm) { resetForm(); setOpen(false); return; }
    setDiscardConfirm(true);
    if (discardTimerRef.current) clearTimeout(discardTimerRef.current);
    discardTimerRef.current = setTimeout(() => setDiscardConfirm(false), 3000);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedFields.length === 0) {
      setChipError(true);
      setChipFlash(true);
      setTimeout(() => setChipFlash(false), 200);
      return;
    }

    const errors: Record<string, string> = {};
    selectedFields.forEach((f) => {
      if (!newValues[f]?.trim()) errors[f] = "Corrected value is required";
    });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // scroll first errored field into view
      const firstErr = selectedFields.find((f) => errors[f]);
      if (firstErr) fieldRefs.current[firstErr]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }

    const labelFor = (v: string) => fields.find((f) => f.value === v)?.label ?? v;
    const current_data = selectedFields.map((f) => `${labelFor(f)}: ${getCurrentValue(f) || "(not set)"}`).join("\n");
    const requested_correction = selectedFields.map((f) => `${labelFor(f)}: ${newValues[f].trim()}`).join("\n");

    setSubmitting(true);
    try {
      await dataCorrectionsApi.create({
        target_type: target === "complaint" ? "COMPLAINT" : "PROFILE",
        complaint_id: target === "complaint" ? complaint?.id : undefined,
        fields_flagged: selectedFields,
        current_data,
        requested_correction,
      });
      toast.success("Data correction request submitted");
      resetForm();
      setOpen(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to submit request. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = selectedFields.length > 0 && !submitting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" />}>
        <ClipboardEdit className="h-4 w-4" />
        Request Data Correction
      </DialogTrigger>

      {/* p-0 lets our shell div own all sizing; the base grid/gap/p classes are neutralised */}
      <DialogContent showCloseButton={false} className="sm:max-w-xl p-0 gap-0">

        {/*
          Shell div — this is the ONLY element that sets the height budget.
          It is a direct child of the popup div (after the focus-guard spans),
          so it is a grid item, not a flex child. We give it an explicit
          max-height here so the browser has a concrete constraint to scroll against.
          display:flex + flex-direction:column turns it into the flex container
          that the three zones (header / body / footer) live inside.
        */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            height: "min(85vh, 720px)",
            overflow: "hidden",
            borderRadius: "inherit",
          }}
        >
          {/* ── HEADER ── */}
          <div style={{ flexShrink: 0 }} className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-[var(--border-subtle,hsl(var(--border)))]">
            <div className="flex flex-col gap-1">
              <DialogTitle>Request Data Correction</DialogTitle>
              <DialogDescription>
                {target === "complaint"
                  ? `Flag incorrect data on complaint #${complaint?.trackingCode ?? ""} for admin review.`
                  : "Flag incorrect data on your own profile for admin review."}
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="mt-0.5 flex-shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── CHIP SELECTOR ── */}
          <div
            style={{ flexShrink: 0 }}
            className={`px-5 pt-4 pb-4 border-b border-[var(--border-subtle,hsl(var(--border)))] transition-colors duration-200 ${chipFlash ? "border-red-500" : ""}`}
          >
            <p className="text-xs text-muted-foreground mb-2">Select the fields that need correction</p>
            <div className="flex flex-wrap gap-2">
              {fields.map((field) => {
                const checked = selectedFields.includes(field.value);
                return (
                  <button
                    key={field.value}
                    type="button"
                    onClick={() => toggleField(field.value)}
                    className={`
                      inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium
                      transition-all duration-150 cursor-pointer select-none
                      hover:bg-accent hover:text-accent-foreground
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                      ${checked
                        ? "border-[var(--color-accent,hsl(var(--primary)))] bg-[var(--color-accent,hsl(var(--primary)))]/10 text-[var(--color-accent,hsl(var(--primary)))]"
                        : "border-[var(--border-subtle,hsl(var(--border)))] bg-transparent text-muted-foreground"
                      }
                    `}
                    aria-pressed={checked}
                  >
                    {checked
                      ? <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                      : <Circle className="h-3.5 w-3.5 flex-shrink-0" />
                    }
                    {field.label}
                  </button>
                );
              })}
            </div>
            {chipError && (
              <p className="mt-2 flex items-center gap-1 text-[13px] text-red-400">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                Select at least one field to correct
              </p>
            )}
          </div>

          {/* ── SCROLLABLE BODY ── */}
          {/*
            flex: 1 1 0 — takes all remaining height after header+footer.
            min-height: 0 — REQUIRED: without this a flex child won't shrink
            below its content height, so overflow-y never activates (bug #1).
            overflow-y: auto — the actual scroll.
            No wrapper div between this and the form — eliminates any
            unconstrained ancestor that would break the height chain (bug #2).
          */}
          <div
            ref={attachWheelListener}
            style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", scrollBehavior: "smooth" }}
            className="px-5 py-4 space-y-4"
          >
            {selectedFields.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No fields selected yet. Use the chips above to choose what to correct.
              </p>
            ) : (
              selectedFields.map((fieldValue) => {
                const field = fields.find((f) => f.value === fieldValue)!;
                const current = getCurrentValue(fieldValue);
                const isMultiline = MULTILINE_FIELDS.has(fieldValue);
                const hasError = !!fieldErrors[fieldValue];
                return (
                  <div
                    key={fieldValue}
                    ref={(el) => { fieldRefs.current[fieldValue] = el; }}
                    className="rounded-lg bg-muted/40 border border-[var(--border-subtle,hsl(var(--border)))] p-4 space-y-3"
                  >
                    <p className="text-sm font-semibold text-foreground">{field.label}</p>
                    <div className="space-y-1">
                      <Label htmlFor={`current-${fieldValue}`} className="text-xs text-muted-foreground">Current value</Label>
                      {isMultiline ? (
                        <Textarea id={`current-${fieldValue}`} value={current} readOnly className="resize-none text-sm" />
                      ) : (
                        <Input id={`current-${fieldValue}`} value={current} readOnly className="text-sm" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`new-${fieldValue}`} className="text-xs text-muted-foreground">Corrected value</Label>
                      {isMultiline ? (
                        <Textarea
                          id={`new-${fieldValue}`}
                          value={newValues[fieldValue] ?? ""}
                          onChange={(e) => {
                            setNewValues((prev) => ({ ...prev, [fieldValue]: e.target.value }));
                            if (fieldErrors[fieldValue]) setFieldErrors((prev) => { const n = { ...prev }; delete n[fieldValue]; return n; });
                          }}
                          className={`resize-none text-sm ${hasError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          placeholder="Enter the correct value…"
                        />
                      ) : (
                        <Input
                          id={`new-${fieldValue}`}
                          value={newValues[fieldValue] ?? ""}
                          onChange={(e) => {
                            setNewValues((prev) => ({ ...prev, [fieldValue]: e.target.value }));
                            if (fieldErrors[fieldValue]) setFieldErrors((prev) => { const n = { ...prev }; delete n[fieldValue]; return n; });
                          }}
                          className={`text-sm ${hasError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          placeholder="Enter the correct value…"
                        />
                      )}
                      {hasError && (
                        <p className="flex items-center gap-1 text-[13px] text-red-400 mt-1">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                          {fieldErrors[fieldValue]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            <InfoBanner title="Audit notice">
              This request is logged and sent to every administrator for review.
            </InfoBanner>
          </div>

          {/* ── FOOTER ── */}
          <div
            style={{ flexShrink: 0 }}
            className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end px-5 py-4 border-t border-[var(--border-subtle,hsl(var(--border)))] bg-muted/50 rounded-b-xl"
          >
            <Button
              type="button"
              variant={discardConfirm ? "destructive" : "outline"}
              onClick={handleCancel}
              className="transition-all duration-150"
            >
              {discardConfirm ? (
                <><AlertTriangle className="h-3.5 w-3.5" /> Discard changes?</>
              ) : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="transition-all duration-150"
              style={!canSubmit ? { opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" } : {}}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
