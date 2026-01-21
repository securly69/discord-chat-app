'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { Channel, Server } from '@/lib/supabase'
import Link from 'next/link'

export default function Sidebar() {
  const { userId } = useAuth()
  const [servers, setServers] = useState<Server[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeServer, setActiveServer] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const fetchServers = async () => {
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .or(`owner_id.eq.${userId},and(server_members.user_id.eq.${userId})`)

      if (!error && data) {
        setServers(data)
        if (data.length > 0) {
          setActiveServer(data[0].id)
        }
      }
      setLoading(false)
    }

    fetchServers()
  }, [userId])

  useEffect(() => {
    if (!activeServer) return

    const fetchChannels = async () => {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('server_id', activeServer)

      if (!error && data) {
        setChannels(data)
      }
    }

    fetchChannels()
  }, [activeServer])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Server Header */}
      <div className="px-4 py-4 border-b border-slate-700">
        {activeServer && servers.find(s => s.id === activeServer) && (
          <h1 className="text-lg font-bold text-white">
            {servers.find(s => s.id === activeServer)?.name}
          </h1>
        )}
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Text Channels
          </h3>
          {channels
            .filter(c => c.type === 'text')
            .map(channel => (
              <Link
                key={channel.id}
                href={`/channels/${channel.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <span className="text-lg">#</span>
                {channel.name}
              </Link>
            ))}
        </div>

        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Voice Channels
          </h3>
          {channels
            .filter(c => c.type === 'voice')
            .map(channel => (
              <Link
                key={channel.id}
                href={`/voice/${channel.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <span className="text-lg">🎤</span>
                {channel.name}
              </Link>
            ))}
        </div>

        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Video Channels
          </h3>
          {channels
            .filter(c => c.type === 'video')
            .map(channel => (
              <Link
                key={channel.id}
                href={`/video/${channel.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <span className="text-lg">📹</span>
                {channel.name}
              </Link>
            ))}
        </div>
      </div>

      {/* Direct Messages */}
      <div className="px-3 py-4 border-t border-slate-700">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Direct Messages
        </h3>
        <button className="w-full text-center px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-sm transition-colors">
          + New Message
        </button>
      </div>
    </div>
  )
}
