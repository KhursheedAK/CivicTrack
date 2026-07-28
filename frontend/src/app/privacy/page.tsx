import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { BackButton } from "@/components/shared/BackButton";

export default function PrivacyPage() {
  return (
    <div className="bg-white dark:bg-[var(--bg-base)]">
      <PublicHeader />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <BackButton />
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-400 dark:text-[var(--text-muted)]">Last updated: July 13, 2026</p>

        <p className="mt-6 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          CivicTrack (&quot;we&quot;, &quot;us&quot;, &quot;the platform&quot;) is a citizen
          complaint and resolution portal that helps residents report and track municipal
          issues — water and sanitation, roads and infrastructure, and electricity and power
          — and helps municipal staff resolve them. This policy explains what information we
          collect, how we use it, and who we share it with.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Information We Collect</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          <strong>Account information.</strong> When you register, we collect your name, email
          address, and password. Your password is never stored in plain text — it is hashed
          before being saved, and we cannot recover or view your original password.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          <strong>Complaint information.</strong> When you submit a complaint, we collect the
          title, description, and location you provide, the department and category you
          select, and — if you choose to use the map — the exact coordinates you pin. Sharing
          your location on the map is entirely optional; submitting a complaint only requires
          a written location description.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          <strong>Photos.</strong> If you attach photos to a complaint, they are uploaded to
          and stored by Cloudinary, our image-hosting provider, not on our own servers. See
          &quot;Third-Party Services&quot; below.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          <strong>Session cookies.</strong> When you log in, we set two small, functional
          cookies that keep you signed in. These are marked <code>HttpOnly</code> (inaccessible
          to page scripts) and are used solely to authenticate your requests — we do not use
          advertising or third-party tracking cookies of any kind.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">How We Use Your Information</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          <li>Create and secure your account</li>
          <li>Route your complaint to the correct department and notify the assigned officer</li>
          <li>
            Send you email and in-app notifications about your complaint&apos;s status (adjust
            which emails you receive in Settings → Notifications)
          </li>
          <li>Let you and municipal staff look up a complaint by its public tracking code</li>
          <li>Investigate misuse or abuse of the platform</li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          We do not sell your personal information, and we do not use it for advertising.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Who Can See Your Information</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          <li><strong>Citizens</strong> can only see their own complaints and profile.</li>
          <li><strong>Officers</strong> can see complaints filed within their assigned department.</li>
          <li><strong>Administrators</strong> can see all complaints and manage user and department records.</li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          Access to complaint attachments and personal data is restricted at the application
          level based on your account role — a citizen can never see another citizen&apos;s
          complaint.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Third-Party Services</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          We rely on a small number of external services to operate CivicTrack:
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          <li><strong>Cloudinary</strong> — stores and serves photos attached to complaints.</li>
          <li><strong>Our email provider</strong> — sends verification, password-reset, and status-update emails on our behalf.</li>
          <li>
            <strong>OpenStreetMap (Nominatim)</strong> — if you use the address-search box when
            pinning a location, the text you type is sent to OpenStreetMap&apos;s public search
            service to find matching places. This only happens when you actively use that
            search box.
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          We share only the minimum information necessary with each of these services to
          provide their specific function.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Data Retention</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          We do not currently operate an automated data-retention or deletion schedule.
          Administrators can deactivate accounts, and complaint records may be removed by an
          administrator where appropriate. If you would like your account or complaint data
          reviewed, corrected, or deleted, contact us — see{" "}
          <Link href="/support" className="text-blue-600 dark:text-[var(--brand-accent)] hover:underline">Support</Link>.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Your Choices</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          <li>Update your profile information at any time from Settings.</li>
          <li>Control which email notifications you receive from Settings → Notifications.</li>
          <li>Request a password reset at any time from the login page if you forget your password.</li>
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Changes to This Policy</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          We may update this policy as the platform evolves. Continued use of CivicTrack after
          a change means you accept the revised policy. We&apos;ll update the &quot;Last
          updated&quot; date above whenever this happens.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Contact</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          Questions about this policy or your data? Reach out via the{" "}
          <Link href="/support" className="text-blue-600 dark:text-[var(--brand-accent)] hover:underline">Support</Link> page.
        </p>
      </div>
    </div>
  );
}
