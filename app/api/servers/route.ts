import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: servers, error } = await supabase
      .from('servers')
      .select(`
        *,
        members:server_members(count),
        channels(id, name, type)
      `)
      .or(
        `owner_id.eq.${userId},and(server_members.user_id.eq.${userId})`
      )

    if (error) throw error

    return NextResponse.json({ servers })
  } catch (error) {
    console.error('Servers fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, description, icon_url } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Server name required' }, { status: 400 })
    }

    const { data: server, error: serverError } = await supabase
      .from('servers')
      .insert({ name, description, icon_url, owner_id: userId })
      .select()
      .single()

    if (serverError) throw serverError

    // Create general channel
    await supabase.from('channels').insert({
      server_id: server.id,
      name: 'general',
      type: 'text',
      is_private: false,
      created_by: userId,
    })

    // Add owner as member
    await supabase.from('server_members').insert({
      server_id: server.id,
      user_id: userId,
      role: 'owner',
    })

    return NextResponse.json({ server })
  } catch (error) {
    console.error('Server creation error:', error)
    return NextResponse.json({ error: 'Failed to create server' }, { status: 500 })
  }
}
