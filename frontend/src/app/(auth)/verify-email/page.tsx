"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import api from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) { setState("error"); return; }
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setState("success"))
      .catch(() => setState("error"));
  }, [token]);

  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      {state === "loading" && (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">Verifying your email...</p>
        </>
      )}
      {state === "success" && (
        <>
          <CheckCircle2 className="h-10 w-10 text-green-500" />
          <p className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">Email verified!</p>
          <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">You can now sign in to your account.</p>
        </>
      )}
      {state === "error" && (
        <>
          <XCircle className="h-10 w-10 text-red-500" />
          <p className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">Verification failed</p>
          <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">
            The link may have expired or already been used. Please register again.
          </p>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="Email Verification"
      subtitle="Verifying your account..."
      footer={
        <Link href="/login" className="font-medium text-blue-600 dark:text-[var(--brand-accent)] hover:underline">
          Back to Sign In
        </Link>
      }
    >
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">Loading...</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </AuthShell>
  );
}
