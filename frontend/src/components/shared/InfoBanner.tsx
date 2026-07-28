import type { LucideIcon } from "lucide-react";
import { Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type InfoBannerVariant = "info" | "success" | "danger";

const VARIANT_STYLES: Record<InfoBannerVariant, string> = {
  info: "bg-blue-50 border-blue-100 text-blue-800 dark:bg-[var(--brand-accent-glow)] dark:border-[rgba(77,141,255,0.25)] dark:text-[var(--text-primary)]",
  success: "bg-green-50 border-green-100 text-green-800 pill-success dark:border-[rgba(52,211,153,0.25)]",
  danger: "bg-red-50 border-red-100 text-red-800 pill-danger dark:border-[rgba(248,113,113,0.25)]",
};

const VARIANT_ICONS: Record<InfoBannerVariant, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  danger: AlertTriangle,
};

interface InfoBannerProps {
  variant?: InfoBannerVariant;
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function InfoBanner({ variant = "info", title, children, action, className }: InfoBannerProps) {
  const Icon = VARIANT_ICONS[variant];
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border p-4", VARIANT_STYLES[variant], className)}>
      <Icon className="h-5 w-5 mt-0.5 shrink-0" />
      <div className="flex-1 text-sm">
        {title && <p className="font-medium">{title}</p>}
        <div className={cn(title && "mt-1")}>{children}</div>
      </div>
      {action}
    </div>
  );
}
