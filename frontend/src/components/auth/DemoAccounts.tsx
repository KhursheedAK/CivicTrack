"use client";

import { Loader2, ShieldCheck, UserRound, HardHat, type LucideIcon } from "lucide-react";

export interface DemoAccount {
  role: "CITIZEN" | "OFFICER" | "ADMIN";
  label: string;
  description: string;
  email: string;
  password: string;
  icon: LucideIcon;
  tone: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "CITIZEN",
    label: "Citizen",
    description: "File & track complaints",
    email: "citizen@civictrack.app",
    password: "Citizen@1234",
    icon: UserRound,
    tone: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  },
  {
    role: "OFFICER",
    label: "Officer",
    description: "Resolve assigned cases",
    email: "officer@civictrack.app",
    password: "Officer@1234",
    icon: HardHat,
    tone: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  },
  {
    role: "ADMIN",
    label: "Admin",
    description: "Oversee everything",
    email: "admin@civictrack.app",
    password: "Admin@1234",
    icon: ShieldCheck,
    tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
];

interface DemoAccountsProps {
  onSelect: (account: DemoAccount) => void;
  activeRole: DemoAccount["role"] | null;
  disabled: boolean;
}

export function DemoAccounts({ onSelect, activeRole, disabled }: DemoAccountsProps) {
  return (
    <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/50 p-3 dark:border-[var(--brand-accent)]/30 dark:bg-[var(--brand-accent)]/5">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-900 dark:text-[var(--text-primary)]">
        Try a demo account
      </p>
      <p className="mt-0.5 text-xs text-gray-700 dark:text-[var(--text-secondary)]">
        Pick a role to fill the credentials and sign in instantly.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {DEMO_ACCOUNTS.map((account) => {
          const Icon = account.icon;
          const loading = activeRole === account.role;
          return (
            <button
              key={account.role}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(account)}
              title={`${account.email} / ${account.password}`}
              className="group flex flex-col items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-3 text-center transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:border-white/10 dark:bg-[var(--bg-surface,transparent)] dark:hover:border-[var(--brand-accent)]"
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-full ${account.tone}`}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                {account.label}
              </span>
              <span className="text-[11px] leading-tight text-gray-600 dark:text-[var(--text-secondary)]">
                {account.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
