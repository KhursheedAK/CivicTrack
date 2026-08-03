"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DepartmentCard } from "@/components/admin/DepartmentCard";
import { CreateDepartmentDialog, QuickAddCategoryDialog } from "@/components/admin/DepartmentDialogs";
import { PageHeader } from "@/components/shared/PageHeader";
import { departmentsApi } from "@/lib/api";
import type { Department } from "@/types";

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDepartments() {
    try {
      const data = await departmentsApi.getAllForAdmin();
      setDepartments(data);
    } catch {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDepartments(); }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Manage service departments, categories, and officer assignments."
        action={
          <div className="flex flex-wrap gap-2">
            <QuickAddCategoryDialog departments={departments} onSuccess={loadDepartments} />
            <CreateDepartmentDialog onSuccess={loadDepartments} />
          </div>
        }
      />
      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-[var(--bg-surface-2)]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {departments.map((dept) => (
            <DepartmentCard key={dept.id} department={dept} onRefresh={loadDepartments} />
          ))}
        </div>
      )}
    </div>
  );
}
