import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { User, Mail, Shield, Calendar, Edit3, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/utils/cn'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.fullName ?? '')

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account information</p>
      </div>

      {/* Avatar + name */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
            {user.fullName?.charAt(0) ?? 'U'}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={() => setEditing(false)}
                  className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => { setName(user.fullName ?? ''); setEditing(false) }}
                  className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{user.fullName}</h2>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                >
                  <Edit3 size={13} />
                </button>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-0.5">@{user.username}</p>
            <span className={cn(
              'inline-flex mt-2 text-xs px-2 py-0.5 rounded-full font-medium',
              user.role === 'ADMIN' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
            )}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {[
          { icon: Mail, label: 'Email', value: user.email },
          { icon: User, label: 'Username', value: `@${user.username}` },
          { icon: Shield, label: 'Role', value: user.role },
          { icon: Calendar, label: 'Member since', value: user.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : '—' },
          { icon: Calendar, label: 'Last login', value: user.lastLogin ? format(new Date(user.lastLogin), 'MMM d, yyyy HH:mm') : 'Never' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 px-6 py-4">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Icon size={14} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Account status */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Account Status</h3>
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-2.5 h-2.5 rounded-full',
            user.active ? 'bg-green-500' : 'bg-red-500'
          )} />
          <span className="text-sm text-foreground">
            Account is <span className="font-medium">{user.active ? 'Active' : 'Inactive'}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
