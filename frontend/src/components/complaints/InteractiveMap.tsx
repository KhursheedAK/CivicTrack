"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  onChange: (coords: { latitude: number; longitude: number }) => void;
}

// Only ever fires onChange from genuine user gestures (drag or click) — never from
// the map's own initial mount/programmatic setView, so an untouched map never
// silently "chooses" its default center as the complaint's location.
function MapEvents({ onChange }: { onChange: InteractiveMapProps["onChange"] }) {
  const map = useMapEvents({
    dragend() {
      const center = map.getCenter();
      onChange({ latitude: center.lat, longitude: center.lng });
    },
    click(e: LeafletMouseEvent) {
      map.panTo(e.latlng, { animate: true });
      onChange({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

// Re-centers the map when latitude/longitude change from *outside* (typed into the
// number inputs, or "Use My Current Location") without fighting the pan the user
// just did themselves (that value already matches the map's own center).
function ExternalRecenter({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const current = map.getCenter();
    const changed = Math.abs(current.lat - latitude) > 1e-6 || Math.abs(current.lng - longitude) > 1e-6;
    if (changed) {
      map.setView([latitude, longitude], map.getZoom(), { animate: true });
    }
  }, [latitude, longitude, map]);

  return null;
}

export default function InteractiveMap({ latitude, longitude, onChange }: InteractiveMapProps) {
  return (
    <div className="relative h-56 w-full">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onChange={onChange} />
        <ExternalRecenter latitude={latitude} longitude={longitude} />
      </MapContainer>

      {/* Fixed center pin — the map pans underneath it; wherever it points is the
          selected coordinate. Avoids Leaflet's default marker-icon asset path issues
          under Next.js's bundler entirely. */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1000] -translate-x-1/2 -translate-y-full">
        <svg width="32" height="32" viewBox="0 0 24 24" className="drop-shadow-md">
          <path
            fill="#2563eb"
            stroke="#1d4ed8"
            strokeWidth="1"
            d="M12 0C7.03 0 3 4.03 3 9c0 6.25 7.05 14.19 8.09 15.35a1.2 1.2 0 0 0 1.82 0C13.95 23.19 21 15.25 21 9c0-4.97-4.03-9-9-9z"
          />
          <circle cx="12" cy="9" r="3.2" fill="white" />
        </svg>
      </div>

      <p className="pointer-events-none absolute bottom-1 left-1/2 z-[1000] -translate-x-1/2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
        Drag the map or click to set the location
      </p>
    </div>
  );
}
