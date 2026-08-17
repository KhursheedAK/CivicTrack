"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Link2, Mail, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareMenuProps {
  trackingCode: string;
  title: string;
}

export function ShareMenu({ trackingCode, title }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/track?code=${trackingCode}`
      : `/track?code=${trackingCode}`;

  const text = `Track my complaint "${title}" on Municipal Civic Track using code: ${trackingCode}`;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function handleNativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `Complaint ${trackingCode}`, text, url });
        return;
      } catch {
        // user cancelled or not supported — fall through to menu
      }
    }
    setOpen((v) => !v);
  }

  const options = [
    {
      label: "WhatsApp",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#25D366]">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
    },
    {
      label: "Email",
      icon: <Mail className="h-4 w-4 text-blue-500" />,
      href: `mailto:?subject=${encodeURIComponent(`Complaint ${trackingCode}`)}&body=${encodeURIComponent(`${text}\n\nTrack here: ${url}`)}`,
    },
    {
      label: "SMS",
      icon: <MessageCircle className="h-4 w-4 text-green-500" />,
      href: `sms:?body=${encodeURIComponent(`${text} ${url}`)}`,
    },
    {
      label: "Copy Link",
      icon: <Link2 className="h-4 w-4 text-gray-500" />,
      onClick: () => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
        setOpen(false);
      },
    },
  ];

  return (
    <div ref={ref} className="relative">
      <Button variant="outline" size="sm" onClick={handleNativeShare}>
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-44 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-[var(--border-subtle)] dark:bg-[var(--bg-surface)]">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-[var(--border-subtle)] px-3 py-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-[var(--text-muted)]">Share via</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <ul className="py-1">
            {options.map((opt) => (
              <li key={opt.label}>
                {opt.href ? (
                  <a
                    href={opt.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-50 dark:hover:bg-[var(--bg-surface-2)]"
                  >
                    {opt.icon}
                    {opt.label}
                  </a>
                ) : (
                  <button
                    onClick={opt.onClick}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-50 dark:hover:bg-[var(--bg-surface-2)]"
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
