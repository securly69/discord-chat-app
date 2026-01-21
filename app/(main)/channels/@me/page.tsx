import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Wumpus Image (using a placeholder that looks similar or just pure CSS if preferred, using an SVG path here for reliability)
  // Replicating the "No Friends Online" or "Waiting for friends" state of Discord
  return (
    <div className="flex flex-col h-full w-full bg-[#313338] relative overflow-hidden">
      {/* Top Friend Bar Mockup */}
      <div className="h-12 border-b border-[#1f2023] flex items-center px-4 space-x-4 bg-[#313338]">
        <div className="flex items-center gap-2 text-[#949BA4] font-bold mr-4">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" /></svg>
          <span>Friends</span>
        </div>
        <div className="h-6 w-[1px] bg-[#3F4147] mx-2"></div>
        <button className="text-white bg-[#3F4147] hover:bg-[#3F4147] px-2 py-0.5 rounded text-sm font-medium cursor-default">Online</button>
        <button className="text-[#949BA4] hover:bg-[#3F4147] hover:text-[#DBDEE1] px-2 py-0.5 rounded text-sm font-medium transition-colors">All</button>
        <button className="text-[#949BA4] hover:bg-[#3F4147] hover:text-[#DBDEE1] px-2 py-0.5 rounded text-sm font-medium transition-colors">Pending</button>
        <button className="text-[#949BA4] hover:bg-[#3F4147] hover:text-[#DBDEE1] px-2 py-0.5 rounded text-sm font-medium transition-colors">Blocked</button>
        <button className="text-white bg-[#248045] px-2 py-0.5 rounded text-sm font-medium ml-auto">Add Friend</button>
      </div>

      {/* Empty State / Wumpus Area */}
      <div className="flex-1 flex flex-col items-center justify-center pb-20">
        <div className="w-full max-w-sm text-center">
          {/* Visual placeholder for Wumpus */}
          <div className="mb-8 w-64 h-48 mx-auto bg-contain bg-no-repeat bg-center opacity-80"
            style={{ backgroundImage: "url('https://cdn.discordapp.com/attachments/1090332304958193836/1109919018420958133/wumpus_waiting.png')" }}>
            {/* Fallback internal SVG if external image fails or is blocked */}
          </div>
          <h2 className="text-[#DBDEE1] text-[17px] mt-4 mb-2 font-normal">No one's around to play with Wumpus.</h2>
          <p className="text-[#949BA4] text-[14px]">
            Select a server from the left sidebar to start chatting, or click "Find or start a conversation" to message a friend.
          </p>
        </div>
      </div>
    </div>
  )
}
