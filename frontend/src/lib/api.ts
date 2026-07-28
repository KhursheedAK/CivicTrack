import axios from 'axios';
import type { AppNotification, Category, Complaint, ComplaintAttachment, ComplaintUpdate, DataCorrectionRequest, DataCorrectionStatus, DataCorrectionTargetType, Department, Role, User } from '@/types';

// ─── Axios instance ────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
});

// ─── Refresh-token interceptor ─────────────────────────────────────────────────

let isRefreshing = false;
type Pending = { resolve: () => void; reject: (e: unknown) => void };
let pendingQueue: Pending[] = [];

function drainQueue(error?: unknown) {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  pendingQueue = [];
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const orig = error.config;
    if (error.response?.status !== 401 || orig?._retry) return Promise.reject(error);

    // /auth/me is the session probe — a 401 means "not logged in", not "token expired".
    // /auth/refresh failing should also not recurse.
    if (orig?.url?.includes('/auth/me') || orig?.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => pendingQueue.push({ resolve, reject }))
        .then(() => api(orig))
        .catch(() => Promise.reject(error));
    }

    orig._retry = true;
    isRefreshing = true;
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/refresh`,
        {},
        { withCredentials: true },
      );
      drainQueue();
      return api(orig);
    } catch (refreshErr) {
      drainQueue(refreshErr);
      const publicPaths = ['/', '/track', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
      if (typeof window !== 'undefined' && !publicPaths.some((p) => window.location.pathname === p || window.location.pathname.startsWith(p + '/'))) {
        window.location.href = '/login';
      }
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);

// ─── Backend DTO types (snake_case) ───────────────────────────────────────────

interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department_id: string | null;
  is_verified: boolean;
  created_at: string;
}

interface ApiDepartment {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  category_count: number;
  officer_count: number;
  open_complaint_count: number;
  created_at: string;
}

interface ApiCategory {
  id: string;
  name: string;
  department_id: string;
  department_name: string;
  is_active: boolean;
}

interface ApiComplaintSummary {
  id: string;
  tracking_code: string;
  title: string;
  status: Complaint['status'];
  category_name: string;
  department_name: string;
  citizen_name: string;
  assigned_officer_name: string | null;
  created_at: string;
  updated_at: string;
  attachment_count: number;
}

interface ApiComplaintDetail {
  id: string;
  tracking_code: string;
  title: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  status: Complaint['status'];
  citizen: { id: string; name: string; email: string };
  department: { id: string; name: string };
  category: { id: string; name: string };
  assigned_officer: { id: string; name: string } | null;
  attachments: Array<{ id: string; file_url: string; file_name: string; mime_type: string }>;
  updates: Array<{
    id: string;
    comment: string;
    status_changed_to: Complaint['status'] | null;
    author: { id: string; name: string; role: Role };
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  reassignment_requested: boolean;
  reassignment_reason: string | null;
  reassignment_rejected: boolean;
}

interface ApiNotification {
  id: string;
  user_id: string;
  message: string;
  type: AppNotification['type'];
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

interface ApiUserListItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  department_id: string | null;
  department_name: string | null;
  is_verified: boolean;
  is_blocked: boolean;
  created_at: string;
}

interface ApiPaginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

interface ApiPublicComplaint {
  tracking_code: string;
  title: string;
  description: string;
  status: Complaint['status'];
  department_name: string;
  category_name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  citizen_name: string;
  assigned_officer_name: string | null;
  updates: Array<{
    comment: string;
    status_changed_to: Complaint['status'] | null;
    created_at: string;
  }>;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapUser(u: ApiUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.is_verified ? 'ACTIVE' : 'PENDING',
    departmentId: u.department_id ?? undefined,
    joinedAt: u.created_at,
  };
}

function mapDepartment(d: ApiDepartment): Department {
  return {
    id: d.id,
    name: d.name,
    description: d.description ?? '',
    isActive: d.is_active,
    categoryCount: d.category_count ?? 0,
    officerCount: d.officer_count ?? 0,
    openComplaintCount: d.open_complaint_count ?? 0,
    categoryType: 'OPERATIONAL',
  };
}

function mapCategory(c: ApiCategory): Category {
  return { id: c.id, name: c.name, departmentId: c.department_id, departmentName: c.department_name, isActive: c.is_active };
}

function mapComplaintSummary(c: ApiComplaintSummary): Complaint {
  return {
    id: c.id,
    trackingCode: c.tracking_code,
    title: c.title,
    description: '',
    location: '',
    status: c.status,
    citizenId: '',
    citizenName: c.citizen_name,
    departmentId: '',
    departmentName: c.department_name,
    categoryId: '',
    categoryName: c.category_name,
    assignedOfficerName: c.assigned_officer_name ?? undefined,
    attachments: [],
    updates: [],
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

function mapComplaintDetail(c: ApiComplaintDetail): Complaint {
  return {
    id: c.id,
    trackingCode: c.tracking_code,
    title: c.title,
    description: c.description,
    location: c.location,
    latitude: c.latitude ?? undefined,
    longitude: c.longitude ?? undefined,
    status: c.status,
    citizenId: c.citizen.id,
    citizenName: c.citizen.name,
    departmentId: c.department.id,
    departmentName: c.department.name,
    categoryId: c.category.id,
    categoryName: c.category.name,
    assignedOfficerId: c.assigned_officer?.id,
    assignedOfficerName: c.assigned_officer?.name,
    attachments: c.attachments.map(
      (a): ComplaintAttachment => ({
        id: a.id,
        fileUrl: a.file_url,
        fileName: a.file_name,
        mimeType: a.mime_type,
      }),
    ),
    updates: c.updates.map(
      (u): ComplaintUpdate => ({
        id: u.id,
        complaintId: c.id,
        authorId: u.author.id,
        authorName: u.author.name,
        authorRole: u.author.role,
        comment: u.comment,
        statusChangedTo: u.status_changed_to,
        createdAt: u.created_at,
      }),
    ),
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    resolvedAt: c.resolved_at ?? undefined,
    reassignmentRequested: c.reassignment_requested ?? false,
    reassignmentReason: c.reassignment_reason ?? null,
    reassignmentRejected: c.reassignment_rejected ?? false,
  };
}

function mapPublicComplaint(c: ApiPublicComplaint): Complaint {
  return {
    id: '',
    trackingCode: c.tracking_code,
    title: c.title,
    description: c.description,
    location: c.location ?? '',
    latitude: c.latitude ?? undefined,
    longitude: c.longitude ?? undefined,
    status: c.status,
    citizenId: '',
    citizenName: c.citizen_name,
    departmentId: '',
    departmentName: c.department_name,
    categoryId: '',
    categoryName: c.category_name,
    assignedOfficerName: c.assigned_officer_name ?? undefined,
    attachments: [],
    updates: c.updates.map((u, i): ComplaintUpdate => ({
      id: String(i),
      complaintId: '',
      authorId: '',
      authorName: 'Staff',
      authorRole: 'OFFICER',
      comment: u.comment,
      statusChangedTo: u.status_changed_to,
      createdAt: u.created_at,
    })),
    createdAt: c.created_at,
    updatedAt: c.created_at,
  };
}

function mapNotification(n: ApiNotification): AppNotification {
  return {
    id: n.id,
    userId: n.user_id,
    message: n.message,
    type: n.type,
    referenceId: n.reference_id ?? undefined,
    isRead: n.is_read,
    createdAt: n.created_at,
  };
}

function mapUserListItem(u: ApiUserListItem): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.is_verified ? 'ACTIVE' : 'PENDING',
    departmentId: u.department_id ?? undefined,
    departmentName: u.department_name ?? undefined,
    isBlocked: u.is_blocked,
    joinedAt: u.created_at,
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (email: string, password: string, remember?: boolean): Promise<User> => {
    const res = await api.post<{ data: { user: ApiUser } }>('/auth/login', { email, password, remember });
    return mapUser(res.data.data.user);
  },

  register: async (name: string, email: string, password: string): Promise<void> => {
    await api.post('/auth/register', { name, email, password });
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  me: async (): Promise<User> => {
    const res = await api.get<{ data: ApiUser }>('/auth/me');
    return mapUser(res.data.data);
  },

  updateProfile: async (name: string): Promise<User> => {
    const res = await api.patch<{ data: ApiUser }>('/auth/profile', { name });
    return mapUser(res.data.data);
  },

  changePassword: async (current_password: string, new_password: string): Promise<void> => {
    await api.patch('/auth/change-password', { current_password, new_password });
  },

  getNotificationPreferences: async (): Promise<Record<string, boolean>> => {
    const res = await api.get<{ data: { preferences: Record<string, boolean> } }>('/auth/notification-preferences');
    return res.data.data.preferences;
  },

  updateNotificationPreferences: async (preferences: Record<string, boolean>): Promise<Record<string, boolean>> => {
    const res = await api.patch<{ data: { preferences: Record<string, boolean> } }>('/auth/notification-preferences', { preferences });
    return res.data.data.preferences;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, password });
  },
};

// ─── Complaints ───────────────────────────────────────────────────────────────

export const complaintsApi = {
  getMy: async (params?: { page?: number; limit?: number; status?: string }) => {
    const res = await api.get<{ data: ApiPaginated<ApiComplaintSummary> }>('/complaints/my', { params });
    const d = res.data.data;
    return { ...d, items: d.items.map(mapComplaintSummary) };
  },

  getAll: async (params?: { page?: number; limit?: number; status?: string; department_id?: string; citizen_id?: string }) => {
    const res = await api.get<{ data: ApiPaginated<ApiComplaintSummary> }>('/complaints', { params });
    const d = res.data.data;
    return { ...d, items: d.items.map(mapComplaintSummary) };
  },

  getById: async (id: string): Promise<Complaint> => {
    const res = await api.get<{ data: ApiComplaintDetail }>(`/complaints/${id}`);
    return mapComplaintDetail(res.data.data);
  },

  track: async (code: string): Promise<Complaint> => {
    const res = await api.get<{ data: ApiPublicComplaint }>(`/complaints/track/${code}`);
    return mapPublicComplaint(res.data.data);
  },

  create: async (data: {
    title: string;
    description: string;
    location: string;
    department_id: string;
    category_id: string;
    latitude?: number;
    longitude?: number;
    attachments?: Array<{ file_url: string; file_name: string; mime_type: string; cloudinary_public_id: string }>;
  }): Promise<{ id: string; tracking_code: string }> => {
    const res = await api.post<{ data: { id: string; tracking_code: string } }>('/complaints', data);
    return res.data.data;
  },

  updateStatus: async (id: string, status: string, comment?: string): Promise<void> => {
    await api.patch(`/complaints/${id}/status`, { status, comment });
  },

  addComment: async (id: string, comment: string): Promise<Complaint> => {
    const res = await api.post<{ data: ApiComplaintDetail }>(`/complaints/${id}/comments`, { comment });
    return mapComplaintDetail(res.data.data);
  },

  assignOfficer: async (id: string, officerId: string | null): Promise<void> => {
    await api.patch(`/complaints/${id}/assign`, { officer_id: officerId });
  },

  requestReassignment: async (id: string, reason: string): Promise<Complaint> => {
    const res = await api.post<{ data: ApiComplaintDetail }>(`/complaints/${id}/request-reassignment`, { reason });
    return mapComplaintDetail(res.data.data);
  },

  rejectReassignment: async (id: string): Promise<Complaint> => {
    const res = await api.patch<{ data: ApiComplaintDetail }>(`/complaints/${id}/reject-reassignment`);
    return mapComplaintDetail(res.data.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/complaints/${id}`);
  },
};

// ─── Departments ──────────────────────────────────────────────────────────────

export const departmentsApi = {
  getAll: async (): Promise<Department[]> => {
    const res = await api.get<{ data: ApiDepartment[] }>('/departments');
    return res.data.data.map(mapDepartment);
  },

  getAllForAdmin: async (): Promise<Department[]> => {
    const res = await api.get<{ data: ApiDepartment[] }>('/departments/all');
    return res.data.data.map(mapDepartment);
  },

  create: async (data: { name: string; description?: string }): Promise<Department> => {
    const res = await api.post<{ data: ApiDepartment }>('/departments', data);
    return mapDepartment(res.data.data);
  },

  update: async (id: string, data: { name?: string; description?: string; is_active?: boolean }): Promise<Department> => {
    const res = await api.patch<{ data: ApiDepartment }>(`/departments/${id}`, data);
    return mapDepartment(res.data.data);
  },

  deactivate: async (id: string): Promise<void> => {
    await api.delete(`/departments/${id}`);
  },

  reactivate: async (id: string): Promise<Department> => {
    const res = await api.patch<{ data: ApiDepartment }>(`/departments/${id}/reactivate`, {});
    return mapDepartment(res.data.data);
  },
};

// ─── Categories ───────────────────────────────────────────────────────────────

export const categoriesApi = {
  getAll: async (departmentId?: string): Promise<Category[]> => {
    const res = await api.get<{ data: ApiCategory[] }>('/categories', {
      params: departmentId ? { department_id: departmentId } : undefined,
    });
    return res.data.data.map(mapCategory);
  },

  create: async (data: { name: string; department_id: string }): Promise<Category> => {
    const res = await api.post<{ data: ApiCategory }>('/categories', data);
    return mapCategory(res.data.data);
  },

  update: async (id: string, data: { name?: string; is_active?: boolean }): Promise<Category> => {
    const res = await api.patch<{ data: ApiCategory }>(`/categories/${id}`, data);
    return mapCategory(res.data.data);
  },
};

// ─── Users (admin) ────────────────────────────────────────────────────────────

export const usersApi = {
  getAll: async (params?: { page?: number; limit?: number; role?: string; department_id?: string; search?: string }) => {
    const res = await api.get<{ data: ApiPaginated<ApiUserListItem> }>('/users', { params });
    const d = res.data.data;
    return { ...d, items: d.items.map(mapUserListItem) };
  },

  getOfficersByDepartment: async (departmentId: string): Promise<User[]> => {
    const res = await api.get<{ data: Array<{ id: string; name: string }> }>(`/departments/${departmentId}/officers`);
    return res.data.data.map((o) => ({ id: o.id, name: o.name, email: '', role: 'OFFICER' as const, status: 'ACTIVE' as const, joinedAt: '' }));
  },

  getById: async (id: string): Promise<User> => {
    const res = await api.get<{ data: ApiUserListItem }>(`/users/${id}`);
    return mapUserListItem(res.data.data);
  },

  createOfficer: async (data: { name: string; email: string; password: string; department_id: string }): Promise<void> => {
    await api.post('/users/officers', data);
  },

  update: async (id: string, data: { name?: string; department_id?: string | null; is_blocked?: boolean }): Promise<void> => {
    await api.patch(`/users/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

// ─── Notifications ────────────────────────────────────────────────────────────

interface ApiNotificationsData {
  items: ApiNotification[];
  total: number;
  unread_count: number;
}

export const notificationsApi = {
  getAll: async (params?: { unread?: boolean; page?: number; limit?: number }) => {
    const res = await api.get<{ data: ApiNotificationsData }>('/notifications', { params });
    const d = res.data.data;
    return { ...d, items: d.items.map(mapNotification) };
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },
};

// ─── Data Correction Requests ──────────────────────────────────────────────────

interface ApiDataCorrectionRequest {
  id: string;
  requested_by: { id: string; name: string; email: string };
  target_type: DataCorrectionTargetType;
  complaint: { id: string; tracking_code: string; title: string } | null;
  fields_flagged: string[];
  current_data: string;
  requested_correction: string;
  status: DataCorrectionStatus;
  admin_notes: string | null;
  resolved_by_name: string | null;
  resolved_at: string | null;
  created_at: string;
}

interface ApiDataCorrectionRequestList {
  items: ApiDataCorrectionRequest[];
  total: number;
}

function mapDataCorrectionRequest(r: ApiDataCorrectionRequest): DataCorrectionRequest {
  return {
    id: r.id,
    requestedBy: r.requested_by,
    targetType: r.target_type,
    complaint: r.complaint
      ? { id: r.complaint.id, trackingCode: r.complaint.tracking_code, title: r.complaint.title }
      : null,
    fieldsFlagged: r.fields_flagged,
    currentData: r.current_data,
    requestedCorrection: r.requested_correction,
    status: r.status,
    adminNotes: r.admin_notes,
    resolvedByName: r.resolved_by_name,
    resolvedAt: r.resolved_at,
    createdAt: r.created_at,
  };
}

export interface CreateDataCorrectionPayload {
  target_type: DataCorrectionTargetType;
  complaint_id?: string;
  fields_flagged: string[];
  current_data: string;
  requested_correction: string;
}

export interface ApproveDataCorrectionPayload {
  title?: string;
  description?: string;
  category_id?: string;
  department_id?: string;
  location?: string;
  name?: string;
  own_department_id?: string | null;
  admin_notes?: string;
}

export const dataCorrectionsApi = {
  create: async (payload: CreateDataCorrectionPayload): Promise<DataCorrectionRequest> => {
    const res = await api.post<{ data: ApiDataCorrectionRequest }>('/data-corrections', payload);
    return mapDataCorrectionRequest(res.data.data);
  },

  getAll: async (status?: DataCorrectionStatus): Promise<{ items: DataCorrectionRequest[]; total: number }> => {
    const res = await api.get<{ data: ApiDataCorrectionRequestList }>('/data-corrections', {
      params: status ? { status } : undefined,
    });
    return { items: res.data.data.items.map(mapDataCorrectionRequest), total: res.data.data.total };
  },

  getMine: async (): Promise<{ items: DataCorrectionRequest[]; total: number }> => {
    const res = await api.get<{ data: ApiDataCorrectionRequestList }>('/data-corrections/my');
    return { items: res.data.data.items.map(mapDataCorrectionRequest), total: res.data.data.total };
  },

  approve: async (id: string, payload: ApproveDataCorrectionPayload): Promise<DataCorrectionRequest> => {
    const res = await api.patch<{ data: ApiDataCorrectionRequest }>(`/data-corrections/${id}/approve`, payload);
    return mapDataCorrectionRequest(res.data.data);
  },

  reject: async (id: string, adminNotes: string): Promise<DataCorrectionRequest> => {
    const res = await api.patch<{ data: ApiDataCorrectionRequest }>(`/data-corrections/${id}/reject`, {
      admin_notes: adminNotes,
    });
    return mapDataCorrectionRequest(res.data.data);
  },
};

// ─── Upload ───────────────────────────────────────────────────────────────────

export const uploadApi = {
  upload: async (file: File): Promise<{ file_url: string; file_name: string; mime_type: string; cloudinary_public_id: string }> => {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post<{ data: { file_url: string; file_name: string; mime_type: string; cloudinary_public_id: string } }>(
      '/upload/complaint-attachment',
      form,
    );
    return res.data.data;
  },
};

// ─── Analytics (admin) ────────────────────────────────────────────────────────

export interface AnalyticsStats {
  total: number;
  open: number;
  resolved: number;
  closed: number;
  rejected: number;
  avg_resolution_days: number;
}

export interface AnalyticsGrouped {
  name: string;
  count: number;
}

export const analyticsApi = {
  getStats: async (): Promise<AnalyticsStats> => {
    const res = await api.get<{ data: AnalyticsStats }>('/admin/analytics/stats');
    return res.data.data;
  },

  getByCategory: async (): Promise<AnalyticsGrouped[]> => {
    const res = await api.get<{ data: Array<{ category_name: string; count: number }> }>('/admin/analytics/by-category');
    return res.data.data.map((d) => ({ name: d.category_name, count: d.count }));
  },

  getByStatus: async (): Promise<AnalyticsGrouped[]> => {
    const res = await api.get<{ data: Array<{ status: string; count: number }> }>('/admin/analytics/by-status');
    return res.data.data.map((d) => ({ name: d.status, count: d.count }));
  },

  getByDepartment: async (): Promise<AnalyticsGrouped[]> => {
    const res = await api.get<{ data: Array<{ department_name: string; count: number }> }>('/admin/analytics/by-department');
    return res.data.data.map((d) => ({ name: d.department_name, count: d.count }));
  },

  getRecent: async (): Promise<Complaint[]> => {
    const res = await api.get<{ data: ApiComplaintSummary[] }>('/admin/analytics/recent');
    return res.data.data.map(mapComplaintSummary);
  },
};

export default api;
