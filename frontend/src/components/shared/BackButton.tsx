"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallbackHref?: string;
}

// These pages are linked from several places (home footer, every auth page's footer,
// and now each other), so a hardcoded destination would often be wrong. Real browser
// history is the only thing that reliably goes back to wherever the user actually came
// from. Falls back to a fixed href only when there's no meaningful history to return to
// (e.g. someone opened the page directly in a new tab).
export function BackButton({ fallbackHref = "/" }: BackButtonProps) {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-[var(--text-muted)] hover:text-gray-900 dark:hover:text-[var(--text-primary)]"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}
