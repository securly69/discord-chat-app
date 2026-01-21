import { supabase } from './supabase'

export type UserStatus = 'online' | 'offline' | 'idle' | 'do_not_disturb'

export async function updateUserPresence(
  userId: string,
  status: UserStatus,
  channelId?: string,
  statusMessage?: string
) {
  try {
    // Update user status
    const { error: userError } = await supabase
      .from('users')
      .update({
        status,
        status_message: statusMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (userError) throw userError

    // Update or create presence record
    const { error: presenceError } = await supabase
      .from('user_presence')
      .upsert({
        user_id: userId,
        channel_id: channelId || null,
        last_seen: new Date().toISOString(),
      })

    if (presenceError) throw presenceError
  } catch (error) {
    console.error('Error updating presence:', error)
  }
}

export async function subscribeToPresence(
  callback: (data: any) => void
) {
  const subscription = supabase
    .channel('presence')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_presence',
      },
      payload => callback(payload)
    )
    .subscribe()

  return subscription
}

export async function subscribeToUserStatus(
  userId: string,
  callback: (data: any) => void
) {
  const subscription = supabase
    .channel(`user:${userId}:status`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`,
      },
      payload => callback(payload)
    )
    .subscribe()

  return subscription
}

export function getStatusColor(status: UserStatus): string {
  switch (status) {
    case 'online':
      return 'bg-green-500'
    case 'idle':
      return 'bg-yellow-500'
    case 'do_not_disturb':
      return 'bg-red-500'
    case 'offline':
    default:
      return 'bg-slate-500'
  }
}

export function getStatusLabel(status: UserStatus): string {
  switch (status) {
    case 'online':
      return 'Online'
    case 'idle':
      return 'Away'
    case 'do_not_disturb':
      return 'Do Not Disturb'
    case 'offline':
    default:
      return 'Offline'
  }
}
