// Notification toggle ids that map to a real backend event. Kept as an
// allow-list so PATCH /auth/notification-preferences can reject unknown keys
// instead of writing arbitrary data into the jsonb column. Only keys with an
// actual gated trigger belong here — see complaints.service.ts.
export const NOTIFICATION_PREFERENCE_KEYS = [
  'status-updates', // citizen: complaint status change email
  'new-assignments', // officer: complaint assignment email
  'new-complaints', // officer: new complaint submitted in their department
  'correction-updates', // officer: their data correction request was approved/rejected
  'new-comments', // citizen/officer: someone commented on a complaint they're part of
] as const;

export type NotificationPreferenceKey = (typeof NOTIFICATION_PREFERENCE_KEYS)[number];

// Preferences are opt-out: an absent key (or a preferences object that was
// never saved) means the notification is enabled. Only an explicit `false`
// disables it.
export function isNotificationPreferenceEnabled(
  preferences: Record<string, boolean> | null | undefined,
  key: NotificationPreferenceKey,
): boolean {
  return preferences?.[key] !== false;
}
