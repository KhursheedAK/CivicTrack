export enum DataCorrectionTargetType {
  COMPLAINT = 'COMPLAINT',
  PROFILE = 'PROFILE',
}

export enum DataCorrectionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Allow-lists so the API rejects a flagged field that doesn't belong to the
// request's target type (e.g. "category" on a PROFILE request).
export const COMPLAINT_CORRECTION_FIELDS = [
  'title',
  'description',
  'category',
  'department',
  'location',
] as const;

export const PROFILE_CORRECTION_FIELDS = ['name', 'own_department'] as const;

export type ComplaintCorrectionField = (typeof COMPLAINT_CORRECTION_FIELDS)[number];
export type ProfileCorrectionField = (typeof PROFILE_CORRECTION_FIELDS)[number];
