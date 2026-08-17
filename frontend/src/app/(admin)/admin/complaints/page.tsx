"use client";

import { useEffect, useState } from "react";
import { ComplaintsListView } from "@/components/complaints/ComplaintsListView";
import { PageHeader } from "@/components/shared/PageHeader";
import { complaintsApi } from "@/lib/api";
import type { Complaint } from "@/types";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintsApi.getAll({ limit: 100 })
      .then((data) => setComplaints(data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Complaints"
        description="Browse, search, and review every complaint filed across the city."
      />
      <ComplaintsListView complaints={complaints} variant="officer" basePath="/admin/complaints" loading={loading} />
    </div>
  );
}
