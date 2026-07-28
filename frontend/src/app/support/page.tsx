import Link from "next/link";
import { Mail } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { BackButton } from "@/components/shared/BackButton";

const FAQS = [
  {
    q: "How do I submit a complaint?",
    a: "Register for a citizen account (or log in if you already have one), then go to “Submit a Complaint.” Fill in a title, description, and location, choose the relevant department and category, and optionally attach photos or pin a location on the map.",
  },
  {
    q: "How do I track my complaint after submitting it?",
    a: "Every complaint gets a unique tracking code in the format CMP-YYYY-NNNNN (for example, CMP-2026-00031), shown right after you submit and included in your confirmation email. Enter it on the public Track Complaints page — no login required — or view it directly from your dashboard if you're logged in.",
  },
  {
    q: "What do the different statuses mean?",
    a: "Submitted (received, awaiting review) → Under Review (an officer is reviewing it) → In Progress (work has begun) → Resolved (work is complete) → Closed (you or an administrator confirmed it's fully resolved). A complaint can also be Rejected, with a reason included in its update history.",
  },
  {
    q: "Can I upload photos?",
    a: "Yes — up to 3 photos per complaint, JPG/PNG/WEBP format, 5MB max each.",
  },
  {
    q: "I forgot my password. What do I do?",
    a: "Click “Forgot Password?” on the login page and enter your email. We'll send a reset link that's valid for 1 hour and can only be used once.",
  },
  {
    q: "Will I be notified when my complaint's status changes?",
    a: "Yes, both in-app (the bell icon) and by email, unless you've turned email notifications off in Settings → Notifications.",
  },
  {
    q: "How do I know which department handles my issue?",
    a: "Water & Sanitation (leaking pipes, no water supply), Roads & Infrastructure (potholes/road damage, street lights), or Electricity & Power (power outages, billing disputes). Pick whichever matches your issue most closely when submitting — this determines which department's officers can see and act on it.",
  },
  {
    q: "Who can see my complaint and photos?",
    a: "Only you, the officers in the department it was filed under, and administrators. Other citizens can never see your complaints.",
  },
];

export default function SupportPage() {
  return (
    <div className="bg-white dark:bg-[var(--bg-base)]">
      <PublicHeader />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <BackButton />
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Support</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          Need help with CivicTrack? Start with the quick links or FAQ below — or reach out
          directly if you can&apos;t find what you need.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/track"
            className="rounded-lg border border-gray-200 dark:border-[var(--border-subtle)] p-4 text-sm font-medium text-gray-900 dark:text-[var(--text-primary)] hover:border-blue-300 hover:bg-blue-50/50 dark:hover:border-[var(--brand-accent)] dark:hover:bg-[var(--brand-accent-glow)]"
          >
            Track a complaint
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-gray-200 dark:border-[var(--border-subtle)] p-4 text-sm font-medium text-gray-900 dark:text-[var(--text-primary)] hover:border-blue-300 hover:bg-blue-50/50 dark:hover:border-[var(--brand-accent)] dark:hover:bg-[var(--brand-accent-glow)]"
          >
            Create an account
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-200 dark:border-[var(--border-subtle)] p-4 text-sm font-medium text-gray-900 dark:text-[var(--text-primary)] hover:border-blue-300 hover:bg-blue-50/50 dark:hover:border-[var(--brand-accent)] dark:hover:bg-[var(--brand-accent-glow)]"
          >
            Log in
          </Link>
        </div>

        <h2 className="mt-10 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Frequently Asked Questions</h2>
        <div className="mt-4 space-y-5">
          {FAQS.map((item) => (
            <div key={item.q}>
              <p className="text-sm font-semibold text-gray-900 dark:text-[var(--text-primary)]">{item.q}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">{item.a}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Still Need Help?</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          Email us directly and we&apos;ll get back to you as soon as we can.
        </p>
        <a
          href="mailto:khursheedakhan.engineer@gmail.com"
          className="mt-3 inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-gray-900 dark:text-[var(--text-primary)] hover:border-blue-300 hover:bg-blue-50/50 dark:hover:border-[var(--brand-accent)] dark:hover:bg-[var(--brand-accent-glow)]"
        >
          <Mail className="h-4 w-4" />
          khursheedakhan.engineer@gmail.com
        </a>

        <p className="mt-10 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          For questions about how we handle your data, see our{" "}
          <Link href="/privacy" className="text-blue-600 dark:text-[var(--brand-accent)] hover:underline">Privacy Policy</Link>{" "}
          and{" "}
          <Link href="/terms" className="text-blue-600 dark:text-[var(--brand-accent)] hover:underline">Terms of Service</Link>.
        </p>
      </div>
    </div>
  );
}
