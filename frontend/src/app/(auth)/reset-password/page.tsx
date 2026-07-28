"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {CheckCircle2, Loader2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { AuthShell } from "@/components/auth/AuthShell";
import { authApi } from "@/lib/api";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Values = z.infer<typeof schema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <XCircle className="h-10 w-10 text-red-500" />
        <p className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">Invalid reset link</p>
        <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">
          This link is missing its reset token. Request a new one below.
        </p>
        <Link href="/forgot-password" className="mt-2 text-sm font-medium text-blue-600 dark:text-[var(--brand-accent)] hover:underline">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
        <p className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">Password reset</p>
        <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">You can now sign in with your new password.</p>
        <Button className="mt-4 w-full" onClick={() => router.push("/login")}>
          Go to Sign In
        </Button>
      </div>
    );
  }

  async function onSubmit(values: Values) {
    setLoading(true);
    try {
      await authApi.resetPassword(token as string, values.password);
      setDone(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "This link may have expired. Please request a new one.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1">
        <Label htmlFor="password">New Password</Label>
        <PasswordInput id="password" placeholder="••••••••" required {...register("password")} />
        {errors.password ? (
          <p className="text-xs text-red-500 dark:text-[var(--danger)] dark:flex dark:items-center dark:gap-1">
              <AlertCircle className="hidden h-3.5 w-3.5 shrink-0 dark:block" />
              {errors.password.message}
            </p>
        ) : (
          <p className="text-xs text-gray-400 dark:text-[var(--text-muted)]">Min 8 characters, one uppercase letter and one number.</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <PasswordInput id="confirmPassword" placeholder="••••••••" required {...register("confirmPassword")} />
        {errors.confirmPassword && <p className="text-xs text-red-500 dark:text-[var(--danger)] dark:flex dark:items-center dark:gap-1">
              <AlertCircle className="hidden h-3.5 w-3.5 shrink-0 dark:block" />
              {errors.confirmPassword.message}
            </p>}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Resetting...
          </>
        ) : (
          "Reset Password"
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a New Password"
      subtitle="Choose a new password for your account."
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
        <ResetPasswordContent />
      </Suspense>
    </AuthShell>
  );
}
