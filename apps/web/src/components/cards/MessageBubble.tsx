import { Bot, User } from 'lucide-react'
import type { Message } from '@spark/types'

interface MessageBubbleProps {
  message: Message
  children: React.ReactNode
}

export function MessageBubble({ message, children }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-gray-800/50 text-gray-400 text-sm px-4 py-2 rounded-lg max-w-[80%]">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* 头像 */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-gray-600' : 'bg-blue-600'
      }`}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      {/* 消息内容 */}
      <div className={`flex flex-col gap-1 max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* 元数据 */}
        {message.metadata && (
          <div className="text-xs text-gray-500 px-1">
            {message.metadata.model && <span>{message.metadata.model}</span>}
            {message.metadata.latency && <span> · {message.metadata.latency}ms</span>}
          </div>
        )}
        
        {/* 消息卡片 */}
        <div className={`px-4 py-2 rounded-2xl ${
          isUser 
            ? 'bg-blue-600 text-white rounded-br-md' 
            : 'bg-gray-700 text-gray-100 rounded-bl-md'
        }`}>
          {children}
        </div>
      </div>
    </div>
  )
}
