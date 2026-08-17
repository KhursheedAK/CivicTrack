"use client";

import { useState } from "react";
import { Lock, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { PasswordSection } from "@/components/settings/PasswordSection";
import { ProfileForm } from "@/components/settings/ProfileForm";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "security", label: "Security", icon: Lock },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionId>("profile");

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Admin Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-[var(--text-muted)]">Configure your profile and security settings.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="elev-1 flex flex-col gap-1 rounded-lg border border-gray-200 dark:border-transparent bg-white p-2">
          {SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-[var(--brand-accent-glow)] dark:text-[var(--brand-accent)]"
                    : "text-gray-600 dark:text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--bg-surface-2)]"
                )}
              >
                <section.icon className={cn("h-4 w-4", isActive ? "text-blue-600 dark:text-[var(--brand-accent)]" : "text-gray-400 dark:text-[var(--text-muted)]")} />
                {section.label}
              </button>
            );
          })}
        </nav>

        <div>
          {activeSection === "profile" && <ProfileForm />}
          {activeSection === "security" && <PasswordSection />}
        </div>
      </div>
    </div>
  );
}
