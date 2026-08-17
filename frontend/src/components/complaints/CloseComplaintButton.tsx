"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { complaintsApi } from "@/lib/api";

interface CloseComplaintButtonProps {
  complaintId: string;
  trackingCode: string;
  onClose?: () => void;
}

export function CloseComplaintButton({ complaintId, trackingCode, onClose }: CloseComplaintButtonProps) {
  const [closing, setClosing] = useState(false);

  async function handleClose() {
    setClosing(true);
    try {
      await complaintsApi.updateStatus(complaintId, "CLOSED");
      toast.success(`Complaint ${trackingCode} closed. Thank you!`);
      onClose?.();
    } catch {
      toast.error("Failed to close complaint. Please try again.");
    } finally {
      setClosing(false);
    }
  }

  return (
    <Button className="w-full" disabled={closing} onClick={handleClose}>
      {closing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
      Close Complaint
    </Button>
  );
}
