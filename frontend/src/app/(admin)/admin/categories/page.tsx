"use client";

import { useEffect, useState } from "react";
import { Pencil, Check, X, Tag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { QuickAddCategoryDialog } from "@/components/admin/DepartmentDialogs";
import { categoriesApi, departmentsApi } from "@/lib/api";
import type { Category, Department } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function load() {
    try {
      const [cats, depts] = await Promise.all([categoriesApi.getAll(), departmentsApi.getAll()]);
      setCategories(cats);
      setDepartments(depts);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(id: string) {
    const name = editName.trim();
    if (!name || name.length < 2) { toast.error("Name must be at least 2 characters"); return; }
    try {
      const updated = await categoriesApi.update(id, { name });
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
      toast.success("Category updated");
    } catch {
      toast.error("Failed to update category");
    }
  }

  async function handleToggleActive(cat: Category) {
    try {
      const updated = await categoriesApi.update(cat.id, { is_active: !cat.isActive });
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
      toast.success(`Category ${updated.isActive ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update category");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage complaint categories across all departments."
        action={<QuickAddCategoryDialog departments={departments} onSuccess={load} />}
      />

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-200 dark:bg-[var(--bg-surface-2)]" />)}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState icon={Tag} title="No categories yet" description="Add a category to get started." />
      ) : (
        <div className="rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white divide-y divide-gray-100 dark:divide-[var(--border-subtle)]">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <Tag className="h-4 w-4 shrink-0 text-gray-400 dark:text-[var(--text-muted)]" />
                {editingId === cat.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-7 w-48 text-sm"
                    onKeyDown={(e) => { if (e.key === "Enter") handleSave(cat.id); if (e.key === "Escape") setEditingId(null); }}
                    autoFocus
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">{cat.name}</span>
                )}
                <span className="text-xs text-gray-400 dark:text-[var(--text-muted)]">{cat.departmentName}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={cat.isActive ? "default" : "secondary"}>
                  {cat.isActive ? "Active" : "Inactive"}
                </Badge>
                {editingId === cat.id ? (
                  <>
                    <Button size="icon-sm" variant="ghost" onClick={() => handleSave(cat.id)} aria-label="Save">
                      <Check className="h-4 w-4 text-green-600 dark:text-[var(--success)]" />
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => setEditingId(null)} aria-label="Cancel">
                      <X className="h-4 w-4 text-red-500 dark:text-[var(--danger)]" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4 text-gray-500 dark:text-[var(--text-muted)]" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(cat)}
                    >
                      {cat.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
