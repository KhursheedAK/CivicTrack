"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { LocateFixed } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationSearch } from "./LocationSearch";

// Leaflet touches `window` at module load time, so it can only run in the browser —
// even inside a "use client" file, Next.js still server-renders on first load unless
// the import itself is deferred with ssr: false.
const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => <div className="h-56 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-[var(--bg-surface-2)]" />,
});

const DEFAULT_CENTER = { lat: 33.6844, lng: 73.0479 }; // Islamabad

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (coords: { latitude: number; longitude: number }) => void;
}

export function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
  const [locating, setLocating] = useState(false);

  // Leaflet throws on an invalid LatLng, unlike the old iframe embed which just
  // silently ignored a malformed query string — guard against NaN from a
  // mid-edit/cleared number input, not just `undefined`.
  const lat = Number.isFinite(latitude) ? (latitude as number) : DEFAULT_CENTER.lat;
  const lng = Number.isFinite(longitude) ? (longitude as number) : DEFAULT_CENTER.lng;

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setLocating(false);
        toast.success("Pinned your current location");
      },
      () => {
        setLocating(false);
        toast.error("Unable to access your location");
      }
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>
          Pin on Map <span className="font-normal text-gray-400 dark:text-[var(--text-muted)]">(optional)</span>
        </Label>
        <Button type="button" size="sm" variant="outline" onClick={useCurrentLocation} disabled={locating}>
          <LocateFixed className="h-4 w-4" />
          {locating ? "Locating..." : "Use My Current Location"}
        </Button>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Search for an address</Label>
        <LocationSearch
          onSelect={({ latitude: foundLat, longitude: foundLng, label }) => {
            onChange({ latitude: foundLat, longitude: foundLng });
            toast.success(`Pinned: ${label}`);
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="latitude" className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Or enter latitude directly</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            placeholder="33.6844"
            value={latitude ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              onChange({ latitude: value === "" ? Number.NaN : Number(value), longitude: lng });
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="longitude" className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Or enter longitude directly</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            placeholder="73.0479"
            value={longitude ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              onChange({ latitude: lat, longitude: value === "" ? Number.NaN : Number(value) });
            }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-[var(--border-subtle)]">
        <InteractiveMap latitude={lat} longitude={lng} onChange={onChange} />
      </div>
      <p className="text-xs text-gray-400 dark:text-[var(--text-muted)]">
        Search an address, drag the map, click anywhere, or use your current location — you
        don&apos;t need to be at the location right now.
      </p>
    </div>
  );
}
