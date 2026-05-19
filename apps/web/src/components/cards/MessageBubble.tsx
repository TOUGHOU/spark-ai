import type { Message as SparkMessage } from '@spark/types'
import {
  Message as AiMessage,
  MessageContent,
} from '@/components/ai-elements/message'

interface MessageBubbleProps {
  message: SparkMessage
  children: React.ReactNode
}

export function MessageBubble({ message, children }: MessageBubbleProps) {
  const role = message.role === 'system' ? 'assistant' : message.role
  const metadataLine = [
    message.metadata?.model,
    message.metadata?.latency != null ? `${message.metadata.latency}ms` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <AiMessage from={role}>
      {metadataLine ? (
        <p className="text-muted-foreground text-xs">{metadataLine}</p>
      ) : null}
      <MessageContent>{children}</MessageContent>
    </AiMessage>
  )
}
