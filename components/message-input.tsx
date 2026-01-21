'use client'

import React from "react"

import { useState, useRef } from 'react'

interface MessageInputProps {
  onSendMessage: (message: string) => void
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="px-6 py-4 border-t border-slate-700">
      <div
        className={`flex items-end gap-3 p-3 rounded-lg transition-colors ${
          isFocused ? 'bg-slate-800' : 'bg-slate-800/50'
        }`}
      >
        <button
          className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors"
          title="Add attachment"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>

        <textarea
          ref={inputRef}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Message #channel"
          className="flex-1 bg-transparent text-white placeholder-slate-500 resize-none outline-none max-h-32"
          rows={1}
          style={{
            minHeight: '24px',
            lineHeight: '24px',
          }}
        />

        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="p-2 hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed text-slate-400 hover:text-slate-200 transition-colors"
          title="Send message"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.9429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.01449694 C3.34915502,0.9039999 2.40734225,1.01449694 1.77946707,1.4857891 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99581571 L3.03521743,10.4368088 C3.03521743,10.5939061 3.19218622,10.7510035 3.50612381,10.7510035 L16.6915026,11.5364905 C16.6915026,11.5364905 17.1624089,11.5364905 17.1624089,12.0077827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
          </svg>
        </button>
      </div>

      <p className="text-xs text-slate-500 mt-2">
        Press <kbd className="px-1 py-0.5 bg-slate-700 rounded">Shift+Enter</kbd> for new line
      </p>
    </div>
  )
}
