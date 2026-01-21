'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import { supabase, Server, Channel } from '@/lib/supabase'

export default function ServerAdminPage() {
  const { userId } = useAuth()
  const params = useParams()
  const serverId = params.id as string
  const [server, setServer] = useState<Server | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [serverName, setServerName] = useState('')
  const [serverDescription, setServerDescription] = useState('')
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelType, setNewChannelType] = useState<'text' | 'voice' | 'video'>('text')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!serverId || !userId) return

    const fetchServer = async () => {
      const { data: serverData } = await supabase
        .from('servers')
        .select('*')
        .eq('id', serverId)
        .single()

      if (serverData) {
        setServer(serverData)
        setServerName(serverData.name)
        setServerDescription(serverData.description || '')
        setIsOwner(serverData.owner_id === userId)
      }

      const { data: channelsData } = await supabase
        .from('channels')
        .select('*')
        .eq('server_id', serverId)

      if (channelsData) {
        setChannels(channelsData)
      }
    }

    fetchServer()
  }, [serverId, userId])

  const handleSaveServer = async () => {
    if (!server) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('servers')
        .update({
          name: serverName,
          description: serverDescription,
        })
        .eq('id', serverId)

      if (error) throw error
      alert('Server updated!')
    } catch (error) {
      alert('Error updating server')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('channels')
        .insert({
          server_id: serverId,
          name: newChannelName,
          type: newChannelType,
          created_by: userId,
        })

      if (error) throw error

      setNewChannelName('')
      setNewChannelType('text')

      // Refresh channels
      const { data: channelsData } = await supabase
        .from('channels')
        .select('*')
        .eq('server_id', serverId)

      if (channelsData) {
        setChannels(channelsData)
      }
    } catch (error) {
      alert('Error creating channel')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm('Are you sure? This will delete all messages in this channel.')) return

    try {
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', channelId)

      if (error) throw error

      setChannels(channels.filter(c => c.id !== channelId))
    } catch (error) {
      alert('Error deleting channel')
    }
  }

  if (!isOwner) {
    return (
      <div className="p-6">
        <div className="bg-red-600/20 border border-red-600 rounded-lg p-6 text-red-400">
          <p className="font-semibold">Access Denied</p>
          <p className="text-sm mt-2">Only server owners can access admin settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Server Settings</h1>
          <p className="text-slate-400">Manage {server?.name}</p>
        </div>

        {/* Server Settings */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-6">Server Details</h2>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Server Name</label>
              <input
                type="text"
                value={serverName}
                onChange={e => setServerName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                value={serverDescription}
                onChange={e => setServerDescription(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                rows={4}
                placeholder="Describe your server"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveServer}
              disabled={isSaving}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Channels Management */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-6">Channels</h2>

          {/* Create Channel Form */}
          <div className="mb-6 pb-6 border-b border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Create New Channel</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newChannelName}
                onChange={e => setNewChannelName(e.target.value)}
                placeholder="Channel name"
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={newChannelType}
                onChange={e => setNewChannelType(e.target.value as any)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="text">Text</option>
                <option value="voice">Voice</option>
                <option value="video">Video</option>
              </select>
              <button
                onClick={handleCreateChannel}
                disabled={isSaving}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
              >
                Create
              </button>
            </div>
          </div>

          {/* Channels List */}
          <div className="space-y-2">
            {channels.length === 0 ? (
              <p className="text-slate-400 text-sm">No channels yet</p>
            ) : (
              channels.map(channel => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">
                      {channel.type === 'text' && '#'}
                      {channel.type === 'voice' && '🎤'}
                      {channel.type === 'video' && '📹'}
                      {' '}
                      {channel.name}
                    </p>
                    {channel.description && (
                      <p className="text-xs text-slate-400 mt-1">{channel.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteChannel(channel.id)}
                    className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
          <p className="text-slate-300 text-sm mb-4">
            Deleting a server is permanent and cannot be undone.
          </p>
          <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">
            Delete Server
          </button>
        </div>
      </div>
    </div>
  )
}
