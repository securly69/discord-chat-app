'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import { supabase, Message } from '@/lib/supabase'
import MessageList from '@/components/message-list'
import MessageInput from '@/components/message-input'

export default function ChannelPage() {
  const { userId } = useAuth()
  const params = useParams()
  const channelId = params.id as string
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [channelName, setChannelName] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch initial messages
  useEffect(() => {
    if (!channelId) return

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `/api/chat/messages?channelId=${channelId}&limit=50`
        )
        const data = await response.json()
        if (data.messages) {
          setMessages(data.messages)
        }

        // Fetch channel name
        const { data: channel } = await supabase
          .from('channels')
          .select('name')
          .eq('id', channelId)
          .single()

        if (channel) {
          setChannelName(channel.name)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // Subscribe to new messages
    const subscription = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        payload => {
          const newMessage = payload.new as Message
          setMessages(prev => [...prev, newMessage])
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [channelId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!userId || !content.trim()) return

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, content }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      setMessages(prev => [...prev, data.message])
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="h-14 border-b border-slate-700 px-6 flex items-center">
        <h2 className="text-lg font-semibold text-white">#{channelName}</h2>
      </div>

      {/* Messages */}
      <MessageList messages={messages} messagesEndRef={messagesEndRef} />

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  )
}
