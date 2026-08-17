"use client";

import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { PasswordSection } from "@/components/settings/PasswordSection";
import { NotificationToggles } from "@/components/settings/NotificationToggles";
import { DangerZoneCard } from "@/components/settings/DangerZoneCard";

export default function CitizenSettingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your profile, security and notification preferences." />

      <ProfileForm />

      <PasswordSection />

      <NotificationToggles
        title="Notifications"
        groups={[
          {
            title: "",
            items: [
              { id: "status-updates", label: "Complaint Status Updates", description: "Get emailed when a complaint's status changes. In-app notifications always appear regardless of this setting." },
              { id: "new-comments", label: "New Comments", description: "Get emailed when an officer comments on your complaint. In-app notifications always appear regardless of this setting." },
            ],
          },
        ]}
      />

      <DangerZoneCard />
    </div>
  );
}
