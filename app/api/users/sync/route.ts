import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

export async function GET() {
  return Response.json({ status: 'Webhook endpoint ready' })
}

export async function POST(request: Request) {
  if (!webhookSecret) {
    console.error('[v0] CLERK_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 })
  }

  const payload = await request.json()
  const headers = {
    'svix-id': request.headers.get('svix-id'),
    'svix-timestamp': request.headers.get('svix-timestamp'),
    'svix-signature': request.headers.get('svix-signature'),
  }

  const wh = new Webhook(webhookSecret)
  let evt: any

  try {
    evt = wh.verify(JSON.stringify(payload), headers as any)
  } catch (err) {
    console.error('[v0] Webhook verification failed:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const eventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, username, email_addresses, image_url } = evt.data

    try {
      await supabaseAdmin.from('users').upsert({
        id,
        clerk_id: id,
        username: username || email_addresses[0]?.email_address?.split('@')[0],
        email: email_addresses[0]?.email_address,
        avatar_url: image_url,
        status: 'offline',
      })
    } catch (error) {
      console.error('Error syncing user:', error)
      return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try {
      await supabaseAdmin.from('users').delete().eq('clerk_id', id)
    } catch (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
