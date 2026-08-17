import { MapPin } from "lucide-react";

interface MapWidgetProps {
  location: string;
  latitude?: number | null;
  longitude?: number | null;
}

export function MapWidget({ location, latitude, longitude }: MapWidgetProps) {
  const hasPin = latitude != null && longitude != null;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-[var(--border-subtle)]">
      {hasPin ? (
        <iframe
          title="Complaint location map"
          className="h-40 w-full"
          loading="lazy"
          src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
        />
      ) : (
        <div className="relative flex h-40 items-center justify-center bg-[linear-gradient(135deg,#e5edff_25%,#eef2ff_25%,#eef2ff_50%,#e5edff_50%,#e5edff_75%,#eef2ff_75%,#eef2ff_100%)] bg-[length:24px_24px] dark:bg-none dark:bg-[var(--bg-surface-2)] dark:border-2 dark:border-dashed dark:border-[var(--border-strong)]">
          <div className="flex flex-col items-center gap-1 text-blue-600 dark:text-[var(--brand-accent)]">
            <MapPin className="h-8 w-8 fill-blue-100 dark:fill-[var(--brand-accent-glow)]" />
            <span className="text-xs font-medium text-blue-700 dark:text-[var(--brand-accent)]">No location pinned</span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 border-t border-gray-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-surface)] px-4 py-3">
        <MapPin className="h-4 w-4 shrink-0 text-gray-400 dark:text-[var(--text-muted)]" />
        <p className="text-sm text-gray-700 dark:text-[var(--text-secondary)]">{location}</p>
      </div>
    </div>
  );
}
