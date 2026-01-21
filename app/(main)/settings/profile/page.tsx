'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { supabase, User } from '@/lib/supabase'

export default function ProfileSettingsPage() {
  const { userId } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!userId) return

    const fetchUser = async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        setUser(data)
        setUsername(data.username)
        setStatusMessage(data.status_message || '')
      }
    }

    fetchUser()
  }, [userId])

  const handleSave = async () => {
    if (!userId || !username.trim()) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          username,
          status_message: statusMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) throw error

      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Error updating profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">User Settings</h1>
          <p className="text-slate-400">Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-6">Profile</h2>

          <div className="space-y-6">
            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Avatar</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                  Upload Image
                </button>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Your username"
              />
              <p className="text-xs text-slate-500 mt-1">This is your public display name</p>
            </div>

            {/* Status Message */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status Message</label>
              <input
                type="text"
                value={statusMessage}
                onChange={e => setStatusMessage(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="What are you up to?"
                maxLength={60}
              />
              <p className="text-xs text-slate-500 mt-1">{statusMessage.length}/60 characters</p>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">Managed by your auth provider</p>
            </div>

            {/* Message */}
            {message && (
              <div className={`px-4 py-2 rounded-lg text-sm ${
                message.includes('success')
                  ? 'bg-green-600/20 text-green-400'
                  : 'bg-red-600/20 text-red-400'
              }`}>
                {message}
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Privacy Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Privacy & Safety</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-700">
              <div>
                <p className="text-sm font-medium text-white">Allow direct messages from anyone</p>
                <p className="text-xs text-slate-400 mt-1">Let any user send you DMs</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-700">
              <div>
                <p className="text-sm font-medium text-white">Show online status</p>
                <p className="text-xs text-slate-400 mt-1">Let others see when you're online</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
