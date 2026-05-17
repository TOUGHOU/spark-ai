/**
 * @file uiMessageAdapter.ts
 * @description 将 AI SDK UIMessage 转换为 Spark 消息卡片格式
 */

import { MessageContentType, type Message } from '@spark/types'
import type { UIMessage } from 'ai'

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map(part => part.text)
    .join('')
}

export function uiMessageToSparkMessage(
  uiMessage: UIMessage,
  options?: { streaming?: boolean; agentId?: string },
): Message {
  const text = getMessageText(uiMessage)

  return {
    id: uiMessage.id,
    role: uiMessage.role,
    content: {
      type: MessageContentType.TEXT,
      text,
      markdown: uiMessage.role === 'assistant',
    },
    metadata: {
      streaming: options?.streaming,
      agentId: options?.agentId,
    },
  }
}
