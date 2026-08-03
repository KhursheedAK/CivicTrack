"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { departmentsApi, categoriesApi } from "@/lib/api";
import type { Department } from "@/types";

interface CreateDepartmentDialogProps {
  onSuccess?: () => void;
}

export function CreateDepartmentDialog({ onSuccess }: CreateDepartmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const description = form.get("description") as string;
    if (!name.trim()) return;
    setSaving(true);
    try {
      await departmentsApi.create({ name: name.trim(), description: description.trim() || undefined });
      toast.success("Department created");
      setOpen(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to create department";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="h-4 w-4" />
        New Department
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Create New Department</DialogTitle>
            <DialogDescription>Add a civic service department for complaint routing.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <Label htmlFor="dept-name">Department Name</Label>
            <Input id="dept-name" name="name" placeholder="Water & Sanitation" autoComplete="off" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="dept-description">Description</Label>
            <Textarea id="dept-description" name="description" placeholder="Describe the department scope" />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface QuickAddCategoryDialogProps {
  departments: Department[];
  onSuccess?: () => void;
}

export function QuickAddCategoryDialog({ departments, onSuccess }: QuickAddCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState(departments[0]?.id ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    if (!name.trim() || !departmentId) return;
    setSaving(true);
    try {
      await categoriesApi.create({ name: name.trim(), department_id: departmentId });
      toast.success("Category added");
      setOpen(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to add category";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Plus className="h-4 w-4" />
        Quick Add Category
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Quick Add Category</DialogTitle>
            <DialogDescription>Add a complaint category under the selected department.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <Label htmlFor="cat-department">Department</Label>
            <Select value={departmentId} onValueChange={(v) => setDepartmentId(v ?? "")}>
              <SelectTrigger id="cat-department" className="w-full">
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
          </div>
          <div className="space-y-1">
            <Label htmlFor="cat-name">Category Name</Label>
            <Input id="cat-name" name="name" placeholder="Blocked Drain" autoComplete="off" required />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={saving}>
              {saving ? "Adding..." : "Add Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
