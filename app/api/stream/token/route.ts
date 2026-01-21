import { auth } from '@clerk/nextjs/server'
import { StreamChat } from 'stream-chat'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    const { userId: clerkUserId } = await auth()

    // Security: Ensure user can only generate tokens for themselves
    if (userId !== clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const streamSecret = process.env.STREAM_SECRET!
    const streamKey = process.env.NEXT_PUBLIC_STREAM_KEY!

    const client = StreamChat.getInstance(streamKey, streamSecret)
    const token = client.createToken(userId)

    return NextResponse.json({ token })
  } catch (error) {
    console.error('Stream token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}
