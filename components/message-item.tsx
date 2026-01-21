'use client';

import { Message } from '@/lib/supabase'
import { useState } from 'react'

interface MessageItemProps {
  message: Message
  showAvatar: boolean
}

export default function MessageItem({ message, showAvatar }: MessageItemProps) {
  const [showReactions, setShowReactions] = useState(false)

  const timeString = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="group hover:bg-slate-800 rounded px-2 py-1 transition-colors">
      <div className="flex items-start gap-3">
        {showAvatar ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
            {(message as any).user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
        ) : (
          <div className="w-10" />
        )}

        <div className="flex-1 min-w-0">
          {showAvatar && (
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-semibold text-white">
                {(message as any).user?.username || 'Unknown'}
              </span>
              <span className="text-xs text-slate-500">{timeString}</span>
            </div>
          )}

          <p className="text-slate-200 break-words">{message.content}</p>

          {message.edited_at && (
            <span className="text-xs text-slate-500 italic">(edited)</span>
          )}
        </div>

        {/* Message Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200"
            title="Add reaction"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </button>

          <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200" title="More options">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
