import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!channelId) {
      return NextResponse.json({ error: 'Missing channelId' }, { status: 400 })
    }

    // Verify user has access to channel
    const { data: channel } = await supabase
      .from('channels')
      .select('server_id')
      .eq('id', channelId)
      .single()

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    const { data: memberCheck } = await supabase
      .from('server_members')
      .select('id')
      .eq('server_id', channel.server_id)
      .eq('user_id', userId)
      .single()

    if (!memberCheck) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        user:users(id, username, avatar_url),
        attachments:message_attachments(*),
        reactions(*)
      `)
      .eq('channel_id', channelId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({ messages: messages.reverse() })
  } catch (error) {
    console.error('Message fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { channelId, content } = await request.json()

    if (!channelId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify access and create message
    const { data: channel } = await supabase
      .from('channels')
      .select('server_id')
      .eq('id', channelId)
      .single()

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    const { data: memberCheck } = await supabase
      .from('server_members')
      .select('id')
      .eq('server_id', channel.server_id)
      .eq('user_id', userId)
      .single()

    if (!memberCheck) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({ channel_id: channelId, user_id: userId, content })
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Message creation error:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}
