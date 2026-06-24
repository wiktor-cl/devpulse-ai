import api from './client'
import type {
  AuthResponse, DashboardStats, Page, Project, ProjectRequest,
  Task, TaskRequest, Notification, AiReport
} from '@/types'

// Auth
export const authApi = {
  register: (data: { email: string; username: string; password: string; fullName: string }) =>
    api.post<AuthResponse>('/auth/register', data).then(r => r.data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then(r => r.data),
  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }).then(r => r.data),
  logout: () => api.post('/auth/logout'),
}

// Dashboard
export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats').then(r => r.data),
}

// Projects
export const projectsApi = {
  getAll: (params?: { status?: string; priority?: string; search?: string; page?: number; size?: number }) =>
    api.get<Page<Project>>('/projects', { params }).then(r => r.data),
  getById: (id: string) => api.get<Project>(`/projects/${id}`).then(r => r.data),
  create: (data: ProjectRequest) => api.post<Project>('/projects', data).then(r => r.data),
  update: (id: string, data: Partial<ProjectRequest>) =>
    api.put<Project>(`/projects/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addMember: (projectId: string, userId: string) =>
    api.post(`/projects/${projectId}/members/${userId}`),
  removeMember: (projectId: string, userId: string) =>
    api.delete(`/projects/${projectId}/members/${userId}`),
}

// Tasks
export const tasksApi = {
  getByProject: (projectId: string) =>
    api.get<Task[]>(`/tasks/project/${projectId}`).then(r => r.data),
  getByProjectPaged: (projectId: string, params?: { status?: string; priority?: string; search?: string; page?: number }) =>
    api.get<Page<Task>>(`/tasks/project/${projectId}/paged`, { params }).then(r => r.data),
  getById: (id: string) => api.get<Task>(`/tasks/${id}`).then(r => r.data),
  create: (data: TaskRequest) => api.post<Task>('/tasks', data).then(r => r.data),
  update: (id: string, data: Partial<TaskRequest>) =>
    api.put<Task>(`/tasks/${id}`, data).then(r => r.data),
  move: (id: string, status?: string, position?: number) =>
    api.patch<Task>(`/tasks/${id}/move`, { status, position }).then(r => r.data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
}

// Notifications
export const notificationsApi = {
  getAll: (page = 0, size = 20) =>
    api.get<Page<Notification>>('/notifications', { params: { page, size } }).then(r => r.data),
  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count').then(r => r.data),
  markAsRead: (id: string) =>
    api.patch<Notification>(`/notifications/${id}/read`).then(r => r.data),
  markAllAsRead: () => api.patch('/notifications/read-all'),
}

// AI
export const aiApi = {
  getReports: (page = 0) =>
    api.get<Page<AiReport>>('/ai/reports', { params: { page } }).then(r => r.data),
  generateWeeklyReport: () => api.post<AiReport>('/ai/reports/weekly').then(r => r.data),
  generateProjectReport: (projectId: string) =>
    api.post<AiReport>(`/ai/reports/project/${projectId}`).then(r => r.data),
  chat: (message: string) =>
    api.post<{ response: string; timestamp: string }>('/ai/chat', { message }).then(r => r.data),
}

// Admin
export const adminApi = {
  getStats: () => api.get<Record<string, number>>('/admin/stats').then(r => r.data),
  getUsers: (params?: { search?: string; page?: number; size?: number }) =>
    api.get('/admin/users', { params }).then(r => r.data),
  toggleUserActive: (id: string) => api.patch(`/admin/users/${id}/toggle-active`).then(r => r.data),
  changeRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }).then(r => r.data),
  getActivityLogs: (page = 0) =>
    api.get('/admin/activity-logs', { params: { page } }).then(r => r.data),
}
