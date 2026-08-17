"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { ReporterProfileView } from "@/components/citizens/ReporterProfileView";
import { complaintsApi, usersApi } from "@/lib/api";
import type { Complaint, User } from "@/types";

export default function ReporterProfilePage() {
  const params = useParams<{ id: string }>();
  const [citizen, setCitizen] = useState<User | null>(null);
  const [citizenComplaints, setCitizenComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound404, setNotFound404] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [user, complaintsRes] = await Promise.all([
          usersApi.getById(params.id),
          complaintsApi.getAll({ citizen_id: params.id, limit: 100 }),
        ]);
        if (user.role !== "CITIZEN") {
          setNotFound404(true);
          return;
        }
        setCitizen(user);
        setCitizenComplaints(complaintsRes.items);
      } catch {
        setNotFound404(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-[var(--text-muted)]">Loading...</div>;
  if (notFound404 || !citizen) return notFound();

  const latest = citizenComplaints[0];

  return (
    <ReporterProfileView
      citizen={citizen}
      citizenComplaints={citizenComplaints}
      breadcrumbItems={[
        { label: latest ? `Back to Case ${latest.trackingCode}` : "Complaints", href: latest ? `/officer/complaint/${latest.id}` : "/officer/dashboard" },
        { label: citizen.name },
      ]}
      basePath="/officer/complaint"
      variant="officer"
    />
  );
}
