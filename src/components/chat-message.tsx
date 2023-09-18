import { formatDistanceToNow } from 'date-fns'
import React from 'react'
import { twMerge } from 'tailwind-merge'

export interface ChatMessageProps {
  position: 'left' | 'right'
  message: string
  userNickname: string
  timestamp: number
}

export const ChatMessage = ({
  position,
  message,
  userNickname,
  timestamp
}: ChatMessageProps) => {
  const relativeTime = formatDistanceToNow(new Date(timestamp), {
    addSuffix: true
  })

  return (
    <div className="chat-message animate-fade-right animate-ease-linear">
      <div
        className={twMerge(
          'flex items-end',
          position === 'right' ? 'justify-end' : ''
        )}
      >
        <div
          className={twMerge(
            'flex flex-col space-y-2 text-xs max-w-xs mx-2 items-start',
            position === 'left' ? 'order-2' : 'order-1'
          )}
        >
          <div className="flex flex-row gap-1">
            <span>{userNickname}</span>
            <span>&bull;</span>
            <span>{relativeTime}</span>
          </div>
          <span
            className={twMerge(
              'px-4 py-2 rounded-lg inline-block  text-foreground ',
              position === 'left'
                ? 'bg-emerald-600 rounded-bl-none self-start'
                : 'bg-blue-600 rounded-br-none self-end'
            )}
          >
            {message}
          </span>
        </div>
        <div
          className={twMerge(
            `w-8 h-8 bg-gradient-to-r rounded-full`,
            position === 'left'
              ? 'order-1 from-indigo-500 via-purple-500 to-pink-500'
              : 'order-2  from-blue-500 via-violet-500 to-indigo-500'
          )}
        ></div>
      </div>
    </div>
  )
}
