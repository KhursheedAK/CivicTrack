"use client";

import { useEffect, useState } from "react";
import { Bell, Building2, Lock, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { departmentsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { InfoBanner } from "@/components/shared/InfoBanner";
import { DataCorrectionDialog } from "@/components/officer/DataCorrectionDialog";
import { MyCorrectionRequests } from "@/components/officer/MyCorrectionRequests";
import { NotificationToggles } from "@/components/settings/NotificationToggles";
import { PasswordSection } from "@/components/settings/PasswordSection";
import { ProfileForm } from "@/components/settings/ProfileForm";
import type { Department } from "@/types";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "department", label: "Department", icon: Building2 },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function OfficerSettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [department, setDepartment] = useState<Department | null>(null);

  useEffect(() => {
    if (!user?.departmentId) return;
    departmentsApi.getAll().then((depts) => {
      setDepartment(depts.find((d) => d.id === user.departmentId) ?? null);
    }).catch(console.error);
  }, [user?.departmentId]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-[var(--text-muted)]">Manage officer profile, department context, and preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="elev-1 flex flex-col gap-1 rounded-lg border border-gray-200 dark:border-transparent bg-white p-2 h-fit">
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

          {activeSection === "department" && (
            <div className="space-y-4 rounded-lg elev-1 border border-gray-200 dark:border-transparent bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">Department Assignment</h2>
              <InfoBanner title={department?.name ?? "Unassigned Department"}>
                {department?.description ?? "Admin assignment is required before case routing begins."}
              </InfoBanner>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 dark:border-[var(--border-subtle)] p-4">
                  <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">Active Categories</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-[var(--text-primary)]">{department?.categoryCount ?? 0}</p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-[var(--border-subtle)] p-4">
                  <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">Department Officers</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-[var(--text-primary)]">{department?.officerCount ?? 0}</p>
                </div>
              </div>
              <DataCorrectionDialog
                target="profile"
                profileName={user.name}
                profileDepartmentName={department?.name ?? "Unassigned"}
              />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-[var(--text-secondary)]">My Correction Requests</h3>
                <MyCorrectionRequests />
              </div>
            </div>
          )}

          {activeSection === "security" && <PasswordSection />}

          {activeSection === "notifications" && (
            <NotificationToggles
              groups={[
                {
                  title: "Case Activity",
                  items: [
                    { id: "new-complaints", label: "New Complaints", description: "Get emailed when a citizen submits a new complaint in my department. In-app notifications always appear regardless of this setting." },
                    { id: "new-assignments", label: "New Assignments", description: "Get emailed when a complaint is assigned to my queue. In-app notifications always appear regardless of this setting." },
                    { id: "correction-updates", label: "Correction Request Updates", description: "Get emailed when an admin approves or rejects your data correction request. In-app notifications always appear regardless of this setting." },
                    { id: "new-comments", label: "New Comments", description: "Get emailed when a citizen comments on a complaint in your department. In-app notifications always appear regardless of this setting." },
                  ],
                },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
