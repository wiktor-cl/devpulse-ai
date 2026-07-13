import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '@/api/services'
import { Link } from 'react-router-dom'
import {
  Plus, Search, FolderKanban, Calendar, Users, Loader2,
  MoreHorizontal, Pencil, Trash2, KanbanSquare
} from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Project, ProjectStatus, Priority } from '@/types'
import { format } from 'date-fns'
import CreateProjectModal from '@/components/projects/CreateProjectModal'

const STATUS_STYLES: Record<ProjectStatus, string> = {
  PLANNING:  'bg-yellow-500/10 text-yellow-500',
  ACTIVE:    'bg-green-500/10 text-green-500',
  ON_HOLD:   'bg-orange-500/10 text-orange-500',
  COMPLETED: 'bg-blue-500/10 text-blue-500',
  CANCELLED: 'bg-red-500/10 text-red-500',
}

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW:      'text-green-500',
  MEDIUM:   'text-yellow-500',
  HIGH:     'text-orange-500',
  CRITICAL: 'text-red-500',
}

export default function ProjectsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('')
  const [showCreate, setShowCreate] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['projects', { search, status }],
    queryFn: () => projectsApi.getAll({ search: search || undefined, status: status || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and monitor all your software projects
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring w-64"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All statuses</option>
          {['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        {data && (
          <span className="text-sm text-muted-foreground ml-auto">
            {data.totalElements} project{data.totalElements !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data?.content.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              menuOpen={menuOpen === project.id}
              onMenuToggle={() => setMenuOpen(menuOpen === project.id ? null : project.id)}
              onDelete={() => {
                if (confirm('Delete this project?')) deleteMutation.mutate(project.id)
                setMenuOpen(null)
              }}
            />
          ))}

          {data?.content.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FolderKanban size={48} className="mb-4 opacity-30" />
              <p className="font-medium">No projects found</p>
              <p className="text-sm mt-1">Create your first project to get started</p>
            </div>
          )}
        </div>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}

function ProjectCard({ project, menuOpen, onMenuToggle, onDelete }: {
  project: Project
  menuOpen: boolean
  onMenuToggle: () => void
  onDelete: () => void
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all group">
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_STYLES[project.status])}>
            {project.status.replace('_', ' ')}
          </span>
        </div>
        <div className="relative">
          <button
            onClick={onMenuToggle}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-lg shadow-lg py-1 z-10">
              <Link
                to={`/projects/${project.id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Pencil size={13} /> Edit
              </Link>
              <Link
                to={`/projects/${project.id}/kanban`}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <KanbanSquare size={13} /> Kanban Board
              </Link>
              <button
                onClick={onDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Name & description */}
      <Link to={`/projects/${project.id}`}>
        <h3 className="font-semibold text-foreground hover:text-primary transition-colors mb-1 truncate">
          {project.name}
        </h3>
      </Link>
      <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem]">
        {project.description ?? 'No description provided.'}
      </p>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span className="font-medium text-foreground">{project.progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${project.progress}%`, backgroundColor: project.color }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <KanbanSquare size={12} />
            {project.completedTaskCount}/{project.taskCount} tasks
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />
            {project.memberCount}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('font-medium', PRIORITY_STYLES[project.priority])}>
            {project.priority}
          </span>
          {project.deadline && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {format(new Date(project.deadline), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
