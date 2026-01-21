import { supabase } from './supabase'

export type NotificationType = 'message' | 'mention' | 'call_invite' | 'user_online' | 'user_offline'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  related_user_id?: string
  related_message_id?: string
  content?: string
  read_at?: string
  created_at: string
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  content: string,
  relatedUserId?: string,
  relatedMessageId?: string
) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        content,
        related_user_id: relatedUserId,
        related_message_id: relatedMessageId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating notification:', error)
  }
}

export async function fetchNotifications(userId: string, limit = 20) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)

    if (error) throw error
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null)

    if (error) throw error
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting notification:', error)
  }
}

export async function subscribeToNotifications(
  userId: string,
  callback: (data: any) => void
) {
  const subscription = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      payload => callback(payload)
    )
    .subscribe()

  return subscription
}

export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'message':
      return '💬'
    case 'mention':
      return '@'
    case 'call_invite':
      return '📞'
    case 'user_online':
      return '🟢'
    case 'user_offline':
      return '⚫'
    default:
      return '🔔'
  }
}

export function getNotificationTitle(type: NotificationType): string {
  switch (type) {
    case 'message':
      return 'New Message'
    case 'mention':
      return 'You were mentioned'
    case 'call_invite':
      return 'Call Invite'
    case 'user_online':
      return 'User Online'
    case 'user_offline':
      return 'User Offline'
    default:
      return 'Notification'
  }
}
