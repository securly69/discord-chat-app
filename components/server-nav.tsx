'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { Server } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ServerNav() {
  const { userId } = useAuth()
  const router = useRouter()
  const [servers, setServers] = useState<Server[]>([])

  useEffect(() => {
    if (!userId) return

    const fetchServers = async () => {
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .or(`owner_id.eq.${userId},and(server_members.user_id.eq.${userId})`)

      if (!error && data) {
        setServers(data)
      }
    }

    fetchServers()

    // Subscribe to changes
    const subscription = supabase
      .channel('servers')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'servers' },
        () => fetchServers()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Home */}
      <Link
        href="/channels/@me"
        className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white font-bold transition-colors"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
        </svg>
      </Link>

      <div className="w-8 h-0.5 bg-slate-700 rounded-full" />

      {/* Servers */}
      {servers.map(server => (
        <Link
          key={server.id}
          href={`/servers/${server.id}`}
          className="w-12 h-12 rounded-full bg-slate-700 hover:bg-indigo-600 flex items-center justify-center text-white font-bold transition-colors"
          title={server.name}
        >
          {server.icon_url ? (
            <img
              src={server.icon_url || "/placeholder.svg"}
              alt={server.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            server.name.charAt(0).toUpperCase()
          )}
        </Link>
      ))}

      {/* Add Server */}
      <button
        onClick={() => router.push('/create-server')}
        className="w-12 h-12 rounded-full bg-slate-700 hover:bg-green-600 flex items-center justify-center text-white text-2xl transition-colors"
        title="Create or join a server"
      >
        +
      </button>
    </div>
  )
}
