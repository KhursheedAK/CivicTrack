// Shared TypeScript types for CivicTrack frontend.
// Mirrors backend entities defined in CLAUDE.md / API_CONTRACTS.md.

export type Role = "CITIZEN" | "OFFICER" | "ADMIN";

export type ComplaintStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED";

export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING";

export type NotificationType =
  | "STATUS_CHANGED"
  | "NEW_COMPLAINT"
  | "REASSIGNED"
  | "COMMENT_ADDED"
  | "DATA_CORRECTION_REQUESTED"
  | "DATA_CORRECTION_RESOLVED";

export type DataCorrectionTargetType = "COMPLAINT" | "PROFILE";
export type DataCorrectionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface DataCorrectionRequest {
  id: string;
  requestedBy: { id: string; name: string; email: string };
  targetType: DataCorrectionTargetType;
  complaint: { id: string; trackingCode: string; title: string } | null;
  fieldsFlagged: string[];
  currentData: string;
  requestedCorrection: string;
  status: DataCorrectionStatus;
  adminNotes: string | null;
  resolvedByName: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  categoryCount: number;
  officerCount: number;
  openComplaintCount: number;
  categoryType: "OPERATIONAL" | "TECHNICAL" | "COMMUNITY";
}

export interface Category {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status: UserStatus;
  departmentId?: string;
  departmentName?: string;
  avatarUrl?: string;
  address?: string;
  joinedAt: string;
  isBlocked?: boolean;
}

export interface ComplaintAttachment {
  id: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
}

export interface ComplaintUpdate {
  id: string;
  complaintId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  comment: string;
  statusChangedTo: ComplaintStatus | null;
  createdAt: string;
}

export interface Complaint {
  id: string;
  trackingCode: string;
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  status: ComplaintStatus;
  citizenId: string;
  citizenName: string;
  departmentId: string;
  departmentName: string;
  categoryId: string;
  categoryName: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  reassignmentRequested?: boolean;
  reassignmentReason?: string | null;
  reassignmentRejected?: boolean;
  attachments: ComplaintAttachment[];
  updates: ComplaintUpdate[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStat {
  label: string;
  value: string | number;
  subNote?: string;
}
