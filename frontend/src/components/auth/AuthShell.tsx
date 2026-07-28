import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-[var(--bg-base)] px-4 py-12">
      <div className="w-full max-w-[440px]">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">CivicTrack</span>
          </Link>
          <p className="mt-1 text-sm text-gray-500 dark:text-[var(--text-muted)]">Municipal Governance Portal</p>
        </div>

        <div className="mt-8 rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">{title}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-[var(--text-muted)]">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600 dark:text-[var(--text-muted)]">{footer}</div>

        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-[var(--text-muted)]">
            <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-[var(--text-secondary)]">Privacy Policy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-gray-600 dark:hover:text-[var(--text-secondary)]">Terms of Service</Link>
            <span>·</span>
            <Link href="/support" className="hover:text-gray-600 dark:hover:text-[var(--text-secondary)]">Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
