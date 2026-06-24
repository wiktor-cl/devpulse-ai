import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi, tasksApi } from '@/api/services'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { ArrowLeft, Plus, Loader2, AlertCircle, GripVertical, Clock, User } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Task, TaskStatus, Priority } from '@/types'
import CreateTaskModal from '@/components/tasks/CreateTaskModal'

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'TODO',        label: 'To Do',      color: 'border-t-slate-400' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-t-blue-500' },
  { id: 'IN_REVIEW',   label: 'In Review',   color: 'border-t-purple-500' },
  { id: 'DONE',        label: 'Done',        color: 'border-t-green-500' },
]

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW:      'bg-green-500/10 text-green-500',
  MEDIUM:   'bg-yellow-500/10 text-yellow-500',
  HIGH:     'bg-orange-500/10 text-orange-500',
  CRITICAL: 'bg-red-500/10 text-red-500',
}

export default function KanbanPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getById(projectId!),
    enabled: !!projectId,
  })

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks', 'project', projectId],
    queryFn: () => tasksApi.getByProject(projectId!),
    enabled: !!projectId,
  })

  const moveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.move(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', 'project', projectId] }),
  })

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId as TaskStatus
    moveMutation.mutate({ id: draggableId, status: newStatus })
  }

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter(t => t.status === status).sort((a, b) => a.position - b.position)

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-primary" size={28} />
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-3 text-destructive bg-destructive/10 rounded-xl p-4">
      <AlertCircle size={20} /> Failed to load tasks.
    </div>
  )

  return (
    <div className="flex flex-col h-full animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to={`/projects/${projectId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {project?.name ?? 'Kanban Board'}
            </h1>
            <p className="text-xs text-muted-foreground">{tasks.length} tasks</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={14} /> Add Task
        </button>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {COLUMNS.map(col => {
            const colTasks = tasksByStatus(col.id)
            return (
              <div key={col.id} className="flex flex-col w-72 shrink-0">
                {/* Column header */}
                <div className={cn('bg-card border border-border border-t-2 rounded-xl mb-3', col.color)}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-semibold text-foreground">{col.label}</span>
                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Drop zone */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'flex-1 rounded-xl p-2 space-y-2 min-h-[120px] transition-colors',
                        snapshot.isDraggingOver ? 'bg-primary/5 border-2 border-dashed border-primary/30' : 'bg-muted/30'
                      )}
                    >
                      {colTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              className={cn(
                                'bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/50 transition-all',
                                snap.isDragging && 'shadow-xl rotate-1 border-primary'
                              )}
                            >
                              <div className="flex items-start gap-2">
                                <div {...prov.dragHandleProps} className="mt-0.5 text-muted-foreground/40 hover:text-muted-foreground">
                                  <GripVertical size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground leading-snug">{task.title}</p>

                                  {task.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                                  )}

                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', PRIORITY_COLORS[task.priority])}>
                                      {task.priority}
                                    </span>
                                    {task.tags.slice(0, 2).map(tag => (
                                      <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>

                                  <div className="flex items-center justify-between mt-2">
                                    {task.assignee ? (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                                          {task.assignee.fullName.charAt(0)}
                                        </div>
                                        <span className="truncate max-w-[80px]">{task.assignee.fullName.split(' ')[0]}</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground/50">
                                        <User size={10} /> Unassigned
                                      </div>
                                    )}
                                    {task.dueDate && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock size={10} />
                                        {new Date(task.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {colTasks.length === 0 && !snapshot.isDraggingOver && (
                        <p className="text-xs text-muted-foreground/50 text-center py-6 select-none">
                          Drop tasks here
                        </p>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {showCreate && projectId && (
        <CreateTaskModal projectId={projectId} onClose={() => setShowCreate(false)} />
      )}
    </div>
  )
}
