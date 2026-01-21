'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import { supabase, VoiceSession } from '@/lib/supabase'

export default function VoiceChannelPage() {
  const { userId } = useAuth()
  const params = useParams()
  const channelId = params.id as string
  const [activeSession, setActiveSession] = useState<VoiceSession | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [channelName, setChannelName] = useState('')

  useEffect(() => {
    if (!channelId) return

    // Fetch channel info
    const fetchChannel = async () => {
      const { data: channel } = await supabase
        .from('channels')
        .select('name')
        .eq('id', channelId)
        .single()

      if (channel) setChannelName(channel.name)
    }

    fetchChannel()
  }, [channelId])

  const handleConnect = async () => {
    if (!userId) return

    try {
      // Create voice session
      const { data: session } = await supabase
        .from('voice_sessions')
        .insert({
          channel_id: channelId,
          user_id: userId,
          session_token: `token_${Date.now()}`,
        })
        .select()
        .single()

      if (session) {
        setActiveSession(session)
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Error connecting to voice:', error)
    }
  }

  const handleDisconnect = async () => {
    if (!activeSession) return

    try {
      await supabase
        .from('voice_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', activeSession.id)

      setActiveSession(null)
      setIsConnected(false)
    } catch (error) {
      console.error('Error disconnecting:', error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 border-b border-slate-700 px-6 flex items-center">
        <h2 className="text-lg font-semibold text-white">🎤 {channelName}</h2>
      </div>

      {/* Voice Container */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
        {isConnected ? (
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto mb-6 flex items-center justify-center">
              <div className="relative w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center">
                <div className="animate-pulse">
                  <svg className="w-10 h-10 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-white text-lg font-semibold mb-4">Connected to {channelName}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full transition-colors ${
                  isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d={isMuted ? "M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.81c0 .06.02.11.02.17v6c0 .55-.45 1-1 1s-1-.45-1-1v-.5c-2.5-.12-4.79-1.88-5.38-4.3H5c-.55 0-1-.45-1-1s.45-1 1-1h.02c0-.05.02-.11.02-.17 0-2.76 2.24-5 5-5 .05 0 .11.02.16.02V5c0-.55.45-1 1-1s1 .45 1 1v.37c1.15.37 2.16 1.08 2.91 1.95l1.46-1.46C15.92 4.5 14.06 3 12 3 9.25 3 6.88 4.63 5.84 7H5c-.55 0-1 .45-1 1s.45 1 1 1h.02c-.02.05-.02.11-.02.16 0 .73.18 1.43.48 2.05L4.27 12.5C3.5 11.25 3 9.78 3 8c0-4.97 4.03-9 9-9s9 4.03 9 9c0 4.18-2.9 7.66-6.72 8.66l1.23 1.23c.27-.62.43-1.31.43-2.05 0-.06-.02-.11-.02-.17h1.7c.55 0 1 .45 1 1s-.45 1-1 1z" : "M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"} />
                </svg>
              </button>
              <button
                onClick={handleDisconnect}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 10.5V7c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to connect?</h3>
            <button
              onClick={handleConnect}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
            >
              Join Voice Channel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
