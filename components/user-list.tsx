'use client'

import { useEffect, useState } from 'react'
import { supabase, User } from '@/lib/supabase'
import { getStatusColor, getStatusLabel } from '@/lib/presence'

interface UserListProps {
  serverId: string
}

export default function UserList({ serverId }: UserListProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!serverId) return

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('server_members')
        .select(`
          user_id,
          role,
          users(id, username, avatar_url, status)
        `)
        .eq('server_id', serverId)

      if (!error && data) {
        setUsers(data.map(m => (m as any).users))
      }
      setLoading(false)
    }

    fetchUsers()

    // Subscribe to user status changes
    const subscription = supabase
      .channel(`server:${serverId}:users`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        () => fetchUsers()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [serverId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border-l border-slate-700 w-56 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Members ({users.length})
        </h3>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {users.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-slate-400 text-sm">No members in this server</p>
          </div>
        ) : (
          <div className="space-y-1 p-3">
            {users.map(user => (
              <div
                key={user.id}
                className="px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-3 cursor-pointer group"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url || "/placeholder.svg"}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Status Indicator */}
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${getStatusColor(user.status)}`} />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-slate-500">
                    {getStatusLabel(user.status)}
                  </p>
                </div>

                {/* Context Menu */}
                <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-700 rounded transition-all">
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
