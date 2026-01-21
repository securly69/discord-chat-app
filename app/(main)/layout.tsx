'use client'

import { ReactNode } from 'react'
import { UserButton } from '@clerk/nextjs'
import Sidebar from '@/components/sidebar'
import ServerNav from '@/components/server-nav'
import NotificationBell from '@/components/notification-bell'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950">
      {/* Server Navigation */}
      <div className="w-20 bg-slate-900 border-r border-slate-700 flex flex-col items-center py-4 gap-2 overflow-y-auto">
        <ServerNav />
      </div>

      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-white">#general</h2>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <UserButton />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
