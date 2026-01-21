'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import { supabase, VideoSession, VideoParticipant } from '@/lib/supabase'

interface Participant extends VideoParticipant {
  user?: { username: string }
}

export default function VideoChannelPage() {
  const { userId } = useAuth()
  const params = useParams()
  const channelId = params.id as string
  const [activeSession, setActiveSession] = useState<VideoSession | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
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

  const handleStartCall = async () => {
    if (!userId) return

    try {
      // Create video session
      const { data: session } = await supabase
        .from('video_sessions')
        .insert({
          channel_id: channelId,
          initiator_id: userId,
          session_token: `token_${Date.now()}`,
        })
        .select()
        .single()

      if (session) {
        setActiveSession(session)

        // Add initiator as participant
        await supabase.from('video_participants').insert({
          video_session_id: session.id,
          user_id: userId,
        })

        setIsConnected(true)
      }
    } catch (error) {
      console.error('Error starting call:', error)
    }
  }

  const handleEndCall = async () => {
    if (!activeSession) return

    try {
      // Mark all participants as left
      await supabase
        .from('video_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('video_session_id', activeSession.id)

      // End session
      await supabase
        .from('video_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', activeSession.id)

      setActiveSession(null)
      setIsConnected(false)
      setParticipants([])
    } catch (error) {
      console.error('Error ending call:', error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 border-b border-slate-700 px-6 flex items-center">
        <h2 className="text-lg font-semibold text-white">📹 {channelName}</h2>
      </div>

      {/* Video Container */}
      <div className="flex-1 bg-black flex flex-col">
        {isConnected ? (
          <>
            {/* Main Video Grid */}
            <div className="flex-1 grid grid-cols-2 gap-2 p-4 overflow-auto">
              {/* Self Video */}
              <div className="bg-slate-800 rounded-lg overflow-hidden relative group">
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-indigo-600 mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                      {userId?.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-white text-sm">You</p>
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 text-xs text-slate-300 bg-black/50 px-2 py-1 rounded">
                  Your Video
                </div>
              </div>

              {/* Other Participants */}
              {participants.length === 0 && (
                <div className="bg-slate-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Waiting for others...</p>
                  </div>
                </div>
              )}

              {participants.map(participant => (
                <div
                  key={participant.id}
                  className="bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-600 mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                      {participant.user?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <p className="text-white text-sm">{participant.user?.username || 'Unknown'}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="bg-slate-900 border-t border-slate-700 px-6 py-4 flex justify-center gap-4">
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full transition-colors ${
                  isVideoOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d={isVideoOn ? "M17 10.5V7c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" : "M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"} />
                </svg>
              </button>
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
                onClick={handleEndCall}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 10.5V7c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to start a video call?</h3>
              <button
                onClick={handleStartCall}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
              >
                Start Video Call
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
