"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Search, Download, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/complaints/StatusBadge";
import { ComplaintTimeline } from "@/components/complaints/ComplaintTimeline";
import { MapWidget } from "@/components/complaints/MapWidget";
import { ShareMenu } from "@/components/complaints/ShareMenu";
import { InfoBanner } from "@/components/shared/InfoBanner";
import { BackButton } from "@/components/shared/BackButton";
import { complaintsApi } from "@/lib/api";
import { toast } from "sonner";
import type { Complaint } from "@/types";

function TrackPageInner() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Complaint | null | undefined>(undefined);
  const [searching, setSearching] = useState(false);

  async function fetchComplaint(trackingCode: string) {
    setSearching(true);
    try {
      const complaint = await complaintsApi.track(trackingCode.trim().toUpperCase());
      setResult(complaint);
    } catch {
      setResult(null);
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    const param = searchParams.get("code");
    if (param) {
      setCode(param.toUpperCase());
      fetchComplaint(param);
    }
  }, [searchParams]);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    fetchComplaint(code);
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 dark:bg-[var(--bg-base)] px-4 py-12">
      <div className="w-full max-w-lg">
        <BackButton />
        <div className="mt-4 flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">CivicTrack</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Track Your Complaint</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-[var(--text-muted)]">
            Enter your tracking code to see the latest status and history.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mt-6 rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white p-6 shadow-sm">
          <Label htmlFor="tracking-code">Tracking Code</Label>
          <div className="mt-1 flex gap-2">
            <Input
              id="tracking-code"
              placeholder="e.g. CMP-2026-00001"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button type="submit" disabled={searching}>
              {searching ? (
                <span className="flex items-center gap-1">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white dark:border-[var(--border-subtle)] border-t-transparent" />
                </span>
              ) : (
                <Search className="h-4 w-4" />
              )}
              Track
            </Button>
          </div>
        </form>

        {result === null && (
          <div className="mt-6 rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-gray-600 dark:text-[var(--text-muted)]">
              No complaint found for tracking code <span className="font-medium">{code}</span>.
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-[var(--text-muted)]">Double-check the code and try again.</p>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)]">{result.trackingCode}</p>
                  <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">{result.title}</h2>
                </div>
                <StatusBadge status={result.status} />
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-[var(--text-muted)]">
                {result.departmentName} · {result.categoryName}
              </p>
              <div className="mt-4 flex gap-2">
                <ShareMenu trackingCode={result.trackingCode} title={result.title} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const { generateComplaintPdf } = await import("@/lib/generateComplaintPdf");
                    generateComplaintPdf(result);
                    toast.success("PDF downloaded");
                  }}
                >
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>

            <div className="rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-[var(--text-secondary)]">Activity Timeline</h3>
              <div className="mt-4">
                <ComplaintTimeline updates={result.updates} showAuthor={false} />
              </div>
            </div>

            <div className="rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-[var(--text-secondary)] mb-3">Location Details</h3>
              <MapWidget location={result.location} latitude={result.latitude} longitude={result.longitude} />
            </div>

            <InfoBanner title="Need Assistance?">
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Call our helpline at <span className="font-medium">1122</span> for urgent issues.
              </div>
            </InfoBanner>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-[var(--brand-accent)] hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense>
      <TrackPageInner />
    </Suspense>
  );
}
