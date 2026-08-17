"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { complaintsApi } from "@/lib/api";
import type { Complaint } from "@/types";

interface CommentFormProps {
  complaintId: string;
  locked: boolean;
  onCommentAdded: (complaint: Complaint) => void;
}

export function CommentForm({ complaintId, locked, onCommentAdded }: CommentFormProps) {
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  if (locked) {
    return (
      <p className="mt-4 border-t border-gray-100 dark:border-[var(--border-subtle)] pt-4 text-sm text-gray-500 dark:text-[var(--text-muted)]">
        This complaint is closed — no further comments can be added.
      </p>
    );
  }

  async function handleSubmit() {
    if (!comment.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const updated = await complaintsApi.addComment(complaintId, comment.trim());
      onCommentAdded(updated);
      setComment("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to add comment.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 space-y-2 border-t border-gray-100 dark:border-[var(--border-subtle)] pt-4">
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        rows={2}
      />
      <div className="flex justify-end">
        <Button type="button" size="sm" disabled={saving} onClick={handleSubmit}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Post Comment
        </Button>
      </div>
    </div>
  );
}
