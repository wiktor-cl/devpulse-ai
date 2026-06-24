import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/services'
import { Shield, Users, FolderKanban, ListTodo, UserCheck, Loader2, Search, Ban, Crown } from 'lucide-react'
import { cn } from '@/utils/cn'
import { format } from 'date-fns'

export default function AdminPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'logs'>('overview')

  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.getStats,
  })

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: () => adminApi.getUsers({ search: search || undefined }),
  })

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['admin', 'logs'],
    queryFn: () => adminApi.getActivityLogs(),
    enabled: activeTab === 'logs',
  })

  const toggleMutation = useMutation({
    mutationFn: adminApi.toggleUserActive,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.changeRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
          <Shield size={20} className="text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">System management and monitoring</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
            { label: 'Active Users', value: stats.activeUsers, icon: UserCheck, color: 'text-green-500 bg-green-500/10' },
            { label: 'Projects', value: stats.totalProjects, icon: FolderKanban, color: 'text-purple-500 bg-purple-500/10' },
            { label: 'Tasks', value: stats.totalTasks, icon: ListTodo, color: 'text-orange-500 bg-orange-500/10' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{label}</span>
                <div className={cn('p-2 rounded-lg', color.split(' ')[1])}>
                  <Icon size={14} className={color.split(' ')[0]} />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {(['overview', 'users', 'logs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize',
              activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users…"
              className="pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full"
            />
          </div>

          {usersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">User</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Role</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Joined</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData?.content?.map((user: any) => (
                    <tr key={user.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {user.fullName?.charAt(0) ?? 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          user.role === 'ADMIN' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          user.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        )}>
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                        {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => roleMutation.mutate({
                              id: user.id,
                              role: user.role === 'ADMIN' ? 'USER' : 'ADMIN',
                            })}
                            title={user.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                          >
                            <Crown size={13} />
                          </button>
                          <button
                            onClick={() => toggleMutation.mutate(user.id)}
                            title={user.active ? 'Deactivate' : 'Activate'}
                            className={cn(
                              'p-1.5 rounded-lg transition-colors',
                              user.active
                                ? 'hover:bg-destructive/10 text-muted-foreground hover:text-destructive'
                                : 'hover:bg-green-500/10 text-muted-foreground hover:text-green-500'
                            )}
                          >
                            <Ban size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Activity Logs tab */}
      {activeTab === 'logs' && (
        <div className="space-y-2">
          {logsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Action</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Entity</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Description</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logsData?.content?.map((log: any) => (
                      <tr key={log.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{log.action}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{log.entityType}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">{log.description}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                          {log.createdAt ? format(new Date(log.createdAt), 'MMM d HH:mm') : '—'}
                        </td>
                      </tr>
                    ))}
                    {!logsData?.content?.length && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">
                          No activity logs yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground">
          <Shield size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-foreground">System is operational</p>
          <p className="text-sm mt-1">All services running normally. Switch to Users or Logs tabs for detailed management.</p>
        </div>
      )}
    </div>
  )
}
