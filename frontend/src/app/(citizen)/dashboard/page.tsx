"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { ComplaintsListView } from "@/components/complaints/ComplaintsListView";
import { complaintsApi } from "@/lib/api";
import type { Complaint } from "@/types";

export default function CitizenDashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintsApi.getMy({ limit: 50 })
      .then((data) => setComplaints(data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const open = complaints.filter((c) => ["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS"].includes(c.status)).length;
  const resolved = complaints.filter((c) => ["RESOLVED", "CLOSED"].includes(c.status)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back — here's an overview of your complaints."
        action={
          <Button asChild>
            <Link href="/complaint/new">
              <Plus className="h-4 w-4" />
              Submit New
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total Filed" value={complaints.length} icon={FileText} />
        <StatCard label="Open Tasks" value={open} icon={Clock} color="amber" />
        <StatCard label="Resolved" value={resolved} icon={CheckCircle2} color="green" />
      </div>

      <ComplaintsListView complaints={complaints} variant="citizen" basePath="/complaint" loading={loading} />
    </div>
  );
}
