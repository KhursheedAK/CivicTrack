import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center text-sm text-gray-500 dark:text-[var(--text-muted)]" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center">
          {index > 0 && <ChevronRight className="mx-1.5 h-3.5 w-3.5 text-gray-300 dark:text-[var(--text-muted)]" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-700 dark:hover:text-[var(--text-secondary)]">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-[var(--text-primary)] font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
