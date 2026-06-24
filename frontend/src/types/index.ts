// Auth
export interface User {
  id: string
  email: string
  username: string
  fullName: string
  avatarUrl?: string
  role: 'USER' | 'ADMIN'
  active: boolean
  lastLogin?: string
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

// Projects
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Project {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  priority: Priority
  owner: User
  deadline?: string
  progress: number
  color: string
  repositoryUrl?: string
  taskCount: number
  completedTaskCount: number
  memberCount: number
  createdAt: string
  updatedAt: string
}

export interface ProjectRequest {
  name: string
  description?: string
  status?: ProjectStatus
  priority?: Priority
  deadline?: string
  progress?: number
  color?: string
  repositoryUrl?: string
}

// Tasks
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  projectId: string
  projectName: string
  assignee?: User
  reporter: User
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  position: number
  archived: boolean
  tags: string[]
  commentCount: number
  createdAt: string
  updatedAt: string
}

export interface TaskRequest {
  title: string
  description?: string
  status?: TaskStatus
  priority?: Priority
  projectId: string
  assigneeId?: string
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
  position?: number
}

// Dashboard
export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalTasks: number
  activeTasks: number
  completedTasks: number
  unreadNotifications: number
  productivityScore: number
  activityData: ActivityDataPoint[]
  recentTasks: Task[]
  recentProjects: Project[]
}

export interface ActivityDataPoint {
  date: string
  tasksCompleted: number
  tasksCreated: number
}

// Notifications
export interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  link?: string
  createdAt: string
}

// AI
export interface AiReport {
  id: string
  reportType: 'WEEKLY' | 'MONTHLY' | 'PROJECT' | 'CUSTOM'
  title: string
  content: string
  summary?: string
  generatedAt: string
  periodStart?: string
  periodEnd?: string
}

// Pagination
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}
