"use client";

import { useMemo, useState } from "react";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { SearchInput } from "@/components/shared/SearchInput";
import { Pagination } from "@/components/shared/Pagination";
import { ComplaintsTable } from "@/components/complaints/ComplaintsTable";
import type { Complaint, ComplaintStatus } from "@/types";

const OPEN_STATUSES: ComplaintStatus[] = ["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS"];
const RESOLVED_STATUSES: ComplaintStatus[] = ["RESOLVED", "CLOSED"];

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Resolved", value: "resolved" },
];

const PAGE_SIZE = 8;

interface ComplaintsListViewProps {
  complaints: Complaint[];
  variant: "citizen" | "officer";
  basePath: string;
  filters?: { label: string; value: string }[];
  loading?: boolean;
}

export function ComplaintsListView({ complaints, variant, basePath, filters = FILTERS, loading = false }: ComplaintsListViewProps) {
  const [filter, setFilter] = useState(filters[0].value);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = complaints;

    if (filter === "open") list = list.filter((c) => OPEN_STATUSES.includes(c.status));
    else if (filter === "resolved") list = list.filter((c) => RESOLVED_STATUSES.includes(c.status));
    else if (filter !== "all") list = list.filter((c) => c.status === filter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) => c.trackingCode.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
      );
    }

    return list;
  }, [complaints, filter, search]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--bg-surface)]">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-md bg-gray-100 dark:bg-[var(--bg-surface-2)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--bg-surface)]">
      <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-[var(--border-subtle)] sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          options={filters}
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setPage(1);
          }}
        />
        <SearchInput
          placeholder="Search by tracking code or title..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          containerClassName="sm:w-72"
        />
      </div>
      <ComplaintsTable complaints={paged} variant={variant} basePath={basePath} />
      {filtered.length > 0 && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
      )}
    </div>
  );
}
