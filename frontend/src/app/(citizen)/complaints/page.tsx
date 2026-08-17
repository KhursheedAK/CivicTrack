"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { ComplaintsListView } from "@/components/complaints/ComplaintsListView";
import { complaintsApi } from "@/lib/api";
import type { Complaint } from "@/types";

export default function MyComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintsApi.getMy({ limit: 100 })
      .then((data) => setComplaints(data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Complaints"
        description="View and track all complaints you've submitted."
        action={
          <Button asChild>
            <Link href="/complaint/new">
              <Plus className="h-4 w-4" />
              Submit New
            </Link>
          </Button>
        }
      />

      <ComplaintsListView complaints={complaints} variant="citizen" basePath="/complaint" loading={loading} />
    </div>
  );
}
