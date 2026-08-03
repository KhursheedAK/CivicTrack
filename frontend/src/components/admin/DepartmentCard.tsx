"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Tag, Users, Pencil, Check, X, PowerOff, Power } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { departmentsApi } from "@/lib/api";
import type { Department } from "@/types";

interface DepartmentCardProps {
  department: Department;
  onRefresh?: () => void;
}

export function DepartmentCard({ department, onRefresh }: DepartmentCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(department.name);
  const [description, setDescription] = useState(department.description);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const n = name.trim();
    if (!n || n.length < 2) { toast.error("Name must be at least 2 characters"); return; }
    setSaving(true);
    try {
      await departmentsApi.update(department.id, { name: n, description: description.trim() || undefined });
      toast.success("Department updated");
      setEditing(false);
      onRefresh?.();
    } catch {
      toast.error("Failed to update department");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    try {
      await departmentsApi.deactivate(department.id);
      toast.success("Department deactivated");
      onRefresh?.();
    } catch {
      toast.error("Failed to deactivate department");
    }
  }

  async function handleReactivate() {
    try {
      await departmentsApi.reactivate(department.id);
      toast.success(`${department.name} reactivated`);
      onRefresh?.();
    } catch {
      toast.error("Failed to reactivate department");
    }
  }

  return (
    <div className="elev-1 elev-hover rounded-lg border border-gray-200 dark:border-transparent bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="rounded-lg bg-gray-50 dark:bg-[var(--bg-surface-2)] p-3 text-gray-700 dark:text-[var(--text-secondary)] shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            {editing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 text-base font-semibold"
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
                autoFocus
              />
            ) : (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">{department.name}</h2>
            )}
          </div>
        </div>
        <Badge variant={department.isActive ? "default" : "secondary"}>
          {department.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {editing ? (
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="mt-4 text-sm"
        />
      ) : (
        <p className="mt-4 text-sm text-gray-600 dark:text-[var(--text-muted)]">{department.description}</p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-gray-200 dark:border-[var(--border-subtle)] p-3">
          <div className="flex items-center gap-2 text-gray-500 dark:text-[var(--text-muted)]">
            <Tag className="h-4 w-4" />
            Categories
          </div>
          <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-[var(--text-primary)]">{department.categoryCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-[var(--border-subtle)] p-3">
          <div className="flex items-center gap-2 text-gray-500 dark:text-[var(--text-muted)]">
            <Users className="h-4 w-4" />
            Officers
          </div>
          <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-[var(--text-primary)]">{department.officerCount}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/departments/${department.id}/officers`}>Manage Officers</Link>
        </Button>

        <div className="flex gap-2">
          {editing ? (
            <>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Check className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEditing(false); setName(department.name); setDescription(department.description); }}>
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button size="icon-sm" variant="ghost" onClick={() => setEditing(true)} aria-label="Edit department">
                <Pencil className="h-4 w-4 text-gray-500 dark:text-[var(--text-muted)]" />
              </Button>
              {department.isActive ? (
                <Dialog>
                  <DialogTrigger render={<Button size="icon-sm" variant="ghost" aria-label="Deactivate department" />}>
                    <PowerOff className="h-4 w-4 text-red-500 dark:text-[var(--danger)]" />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Deactivate Department</DialogTitle>
                      <DialogDescription>
                        {department.name} will be hidden from public forms, along with its categories. Existing
                        complaints are not affected, and this can be undone by reactivating the department later.
                      </DialogDescription>
                    </DialogHeader>
                    {department.openComplaintCount > 0 && (
                      <p className="pill-warning rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        This department has <strong>{department.openComplaintCount}</strong> complaint
                        {department.openComplaintCount === 1 ? "" : "s"} not yet resolved, closed, or rejected. They
                        will stay assigned and can still be worked on — only new submissions will be blocked.
                      </p>
                    )}
                    <DialogFooter>
                      <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                      <DialogClose render={<Button variant="destructive" onClick={handleDeactivate} />}>
                        Deactivate
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button size="sm" variant="outline" onClick={handleReactivate}>
                  <Power className="h-4 w-4 text-green-600 dark:text-[var(--success)]" />
                  Reactivate
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
