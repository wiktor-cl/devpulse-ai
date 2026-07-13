import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi, tasksApi } from '@/api/services'
import {
  ArrowLeft, KanbanSquare, GitBranch, Calendar, Users,
  Plus, Loader2, AlertCircle, Trash2, CheckCircle2
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { format } from 'date-fns'
import type { Priority, TaskStatus } from '@/types'
import CreateTaskModal from '@/components/tasks/CreateTaskModal'

const STATUS_STYLES: Record<TaskStatus, string> = {
  TODO:        'bg-muted text-muted-foreground',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-500',
  IN_REVIEW:   'bg-purple-500/10 text-purple-500',
  DONE:        'bg-green-500/10 text-green-500',
  CANCELLED:   'bg-red-500/10 text-red-500',
}

const PRIORITY_DOT: Record<Priority, string> = {
  LOW: 'bg-green-500', MEDIUM: 'bg-yellow-500', HIGH: 'bg-orange-500', CRITICAL: 'bg-red-500',
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [activeTab, setActiveTab] = useState<'tasks' | 'overview'>('overview')

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id!),
    enabled: !!id,
  })

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', 'project', id],
    queryFn: () => tasksApi.getByProject(id!),
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: () => projectsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate('/projects')
    },
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-primary" size={28} />
    </div>
  )

  if (error || !project) return (
    <div className="flex items-center gap-3 text-destructive bg-destructive/10 rounded-xl p-4">
      <AlertCircle size={20} /> Project not found.
    </div>
  )

  const tasks = tasksData ?? []
  const done = tasks.filter(t => t.status === 'DONE').length
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const todo = tasks.filter(t => t.status === 'TODO').length

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link to="/projects" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back to Projects
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${id}/kanban`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input text-sm hover:bg-accent transition-colors"
          >
            <KanbanSquare size={14} /> Kanban Board
          </Link>
          <button
            onClick={() => setShowCreateTask(true)}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={14} /> Add Task
          </button>
          <button
            onClick={() => confirm('Delete project?') && deleteMutation.mutate()}
            className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: project.color + '20', border: `2px solid ${project.color}` }}>
            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: project.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-foreground truncate">{project.name}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {project.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{project.description ?? 'No description.'}</p>

            {project.repositoryUrl && (
              <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-2">
                <GitBranch size={12} /> {project.repositoryUrl}
              </a>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Overall Progress</span>
            <span className="font-semibold text-foreground">{project.progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%`, backgroundColor: project.color }} />
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-6 mt-5 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} /> {done}/{tasks.length} tasks
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={14} /> {project.memberCount} members
          </span>
          {project.deadline && (
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> Due {format(new Date(project.deadline), 'MMM d, yyyy')}
            </span>
          )}
          <span className="ml-auto text-xs">
            Owner: <span className="text-foreground font-medium">{project.owner.fullName}</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {(['overview', 'tasks'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize',
              activeTab === tab
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'To Do', value: todo, color: 'bg-muted text-muted-foreground' },
            { label: 'In Progress', value: inProgress, color: 'bg-blue-500/10 text-blue-500' },
            { label: 'Done', value: done, color: 'bg-green-500/10 text-green-500' },
            { label: 'Total', value: tasks.length, color: 'bg-primary/10 text-primary' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-5 text-center">
              <p className={cn('text-3xl font-bold mb-1', color.split(' ')[1])}>{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-2">
          {tasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <KanbanSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No tasks yet</p>
              <p className="text-sm mt-1">Add a task to get started</p>
            </div>
          )}
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-all">
              <div className={cn('w-2 h-2 rounded-full shrink-0', PRIORITY_DOT[task.priority])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                {task.assignee && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Assigned to {task.assignee.fullName}
                  </p>
                )}
              </div>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_STYLES[task.status])}>
                {task.status.replace('_', ' ')}
              </span>
              {task.dueDate && (
                <span className="text-xs text-muted-foreground hidden md:block">
                  {format(new Date(task.dueDate), 'MMM d')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateTask && id && (
        <CreateTaskModal projectId={id} onClose={() => setShowCreateTask(false)} />
      )}
    </div>
  )
}
