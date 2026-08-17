"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationSearchProps {
  onSelect: (coords: { latitude: number; longitude: number; label: string }) => void;
}

// Soft bias toward Pakistan (this app's seed data/typical usage), not a hard filter —
// `bounded=0` means results elsewhere in the world still surface, just ranked lower.
const PK_VIEWBOX = "60.5,37.5,77.5,23.5";

export function LocationSearch({ onSelect }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          format: "json",
          q: query,
          limit: "5",
          viewbox: PK_VIEWBOX,
          bounded: "0",
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        const data: NominatimResult[] = await response.json();
        setResults(data);
        setOpen(true);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handlePick(result: NominatimResult) {
    onSelect({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      label: result.display_name,
    });
    setQuery(result.display_name);
    setOpen(false);
    setResults([]);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[var(--text-muted)]" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search a street, landmark, or area..."
          className="pl-8 pr-8 dark:pl-8 dark:pr-8"
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400 dark:text-[var(--text-muted)]" />
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="elev-3 absolute z-[1100] mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 dark:border-transparent bg-white text-sm shadow-lg">
          {results.map((result) => (
            <li key={result.place_id}>
              <button
                type="button"
                onClick={() => handlePick(result)}
                className="block w-full truncate px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[var(--bg-surface-2)]"
                title={result.display_name}
              >
                {result.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
