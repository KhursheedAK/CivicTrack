"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {Loader2, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { DemoAccounts, type DemoAccount } from "@/components/auth/DemoAccounts";

const ROLE_HOME: Record<string, string> = {
  CITIZEN: "/dashboard",
  OFFICER: "/officer/dashboard",
  ADMIN: "/admin/dashboard",
};

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [demoRole, setDemoRole] = useState<DemoAccount["role"] | null>(null);
  const showDemo = process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS !== "false";

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  function handleDemoSelect(account: DemoAccount) {
    setValue("email", account.email, { shouldValidate: true });
    setValue("password", account.password, { shouldValidate: true });
    setDemoRole(account.role);
    void onSubmit({ email: account.email, password: account.password, remember: false });
  }

  async function onSubmit(values: LoginValues) {
    setStatus("loading");
    try {
      const user = await authApi.login(values.email, values.password, values.remember);
      setUser(user);
      setStatus("success");
      const from = searchParams.get("from");
      const dest = from || ROLE_HOME[user.role] || "/dashboard";
      setTimeout(() => router.push(dest), 600);
    } catch (err: unknown) {
      setStatus("idle");
      setDemoRole(null);
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Invalid email or password.";
      toast.error(msg);
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
        <p className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">Success</p>
        <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {showDemo && (
        <>
          <DemoAccounts onSelect={handleDemoSelect} activeRole={demoRole} disabled={status === "loading"} />
          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-[var(--text-secondary)]">
            <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
            or sign in with your account
            <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
          </div>
        </>
      )}
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

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-xs font-medium text-blue-600 dark:text-[var(--brand-accent)] hover:underline">
            Forgot Password?
          </Link>
        </div>
        <PasswordInput id="password" placeholder="••••••••" required {...register("password")} />
        {errors.password && <p className="text-xs text-red-500 dark:text-[var(--danger)] dark:flex dark:items-center dark:gap-1">
              <AlertCircle className="hidden h-3.5 w-3.5 shrink-0 dark:block" />
              {errors.password.message}
            </p>}
      </div>

      <div className="flex items-center gap-2">
        <Controller
          name="remember"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="remember"
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="remember" className="text-sm font-normal text-gray-600 dark:text-[var(--text-muted)]">
          Remember this device
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Authenticating...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}
