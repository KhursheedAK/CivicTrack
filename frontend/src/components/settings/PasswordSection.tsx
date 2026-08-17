"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { authApi } from "@/lib/api";

export function PasswordSection() {
  const currentRef = useRef<HTMLInputElement>(null);
  const newRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const current = currentRef.current?.value ?? "";
    const newPass = newRef.current?.value ?? "";
    const confirm = confirmRef.current?.value ?? "";

    if (!current) { toast.error("Enter your current password"); return; }
    if (newPass.length < 8) { toast.error("New password must be at least 8 characters"); return; }
    if (!/[A-Z]/.test(newPass)) { toast.error("New password must contain an uppercase letter"); return; }
    if (!/[0-9]/.test(newPass)) { toast.error("New password must contain a number"); return; }
    if (newPass !== confirm) { toast.error("Passwords do not match"); return; }

    setSaving(true);
    try {
      await authApi.changePassword(current, newPass);
      toast.success("Password changed. Please log in again on other devices.");
      if (currentRef.current) currentRef.current.value = "";
      if (newRef.current) newRef.current.value = "";
      if (confirmRef.current) confirmRef.current.value = "";
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to change password";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="elev-1 bg-white rounded-lg border border-gray-200 dark:border-transparent p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">Security</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="current-password">Current Password</Label>
          <PasswordInput id="current-password" placeholder="••••••••" ref={currentRef} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new-password">New Password</Label>
          <PasswordInput id="new-password" placeholder="••••••••" ref={newRef} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <PasswordInput id="confirm-password" placeholder="••••••••" ref={confirmRef} />
        </div>
      </div>
      <p className="text-xs text-gray-400 dark:text-[var(--text-muted)]">Min 8 characters, one uppercase letter, one number.</p>
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Update Password
        </Button>
      </div>
    </form>
  );
}
