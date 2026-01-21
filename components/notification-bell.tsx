'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { fetchNotifications, subscribeToNotifications, markNotificationAsRead } from '@/lib/notifications'
import { Notification } from '@/lib/notifications'

export default function NotificationBell() {
  const { userId } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter(n => !n.read_at).length

  useEffect(() => {
    if (!userId) return

    // Fetch initial notifications
    const loadNotifications = async () => {
      const data = await fetchNotifications(userId)
      setNotifications(data)
    }

    loadNotifications()

    // Subscribe to new notifications
    const subscription = subscribeToNotifications(userId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setNotifications(prev => [payload.new, ...prev])
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [userId])

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read_at) {
      await markNotificationAsRead(notification.id)
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      )
    }
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors"
        title="Notifications"
      >
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  // Mark all as read action
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-slate-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 border-b border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors ${
                    !notification.read_at ? 'bg-slate-700/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">
                      {notification.type === 'message' && '💬'}
                      {notification.type === 'mention' && '@'}
                      {notification.type === 'call_invite' && '📞'}
                      {notification.type === 'user_online' && '🟢'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">
                        {notification.type === 'message' && 'New message'}
                        {notification.type === 'mention' && 'You were mentioned'}
                        {notification.type === 'call_invite' && 'Call invite'}
                        {notification.type === 'user_online' && 'User online'}
                      </p>
                      {notification.content && (
                        <p className="text-xs text-slate-400 mt-1 truncate">
                          {notification.content}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(notification.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    {!notification.read_at && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
