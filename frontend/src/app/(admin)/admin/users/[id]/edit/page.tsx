"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { departmentsApi, usersApi } from "@/lib/api";
import type { Department, User } from "@/types";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  department_id: z.string().uuid().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound404, setNotFound404] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    async function load() {
      try {
        const [fetchedUser, depts] = await Promise.all([
          usersApi.getById(params.id),
          departmentsApi.getAllForAdmin(),
        ]);
        setUser(fetchedUser);
        setDepartments(depts);
        reset({
          name: fetchedUser.name,
          department_id: fetchedUser.departmentId ?? "",
        });
      } catch {
        setNotFound404(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, reset]);

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-[var(--text-muted)]">Loading...</div>;
  if (notFound404 || !user) return notFound();

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      await usersApi.update(params.id, {
        name: values.name,
        department_id: values.department_id || null,
      });
      toast.success("User updated successfully.");
      router.push("/admin/users");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to update user.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${user.name}`} description="Update account details for this user." />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6 rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" required {...register("name")} />
            {errors.name && (
              <p className="text-xs text-red-500 dark:text-[var(--danger)] dark:flex dark:items-center dark:gap-1">
                <AlertCircle className="hidden h-3.5 w-3.5 shrink-0 dark:block" />
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input id="email" type="email" value={user.email} readOnly className="bg-gray-50 text-gray-500 dark:pr-9" />
              <Lock className="pointer-events-none absolute right-3 top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)] dark:block" />
            </div>
            <p className="hidden text-xs text-[var(--text-muted)] dark:block">Auto-assigned · cannot be changed</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="role">Role</Label>
            <div className="relative">
              <Input id="role" value={user.role} readOnly className="bg-gray-50 text-gray-500 dark:pr-9" />
              <Lock className="pointer-events-none absolute right-3 top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)] dark:block" />
            </div>
          </div>
          {user.role === "OFFICER" && (
            <div className="space-y-1">
              <Label htmlFor="department_id">Department</Label>
              <Controller
                control={control}
                name="department_id"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
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
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
