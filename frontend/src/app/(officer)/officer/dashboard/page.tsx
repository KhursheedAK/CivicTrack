"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, FileText, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComplaintsListView } from "@/components/complaints/ComplaintsListView";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { complaintsApi } from "@/lib/api";
import type { Complaint } from "@/types";

const OFFICER_FILTERS = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "UNDER_REVIEW" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
];

export default function OfficerDashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Officers see all complaints assigned to them — backend filters by authenticated user's dept
    complaintsApi.getAll({ limit: 100 })
      .then((data) => setComplaints(data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pending = complaints.filter((c) => c.status === "UNDER_REVIEW").length;
  const inProgress = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolved = complaints.filter((c) => ["RESOLVED", "CLOSED"].includes(c.status)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Officer Dashboard"
        description="Review assigned complaints and keep citizens updated."
        action={
          <Button asChild variant="outline">
            <Link href="/track">Track Code</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Assigned Cases" value={complaints.length} icon={FileText} color="violet" />
        <StatCard label="Pending Review" value={pending} icon={Clock} color="amber" />
        <StatCard label="In Progress" value={inProgress} icon={Timer} color="orange" />
        <StatCard label="Resolved MTD" value={resolved} icon={CheckCircle2} color="green" />
      </div>

      <ComplaintsListView
        complaints={complaints}
        variant="officer"
        basePath="/officer/complaint"
        filters={OFFICER_FILTERS}
        loading={loading}
      />
    </div>
  );
}
