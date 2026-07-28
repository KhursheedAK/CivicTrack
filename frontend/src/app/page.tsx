import Link from "next/link";
import Image from "next/image";
import {
  BadgeCheck,
  CircleCheckBig,
  CirclePlus,
  Radar,
  FileUp,
  Eye,
  Smartphone,
  ArrowRight,
  Globe,
  CircleHelp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layout/PublicHeader";

const FOOTER_COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "How it works", href: "#" },
      { label: "Data Security", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Twitter", href: "#" },
      { label: "Support", href: "/support" },
    ],
  },
];

const STATS = [
  { value: "94%", label: "Satisfaction" },
  { value: "48h", label: "Turnaround" },
  { value: "120", label: "Departments" },
  { value: "2.1M", label: "Citizens" },
];

export default function LandingPage() {
  return (
    <div className="bg-white dark:bg-[var(--bg-base)]">
      <PublicHeader />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-blue-50/70 to-white dark:from-transparent dark:to-transparent">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden dark:block dark:bg-[radial-gradient(ellipse_at_30%_20%,rgba(77,141,255,0.12),transparent_60%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-[var(--brand-accent-glow)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-[var(--brand-accent)]">
                <BadgeCheck className="h-3.5 w-3.5" />
                Official Portal for Pakistan
              </span>
              <h1 className="mt-6 text-5xl leading-tight tracking-tight text-gray-900 dark:text-[var(--text-primary)] sm:text-6xl">
                Your Direct Line to
                <br />
                <span className="font-bold text-blue-600 dark:text-[var(--brand-accent)]">Better Services.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base text-gray-600 dark:text-[var(--text-muted)]">
                CivicTrack empowers citizens to report municipal issues, track resolutions in
                real-time, and hold public services accountable. Transparent, efficient, and
                built for a modern Pakistan.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/complaint/new">
                    <CirclePlus className="h-4 w-4" />
                    Submit Complaint
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/track">
                    <Radar className="h-4 w-4" />
                    Track Complaint
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl border border-transparent shadow-xl dark:border-[var(--border-subtle)] dark:shadow-[0_0_60px_rgba(77,141,255,0.15)]">
                <Image
                  src="https://picsum.photos/seed/civictrack-dashboard/900/700"
                  alt="CivicTrack city dashboard preview"
                  width={900}
                  height={700}
                  className="h-full w-full object-cover"
                  unoptimized
                  priority
                />
                <div aria-hidden className="absolute inset-0 hidden dark:block dark:bg-black/10" />
              </div>
              <div className="elev-1 absolute -bottom-6 left-6 flex items-center gap-3 rounded-xl bg-white dark:bg-transparent p-4 shadow-lg">
                <div className="pill-success flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CircleCheckBig className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-[var(--text-muted)]">Latest Resolution</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-[var(--text-primary)]">Road repair in Gulberg complete.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Designed for Accountability</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-[var(--text-muted)]">
            Streamlining the link between citizens and administration.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="elev-1 elev-hover rounded-xl border border-gray-200 dark:border-transparent p-8 lg:col-span-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 dark:rounded-xl dark:bg-[var(--brand-accent-glow)] text-blue-600 dark:text-[var(--brand-accent)]">
              <Radar className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Quick Resolution Pipeline</h3>
            <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-[var(--text-muted)]">
              Our intelligent routing system sends your report directly to the relevant
              department, bypassing bureaucratic delays for faster fixes.
            </p>
            <div className="mt-6 grid max-w-xs grid-cols-2 gap-6 border-t border-gray-100 dark:border-[var(--border-subtle)] pt-6">
              <div>
                <p className="text-glow-accent text-2xl font-bold text-blue-600 dark:text-[var(--brand-accent)]">24h</p>
                <p className="text-xs text-gray-400 dark:text-[var(--text-muted)]">Avg. Response</p>
              </div>
              <div>
                <p className="text-glow-accent text-2xl font-bold text-blue-600 dark:text-[var(--brand-accent)]">15k+</p>
                <p className="text-xs text-gray-400 dark:text-[var(--text-muted)]">Resolved Cases</p>
              </div>
            </div>
          </div>

          <div className="elev-1 elev-hover rounded-xl border border-gray-200 dark:border-transparent p-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 dark:rounded-xl dark:bg-[var(--brand-accent-glow)] text-blue-600 dark:text-[var(--brand-accent)]">
              <FileUp className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Easy Evidence Upload</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-[var(--text-muted)]">
              Attach photos and GPS location directly from your phone. Precise data means
              faster action.
            </p>
          </div>

          <div className="elev-1 elev-hover rounded-xl border border-gray-200 dark:border-transparent p-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 dark:rounded-xl dark:bg-[var(--brand-accent-glow)] text-blue-600 dark:text-[var(--brand-accent)]">
              <Eye className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Transparent Tracking</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-[var(--text-muted)]">
              Monitor every stage of your complaint, from &apos;Received&apos; to
              &apos;Resolved&apos;, with full transparency.
            </p>
          </div>

          <div className="elev-1 flex flex-col gap-6 rounded-xl bg-blue-50 dark:border-transparent p-8 sm:flex-row sm:items-center lg:col-span-2">
            <div className="flex-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white dark:rounded-xl dark:bg-[var(--brand-accent-glow)] text-blue-600 dark:text-[var(--brand-accent)]">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Mobile-Ready Accessibility</h3>
              <p className="mt-2 max-w-sm text-sm text-gray-600 dark:text-[var(--text-muted)]">
                Access CivicTrack on any device. Designed for high performance even on
                low-bandwidth connections across Pakistan.
              </p>
              <Link
                href="/register"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-[var(--brand-accent)] hover:underline"
              >
                Learn more
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="overflow-hidden rounded-xl sm:w-64 sm:shrink-0">
              <Image
                src="https://picsum.photos/seed/civictrack-mobile/480/360"
                alt="CivicTrack mobile app preview"
                width={480}
                height={360}
                className="h-full w-full object-cover dark:brightness-[0.85]"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="elev-1 band-accent-top flex flex-col gap-8 rounded-2xl border border-gray-200 dark:border-transparent bg-white p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Empowering the Nation</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-[var(--text-muted)]">Real-time impact across all districts.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-glow-accent text-3xl font-bold text-blue-600 dark:text-[var(--brand-accent)]">{stat.value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-[var(--border-subtle)] bg-blue-50/40 dark:bg-[var(--bg-chrome)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
            <div>
              <span className="text-lg font-bold text-blue-600 dark:text-[var(--brand-accent)]">CivicTrack</span>
              <p className="mt-3 text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                Building a more transparent and responsive infrastructure for all Pakistani
                citizens.
              </p>
            </div>
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-[var(--text-primary)]">{column.title}</h4>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-gray-500 dark:text-[var(--text-secondary)] hover:text-gray-900 dark:hover:text-[var(--brand-accent)]">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-200 dark:border-[var(--border-subtle)] pt-6 sm:flex-row">
            <p className="text-xs text-gray-400 dark:text-[var(--text-muted)]">
              &copy; 2024 CivicTrack. Initiative led by Khursheed Alam Khan.
            </p>
            <div className="flex items-center gap-2 text-gray-400 dark:text-[var(--text-muted)]">
              <Globe className="h-4 w-4" />
              <CircleHelp className="h-4 w-4" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
