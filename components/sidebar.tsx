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
    <div className="flex flex-col h-full bg-[#2B2D31]">
      {/* Server Header */}
      <div className="px-4 py-3 h-12 border-b border-[#1E1F22] shadow-sm flex items-center hover:bg-[#35373C] cursor-pointer transition-colors transition-duration-200">
        {activeServer && servers.find(s => s.id === activeServer) && (
          <h1 className="text-sm font-bold text-[#F2F3F5] truncate flex-1 leading-tight">
            {servers.find(s => s.id === activeServer)?.name}
          </h1>
        )}
        <svg className="w-4 h-4 text-[#B5BAC1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 custom-scrollbar">
        {channels.filter(c => c.type === 'text').length > 0 && (
          <div className="pt-2">
            <div className="px-2 flex items-center justify-between text-[#949BA4] hover:text-[#DBDEE1] cursor-pointer group mb-0.5">
              <h3 className="text-[12px] font-bold uppercase tracking-wide flex items-center gap-0.5">
                <svg className="w-3 h-3 group-hover:text-[#DBDEE1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                Text Channels
              </h3>
              <svg className="w-4 h-4 opacity-0 group-hover:opacity-100" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
            </div>
            {channels
              .filter(c => c.type === 'text')
              .map(channel => (
                <Link
                  key={channel.id}
                  href={`/channels/${channel.id}`}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-[4px] text-[#949BA4] hover:bg-[#35373C] hover:text-[#DBDEE1] transition-colors group mx-2"
                >
                  <span className="text-xl text-[#80848E] font-light leading-none">#</span>
                  <span className="font-medium truncate">{channel.name}</span>
                </Link>
              ))}
          </div>
        )}

        {channels.filter(c => c.type === 'voice').length > 0 && (
          <div className="pt-4 drop-shadow-[0_1px_0_rgba(1,1,1,1)]">
            <div className="px-2 flex items-center justify-between text-[#949BA4] hover:text-[#DBDEE1] cursor-pointer group mb-0.5">
              <h3 className="text-[12px] font-bold uppercase tracking-wide flex items-center gap-0.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                Voice Channels
              </h3>
              <svg className="w-4 h-4 opacity-0 group-hover:opacity-100" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
            </div>
            {channels
              .filter(c => c.type === 'voice')
              .map(channel => (
                <Link
                  key={channel.id}
                  href={`/voice/${channel.id}`}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-[4px] text-[#949BA4] hover:bg-[#35373C] hover:text-[#DBDEE1] transition-colors mx-2"
                >
                  <svg className="w-5 h-5 text-[#80848E]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" fill="none" strokeWidth="2" /></svg>
                  <span className="font-medium truncate">{channel.name}</span>
                </Link>
              ))}
          </div>
        )}

        {channels.filter(c => c.type === 'video').length > 0 && (
          <div className="pt-4">
            <h3 className="px-2 text-[12px] font-bold text-[#949BA4] uppercase tracking-wide mb-1 flex items-center gap-0.5 hover:text-[#DBDEE1] cursor-pointer">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              Video Channels
            </h3>
            {channels
              .filter(c => c.type === 'video')
              .map(channel => (
                <Link
                  key={channel.id}
                  href={`/video/${channel.id}`}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-[4px] text-[#949BA4] hover:bg-[#35373C] hover:text-[#DBDEE1] transition-colors mx-2"
                >
                  <svg className="w-5 h-5 text-[#80848E]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <span className="font-medium truncate">{channel.name}</span>
                </Link>
              ))}
          </div>
        )}
      </div>

      {/* User Area / Direct Messages Footer - Mimicking User Area */}
      <div className="px-2 py-2 bg-[#232428] flex items-center gap-2">
        {/* Using random mockuser data for visual structure if real data is loading */}
        <div className="flex-1 flex items-center gap-2 p-1 rounded hover:bg-[#3F4147] cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white text-xs overflow-hidden">
            <img src={`https://ui-avatars.com/api/?name=User&background=random`} alt="User" className="w-full h-full" />
          </div>
          <div className="flex flex-col text-xs">
            <span className="text-white font-bold ml-0.5">User</span>
            <span className="text-[#B5BAC1] text-[10px]">#1234</span>
          </div>
        </div>
        <div className="flex items-center">
          <button className="p-1.5 hover:bg-[#3F4147] rounded text-[#B5BAC1] hover:text-[#DBDEE1]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" /><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
          </button>
          <button className="p-1.5 hover:bg-[#3F4147] rounded text-[#B5BAC1] hover:text-[#DBDEE1]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.77 8.87a.484.484 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.48.48 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.58 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
