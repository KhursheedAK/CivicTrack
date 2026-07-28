"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {Loader2, ShieldCheck, Bell, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { authApi } from "@/lib/api";

const registerSchema = z
  .object({
    name: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((v) => v === true, "You must accept the Terms of Service"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", terms: false },
  });

  async function onSubmit(values: RegisterValues) {
    setLoading(true);
    try {
      await authApi.register(values.name, values.email, values.password);
      toast.success("Account created! Please check your email to verify your account.");
      router.push("/login");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="Your full name" required {...register("name")} />
        {errors.name && <p className="text-xs text-red-500 dark:text-[var(--danger)] dark:flex dark:items-center dark:gap-1">
              <AlertCircle className="hidden h-3.5 w-3.5 shrink-0 dark:block" />
              {errors.name.message}
            </p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" required {...register("email")} />
        {errors.email && <p className="text-xs text-red-500 dark:text-[var(--danger)] dark:flex dark:items-center dark:gap-1">
              <AlertCircle className="hidden h-3.5 w-3.5 shrink-0 dark:block" />
              {errors.email.message}
            </p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
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
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <PasswordInput id="confirmPassword" placeholder="••••••••" required {...register("confirmPassword")} />
        {errors.confirmPassword && <p className="text-xs text-red-500 dark:text-[var(--danger)] dark:flex dark:items-center dark:gap-1">
              <AlertCircle className="hidden h-3.5 w-3.5 shrink-0 dark:block" />
              {errors.confirmPassword.message}
            </p>}
      </div>

      <div className="flex items-start gap-2">
        <Controller
          name="terms"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="terms"
              className="mt-0.5"
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="terms" className="text-sm font-normal leading-snug text-gray-600 dark:text-[var(--text-muted)]">
          I agree to the Terms of Service and Privacy Policy
        </Label>
      </div>
      {errors.terms && <p className="text-xs text-red-500 dark:text-[var(--danger)] dark:flex dark:items-center dark:gap-1">
              <AlertCircle className="hidden h-3.5 w-3.5 shrink-0 dark:block" />
              {errors.terms.message}
            </p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-[var(--border-subtle)] px-3 py-2 text-xs text-gray-600 dark:text-[var(--text-muted)]">
          <ShieldCheck className="h-4 w-4 text-green-600 dark:text-[var(--success)]" />
          Secure
        </div>
        <div className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-[var(--border-subtle)] px-3 py-2 text-xs text-gray-600 dark:text-[var(--text-muted)]">
          <Bell className="h-4 w-4 text-blue-600 dark:text-[var(--brand-accent)]" />
          Alerts
        </div>
      </div>
    </form>
  );
}
