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
    <div className="flex flex-col items-center gap-3 w-full pt-3">
      {/* Home */}
      <div className="relative group">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-lg transition-all duration-200 h-0 group-hover:h-8 group-hover:top-2" />
        <Link
          href="/channels/@me"
          className="w-12 h-12 rounded-[24px] group-hover:rounded-[16px] bg-[#5865F2] hover:bg-[#5865F2] flex items-center justify-center text-white font-bold transition-all duration-200 overflow-hidden mx-auto"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.486 13.486 0 0 0-.64 1.343 18.258 18.258 0 0 0-4.868 0C9.66 5.86 9.49 6.206 9.4 6.326a.072.072 0 0 0-.078-.037 19.8 19.8 0 0 0-4.887 1.515.075.075 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .03.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.127 10.2 10.2 0 0 0 .373-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.04.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03z" />
          </svg>
        </Link>
      </div>

      <div className="w-8 h-[2px] bg-[#35373C] rounded-full" />

      {/* Servers */}
      {servers.map(server => (
        <div key={server.id} className="relative group w-full flex justify-center">
          {/* Active/Hover Indicator */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-lg transition-all duration-200 h-0 group-hover:h-5 group-hover:top-3.5 my-auto" />

          <Link
            href={`/servers/${server.id}`}
            className="w-12 h-12 rounded-[24px] group-hover:rounded-[16px] bg-[#313338] hover:bg-[#5865F2] flex items-center justify-center text-[#DBDEE1] hover:text-white font-bold transition-all duration-200 overflow-hidden"
            title={server.name}
          >
            {server.icon_url ? (
              <img
                src={server.icon_url || "/placeholder.svg"}
                alt={server.name}
                className="w-full h-full object-cover"
              />
            ) : (
              server.name.charAt(0).toUpperCase()
            )}
          </Link>
        </div>
      ))}

      {/* Add Server */}
      <div className="relative group w-full flex justify-center">
        <button
          onClick={() => router.push('/create-server')}
          className="w-12 h-12 rounded-[24px] group-hover:rounded-[16px] bg-[#313338] hover:bg-[#23A559] flex items-center justify-center text-[#23A559] hover:text-white text-2xl transition-all duration-200"
          title="Create or join a server"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
