import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const user = await currentUser()

  return (
    <div className="flex flex-col h-full items-center justify-center text-center">
      <div className="mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
          {user?.firstName?.charAt(0) || 'U'}
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to Discord Clone, {user?.firstName}!
        </h1>
        <p className="text-slate-400 mb-8">
          Select a channel or server to start chatting
        </p>
      </div>

      <div className="max-w-md space-y-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Getting Started</h2>
          <ul className="text-slate-400 space-y-2 text-sm">
            <li>✓ Select a server from the left sidebar</li>
            <li>✓ Browse channels and join conversations</li>
            <li>✓ Start voice or video calls</li>
            <li>✓ Send direct messages to other users</li>
          </ul>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Features</h2>
          <ul className="text-slate-400 space-y-2 text-sm">
            <li>📝 Real-time text messaging</li>
            <li>🎤 Voice channels with Crystal Clear audio</li>
            <li>📹 Video calls and screen sharing</li>
            <li>🔔 Instant notifications</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
