"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InfoBanner } from "@/components/shared/InfoBanner";
import { usersApi, authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function DangerZoneCard() {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  async function handleDeactivate() {
    if (!user) return;
    setDeleting(true);
    try {
      await usersApi.delete(user.id);
      toast.success("Account removed. Logging you out...");
      await authApi.logout();
      window.location.href = "/login";
    } catch {
      toast.error("Failed to deactivate account. Please contact support.");
      setDeleting(false);
    }
  }

  return (
    <div className="elev-1 bg-white rounded-lg border border-gray-200 dark:border-transparent p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">Deactivate Account</h2>
      <InfoBanner
        variant="danger"
        title="This action is permanent"
        action={
          <Dialog>
            <DialogTrigger render={<Button variant="destructive" size="sm" />}>
              Deactivate Account
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deactivate your account?</DialogTitle>
                <DialogDescription>
                  This will permanently remove your account and complaint history. This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                <Button variant="destructive" onClick={handleDeactivate} disabled={deleting}>
                  {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Yes, delete my account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        Deactivating your account will remove access to the portal and hide your complaint history from
        public tracking. This cannot be undone.
      </InfoBanner>
    </div>
  );
}
