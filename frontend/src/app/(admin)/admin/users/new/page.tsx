"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {Loader2, Mail, AlertCircle } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { InfoBanner } from "@/components/shared/InfoBanner";
import { departmentsApi, usersApi } from "@/lib/api";
import type { Department } from "@/types";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Enter a valid email"),
  department_id: z.string().uuid("Please select a department"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
});

type FormValues = z.infer<typeof schema>;

export default function AddOfficerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    departmentsApi.getAll().then(setDepartments).catch(console.error);
  }, []);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      await usersApi.createOfficer({
        name: values.name,
        email: values.email,
        password: values.password,
        department_id: values.department_id,
      });
      toast.success("Officer account created. A welcome email has been sent.");
      router.push("/admin/users");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to create user.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Add New Officer" description="Create an officer account and assign them to a department." />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6 rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white p-6">
        <InfoBanner title="Welcome Email">
          <span className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4" />
            The officer receives their login credentials by email after creation.
          </span>
        </InfoBanner>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" required {...register("name")} />
            {errors.name && <p className="text-xs text-red-500 dark:text-[var(--danger)] dark:flex dark:items-center dark:gap-1">
              <AlertCircle className="hidden h-3.5 w-3.5 shrink-0 dark:block" />
              {errors.name.message}
            </p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required {...register("email")} />
            {errors.email && <p className="text-xs text-red-500 dark:text-[var(--danger)] dark:flex dark:items-center dark:gap-1">
              <AlertCircle className="hidden h-3.5 w-3.5 shrink-0 dark:block" />
              {errors.email.message}
            </p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="department_id">Department</Label>
            <Controller
              control={control}
              name="department_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} required>
                  <SelectTrigger id="department_id" className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.department_id && <p className="text-xs text-red-500 dark:text-[var(--danger)] dark:flex dark:items-center dark:gap-1">
              <AlertCircle className="hidden h-3.5 w-3.5 shrink-0 dark:block" />
              {errors.department_id.message}
            </p>}
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="password">Initial Password</Label>
            <Input id="password" type="password" required {...register("password")} />
            {errors.password && <p className="text-xs text-red-500 dark:text-[var(--danger)] dark:flex dark:items-center dark:gap-1">
              <AlertCircle className="hidden h-3.5 w-3.5 shrink-0 dark:block" />
              {errors.password.message}
            </p>}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Officer
          </Button>
        </div>
      </form>
    </div>
  );
}
