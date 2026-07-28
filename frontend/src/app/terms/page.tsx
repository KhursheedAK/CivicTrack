import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { BackButton } from "@/components/shared/BackButton";

export default function TermsPage() {
  return (
    <div className="bg-white dark:bg-[var(--bg-base)]">
      <PublicHeader />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <BackButton />
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Terms of Service</h1>
        <p className="mt-2 text-sm text-gray-400 dark:text-[var(--text-muted)]">Last updated: July 13, 2026</p>

        <p className="mt-6 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          Please read these Terms of Service (&quot;Terms&quot;) carefully before using
          CivicTrack. By creating an account or using the platform, you agree to these Terms.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">1. What CivicTrack Is</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          CivicTrack is a civic complaint and resolution portal that lets citizens report
          municipal issues (such as water supply, road damage, or power outages) to the
          relevant local department, and lets municipal officers and administrators review,
          act on, and resolve those reports.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">2. Accounts</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          <li>You must provide accurate information when registering, and keep your account credentials confidential.</li>
          <li>You are responsible for all activity that happens under your account.</li>
          <li>One account per person. Officer and Administrator accounts are provisioned directly by CivicTrack administrators and are not self-registrable.</li>
          <li>If you believe your account has been compromised, reset your password immediately and contact Support.</li>
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">3. Acceptable Use</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">When using CivicTrack, you agree not to:</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          <li>Submit false, misleading, or fraudulent complaints</li>
          <li>Upload attachments that are abusive, unlawful, or that you do not have the right to share</li>
          <li>Attempt to access another user&apos;s account, complaints, or data without authorization</li>
          <li>Attempt to disrupt, overload, or reverse-engineer the platform</li>
          <li>Use the platform for anything other than its intended civic-reporting purpose</li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          We reserve the right to suspend or deactivate accounts that violate these terms.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">4. Complaint Content</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          By submitting a complaint — including any text, photos, or location data — you
          confirm the information is accurate to the best of your knowledge, and you grant
          CivicTrack a license to store, display, and share that content with the relevant
          municipal department and officers solely for the purpose of investigating and
          resolving your complaint.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">5. Roles and Responsibilities</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          <li><strong>Citizens</strong> may submit complaints, track their status, and close a complaint once resolved.</li>
          <li><strong>Officers</strong> are responsible for reviewing complaints assigned to their department, updating their status accurately, and communicating resolution steps.</li>
          <li><strong>Administrators</strong> oversee departments, categories, user accounts, and platform-wide data, and may override any complaint status when necessary.</li>
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">6. Availability</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          CivicTrack is provided on an &quot;as-is&quot; and &quot;as-available&quot; basis. As
          an actively developed civic-tech initiative, we do not guarantee uninterrupted
          access, and features may change, be added, or be removed as the platform evolves.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">7. Limitation of Liability</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          To the fullest extent permitted by law, CivicTrack and its operators are not liable
          for any indirect, incidental, or consequential damages arising from your use of the
          platform, or from delays or outcomes in the resolution of complaints submitted
          through it. CivicTrack is a reporting and routing tool — the underlying repair or
          resolution work is carried out by the relevant municipal department, not by
          CivicTrack itself.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">8. Changes to These Terms</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          We may revise these Terms from time to time. We&apos;ll update the &quot;Last
          updated&quot; date above when we do. Continuing to use CivicTrack after a revision
          means you accept the updated Terms.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">9. Governing Law</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          These Terms are governed by the laws of Pakistan, without regard to conflict-of-law
          principles.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">10. Contact</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-[var(--text-muted)]">
          Questions about these Terms? Reach out via the{" "}
          <Link href="/support" className="text-blue-600 dark:text-[var(--brand-accent)] hover:underline">Support</Link> page.
        </p>
      </div>
    </div>
  );
}
