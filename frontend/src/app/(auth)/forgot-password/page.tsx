"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {Loader2, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/AuthShell";
import { authApi } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: Values) {
    setLoading(true);
    try {
      await authApi.forgotPassword(values.email);
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <>
          Remembered your password?{" "}
          <Link href="/login" className="font-medium text-blue-600 dark:text-[var(--brand-accent)] hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
          <p className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">Check your inbox</p>
          <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">
            If that email is registered, a reset link has been sent.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[var(--text-muted)]" />
              <Input id="email" type="email" placeholder="you@example.com" className="pl-9 dark:pl-9" required {...register("email")} />
            </div>
            {errors.email && <p className="text-xs text-red-500 dark:text-[var(--danger)] dark:flex dark:items-center dark:gap-1">
              <AlertCircle className="hidden h-3.5 w-3.5 shrink-0 dark:block" />
              {errors.email.message}
            </p>}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : "Send Reset Link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
