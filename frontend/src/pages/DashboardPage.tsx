import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/services'
import { useAuthStore } from '@/store/authStore'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import {
  FolderKanban, CheckCircle2, ListTodo, TrendingUp, Loader2, AlertCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'text-red-500 bg-red-500/10',
  HIGH: 'text-orange-500 bg-orange-500/10',
  MEDIUM: 'text-yellow-500 bg-yellow-500/10',
  LOW: 'text-green-500 bg-green-500/10',
}

const STATUS_COLORS: Record<string, string> = {
  TODO: 'bg-muted text-muted-foreground',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-500',
  IN_REVIEW: 'bg-purple-500/10 text-purple-500',
  DONE: 'bg-green-500/10 text-green-500',
  CANCELLED: 'bg-red-500/10 text-red-500',
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType, label: string, value: number | string, sub?: string, color: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={cn('p-2 rounded-lg', color)}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getStats,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-3 text-destructive bg-destructive/10 rounded-xl p-4">
        <AlertCircle size={20} /> Failed to load dashboard data.
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Good {getGreeting()}, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FolderKanban}
          label="Active Projects"
          value={data.activeProjects}
          sub={`${data.totalProjects} total`}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={ListTodo}
          label="Active Tasks"
          value={data.activeTasks}
          sub={`${data.totalTasks} total`}
          color="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={data.completedTasks}
          sub="tasks this period"
          color="bg-green-500/10 text-green-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Productivity"
          value={`${data.productivityScore}%`}
          sub="completion rate"
          color="bg-orange-500/10 text-orange-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Activity — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.activityData}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="tasksCompleted"
                name="Completed"
                stroke="hsl(var(--primary))"
                fill="url(#colorCompleted)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="tasksCreated"
                name="Created"
                stroke="hsl(220, 90%, 60%)"
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="4 2"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Tasks Created vs Completed</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="tasksCreated" name="Created" fill="hsl(220, 90%, 60%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tasksCompleted" name="Completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Tasks & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Tasks */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">My Tasks</h3>
            <Link to="/projects" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {data.recentTasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No tasks assigned yet.</p>
            )}
            {data.recentTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{task.projectName}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', PRIORITY_COLORS[task.priority])}>
                    {task.priority}
                  </span>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[task.status])}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Projects</h3>
            <Link to="/projects" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {data.recentProjects.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No projects yet.</p>
            )}
            {data.recentProjects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{project.progress}%</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {project.taskCount} tasks
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
