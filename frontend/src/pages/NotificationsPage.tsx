import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/api/services'
import { Bell, CheckCheck, Loader2, ExternalLink } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

const TYPE_STYLES: Record<string, { bg: string; dot: string }> = {
  TASK_ASSIGNED:  { bg: 'bg-blue-500/10', dot: 'bg-blue-500' },
  TASK_DUE_SOON:  { bg: 'bg-orange-500/10', dot: 'bg-orange-500' },
  PROJECT_UPDATE: { bg: 'bg-green-500/10', dot: 'bg-green-500' },
  COMMENT:        { bg: 'bg-purple-500/10', dot: 'bg-purple-500' },
  DEFAULT:        { bg: 'bg-muted', dot: 'bg-muted-foreground' },
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll(),
  })

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] })
    },
  })

  const markOneMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] })
    },
  })

  const unreadCount = data?.content.filter(n => !n.read).length ?? 0

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell size={22} /> Notifications
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-input rounded-lg hover:bg-accent transition-colors"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      )}

      {data?.content.length === 0 && !isLoading && (
        <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-xl">
          <Bell size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">No notifications</p>
          <p className="text-sm mt-1">You're all caught up!</p>
        </div>
      )}

      <div className="space-y-2">
        {data?.content.map(notification => {
          const style = TYPE_STYLES[notification.type] ?? TYPE_STYLES.DEFAULT
          return (
            <div
              key={notification.id}
              onClick={() => !notification.read && markOneMutation.mutate(notification.id)}
              className={cn(
                'flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer',
                notification.read
                  ? 'bg-card border-border opacity-70'
                  : 'bg-card border-border hover:border-primary/40 shadow-sm'
              )}
            >
              <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5', style.bg)}>
                <div className={cn('w-2.5 h-2.5 rounded-full', style.dot)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn('text-sm font-medium', notification.read ? 'text-muted-foreground' : 'text-foreground')}>
                    {notification.title}
                  </p>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground/60">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                  {notification.link && (
                    <Link
                      to={notification.link}
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      View <ExternalLink size={10} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
