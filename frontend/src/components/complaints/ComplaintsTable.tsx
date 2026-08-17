import Link from "next/link";
import { Paperclip, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/complaints/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Complaint } from "@/types";

interface ComplaintsTableProps {
  complaints: Complaint[];
  variant: "citizen" | "officer";
  basePath: string;
}

export function ComplaintsTable({ complaints, variant, basePath }: ComplaintsTableProps) {
  if (complaints.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No complaints found"
        description="Try adjusting your filters or search criteria."
      />
    );
  }

  const headClass = "text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[var(--text-muted)]";

  return (
    <Table>
      <TableHeader>
        <TableRow className="dark:border-[var(--border-subtle)]">
          <TableHead className={headClass}>Tracking Code</TableHead>
          <TableHead className={headClass}>Title</TableHead>
          <TableHead className={headClass}>Status</TableHead>
          {variant === "officer" && (
            <>
              <TableHead className={headClass}>Category</TableHead>
              <TableHead className={headClass}>Citizen</TableHead>
            </>
          )}
          <TableHead className={headClass}>Date</TableHead>
          {variant === "citizen" && (
            <TableHead className={cn(headClass, "text-right")}>Files</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {complaints.map((complaint) => (
          <TableRow key={complaint.id} className="dark:border-[var(--border-subtle)] hover:bg-gray-50 dark:hover:bg-[var(--bg-surface-2)]">
            <TableCell className="font-medium text-gray-900 dark:text-[var(--text-primary)]">
              <Link href={`${basePath}/${complaint.id}`} className="text-blue-600 dark:text-[var(--brand-accent)] hover:underline">
                {complaint.trackingCode}
              </Link>
            </TableCell>
            <TableCell className="max-w-xs truncate text-gray-700 dark:text-[var(--text-secondary)]">{complaint.title}</TableCell>
            <TableCell>
              <StatusBadge status={complaint.status} />
            </TableCell>
            {variant === "officer" && (
              <>
                <TableCell className="text-gray-600 dark:text-[var(--text-muted)]">{complaint.categoryName}</TableCell>
                <TableCell className="text-gray-600 dark:text-[var(--text-muted)]">{complaint.citizenName}</TableCell>
              </>
            )}
            <TableCell className="text-gray-500 dark:text-[var(--text-muted)]">{formatDate(complaint.createdAt)}</TableCell>
            {variant === "citizen" && (
              <TableCell className="text-right">
                {complaint.attachments.length > 0 ? (
                  <span className="inline-flex items-center gap-1 text-gray-500 dark:text-[var(--text-muted)]">
                    <Paperclip className="h-3.5 w-3.5" />
                    {complaint.attachments.length}
                  </span>
                ) : (
                  <span className="text-gray-300 dark:text-[var(--text-muted)]">—</span>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
