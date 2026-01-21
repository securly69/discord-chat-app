'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { supabase, User } from '@/lib/supabase'
import { updateUserPresence, getStatusColor, getStatusLabel } from '@/lib/presence'

export default function UserStatus() {
  const { userId } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [currentStatus, setCurrentStatus] = useState('online')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    if (!userId) return

    // Fetch user data
    const fetchUser = async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        setUser(data)
        setCurrentStatus(data.status as string)
      }
    }

    fetchUser()

    // Set online status
    updateUserPresence(userId, 'online')

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateUserPresence(userId, 'idle')
      } else {
        updateUserPresence(userId, 'online')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Handle page unload
    const handleBeforeUnload = () => {
      updateUserPresence(userId, 'offline')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [userId])

  const handleStatusChange = async (status: string) => {
    if (!userId) return

    await updateUserPresence(userId, status)
    setCurrentStatus(status)
    setIsDropdownOpen(false)
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors w-full"
      >
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">
            {user.username?.charAt(0).toUpperCase()}
          </span>
          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${getStatusColor(currentStatus)}`} />
        </div>

        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {user.username}
          </p>
          <p className="text-xs text-slate-400">
            {getStatusLabel(currentStatus)}
          </p>
        </div>

        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {/* Status Dropdown */}
      {isDropdownOpen && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
          <div className="py-2">
            {(['online', 'idle', 'do_not_disturb', 'offline'] as string[]).map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className="w-full px-4 py-2 text-left hover:bg-slate-700 transition-colors flex items-center gap-3"
              >
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                <span className="text-sm text-slate-200">
                  {getStatusLabel(status)}
                </span>
                {currentStatus === status && (
                  <svg className="w-4 h-4 text-indigo-400 ml-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}
