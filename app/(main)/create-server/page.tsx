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
    <div className="p-6 flex justify-center h-full overflow-y-auto bg-[#313338]">
      <div className="w-full max-w-md my-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#F2F3F5] mb-2">Create Your Server</h1>
          <p className="text-[#B5BAC1]">Your server is where you and your friends hang out. Make yours and start talking.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateServer} className="bg-[#FFFFFF] dark:bg-[#FFFFFF] rounded-lg p-0 overflow-hidden shadow-sm">
          {/* Upload Container - Simulated */}
          <div className="flex justify-center pt-6 pb-2">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#B5BAC1] flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center">
                  <span className="text-[#4E5058] font-bold text-xs uppercase mb-1">Upload</span>
                  <svg className="w-6 h-6 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" /></svg>
                </div>
              </div>
              {serverName && (
                <div className="absolute inset-0 bg-[#5865F2] rounded-full flex items-center justify-center text-white text-3xl font-bold pointer-events-none">
                  {serverName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Server Name */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#4E5058] uppercase mb-2">Server Name</label>
              <input
                type="text"
                value={serverName}
                onChange={e => setServerName(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#E3E5E8] rounded-[3px] text-[#313338] placeholder-[#949BA4] focus:outline-none focus:ring-2 focus:ring-[#5865F2] transition-all font-medium"
                placeholder="My Server"
                maxLength={32}
              />
              <p className="text-xs text-[#5C5E66] mt-1 text-right">
                By creating a server, you agree to Cordis's <span className="text-[#00A8FC] cursor-pointer">Community Guidelines</span>.
              </p>
            </div>
          </div>


          {/* Footer Actions */}
          <div className="bg-[#F2F3F5] p-4 flex justify-between items-center">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 hover:underline text-[#313338] font-medium text-sm transition-colors"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={isCreating}
              className="px-8 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[3px] font-medium text-sm transition-colors shadow-sm"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
