'use client'

import React from "react"

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CreateServerPage() {
  const { userId } = useAuth()
  const router = useRouter()
  const [serverName, setServerName] = useState('')
  const [serverDescription, setServerDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId || !serverName.trim()) {
      setError('Server name is required')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      // Create server
      const { data: server, error: serverError } = await supabase
        .from('servers')
        .insert({
          name: serverName,
          description: serverDescription,
          owner_id: userId,
        })
        .select()
        .single()

      if (serverError) throw serverError

      // Create general channel
      const { error: channelError } = await supabase
        .from('channels')
        .insert({
          server_id: server.id,
          name: 'general',
          type: 'text',
          is_private: false,
          created_by: userId,
        })

      if (channelError) throw channelError

      // Add owner as member
      const { error: memberError } = await supabase
        .from('server_members')
        .insert({
          server_id: server.id,
          user_id: userId,
          role: 'owner',
        })

      if (memberError) throw memberError

      router.push(`/servers/${server.id}`)
    } catch (err) {
      console.error('Error creating server:', err)
      setError('Failed to create server')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="p-6 flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create a Server</h1>
          <p className="text-slate-400">Start your own community</p>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateServer} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-600/20 border border-red-600 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Server Icon Preview */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                {serverName.charAt(0).toUpperCase() || '+'}
              </div>
            </div>

            {/* Server Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Server Name</label>
              <input
                type="text"
                value={serverName}
                onChange={e => setServerName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="My Awesome Server"
                maxLength={32}
              />
              <p className="text-xs text-slate-500 mt-1">{serverName.length}/32 characters</p>
            </div>

            {/* Server Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
              <textarea
                value={serverDescription}
                onChange={e => setServerDescription(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                placeholder="What's your server about?"
                rows={3}
                maxLength={120}
              />
              <p className="text-xs text-slate-500 mt-1">{serverDescription.length}/120 characters</p>
            </div>

            {/* Features List */}
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Included</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Text channels
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Voice channels
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Invite members
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Full admin control
                </li>
              </ul>
            </div>

            {/* Create Button */}
            <button
              type="submit"
              disabled={isCreating}
              className="w-full px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
            >
              {isCreating ? 'Creating Server...' : 'Create Server'}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Info */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Creating a server means you and your friends can have your own community space.
        </p>
      </div>
    </div>
  )
}
