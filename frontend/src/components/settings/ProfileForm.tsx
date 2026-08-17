"use client";

import { useRef, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarUploader } from "@/components/settings/AvatarUploader";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileFormProps {
  submitLabel?: string;
  showCancel?: boolean;
}

export function ProfileForm({ submitLabel = "Save Profile", showCancel }: ProfileFormProps) {
  const { user, setUser } = useAuth();
  const nameRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = nameRef.current?.value?.trim();
    if (!name || name.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    setSaving(true);
    try {
      const updated = await authApi.updateProfile(name);
      setUser(updated);
      toast.success("Profile updated successfully");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to update profile";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="elev-1 bg-white rounded-lg border border-gray-200 dark:border-transparent p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">Profile</h2>
      <AvatarUploader name={user.name} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" ref={nameRef} defaultValue={user.name} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Input id="email" type="email" defaultValue={user.email} readOnly className="bg-gray-50 cursor-not-allowed dark:pr-9" />
            <Lock className="pointer-events-none absolute right-3 top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)] dark:block" />
          </div>
          <p className="text-xs text-gray-400 dark:text-[var(--text-muted)]">Email cannot be changed here.</p>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        {showCancel && (
          <Button type="button" variant="outline">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
