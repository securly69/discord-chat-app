import { RefObject } from 'react'
import { Message } from '@/lib/supabase'
import MessageItem from './message-item'

interface MessageListProps {
  messages: Message[]
  messagesEndRef: RefObject<HTMLDivElement>
}

export default function MessageList({ messages, messagesEndRef }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-slate-400 text-lg mb-2">No messages yet</p>
            <p className="text-slate-500 text-sm">Be the first to send a message!</p>
          </div>
        </div>
      ) : (
        messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            showAvatar={
              index === 0 ||
              messages[index - 1].user_id !== message.user_id ||
              new Date(messages[index - 1].created_at).getTime() <
                new Date(message.created_at).getTime() - 60000
            }
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
