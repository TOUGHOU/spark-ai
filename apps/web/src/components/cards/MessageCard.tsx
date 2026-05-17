import { MessageContentType, type Message, type MessageContent } from '@spark/types'
import { ActionCard } from './ActionCard'
import { AgentSwitchCard } from './AgentSwitchCard'
import { CodeCard } from './CodeCard'
import { FileCard } from './FileCard'
import { ImageCard } from './ImageCard'
import { MessageBubble } from './MessageBubble'
import { SystemCard } from './SystemCard'
import { TextCard } from './TextCard'
import { ThinkingCard } from './ThinkingCard'
import { ToolCallCard } from './ToolCallCard'

interface MessageCardProps {
  message: Message
  onAction?: (value: string) => void
}

/** 根据消息内容类型渲染对应的卡片组件 */
function renderContent(content: MessageContent, onAction?: (value: string) => void) {
  switch (content.type) {
    case MessageContentType.TEXT:
      return <TextCard content={content} />
    case MessageContentType.CODE:
      return <CodeCard content={content} />
    case MessageContentType.IMAGE:
      return <ImageCard content={content} />
    case MessageContentType.TOOL_CALL:
      return <ToolCallCard content={content} />
    case MessageContentType.THINKING:
      return <ThinkingCard content={content} />
    case MessageContentType.FILE:
      return <FileCard content={content} />
    case MessageContentType.ACTION:
      return <ActionCard content={content} onAction={onAction} />
    case MessageContentType.AGENT_SWITCH:
      return <AgentSwitchCard content={content} />
    case MessageContentType.SYSTEM:
      return <SystemCard content={content} />
    default:
      // 类型安全检查，确保所有类型都被处理
      const _exhaustive: never = content
      return null
  }
}

/** 渲染消息卡片，自动适配多种内容类型 */
export function MessageCard({ message, onAction }: MessageCardProps) {
  const { content } = message

  // 单条消息
  if (!Array.isArray(content)) {
    // 系统消息使用特殊样式
    if (content.type === MessageContentType.SYSTEM) {
      return <SystemCard content={content} />
    }

    return (
      <MessageBubble message={message}>
        {renderContent(content, onAction)}
      </MessageBubble>
    )
  }

  // 多条内容组合
  return (
    <MessageBubble message={message}>
      <div className="flex flex-col gap-3">
        {content.map((item, index) => (
          <div key={index}>
            {renderContent(item, onAction)}
          </div>
        ))}
      </div>
    </MessageBubble>
  )
}
