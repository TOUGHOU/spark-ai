/**
 * @file uiMessageAdapter.ts
 * @description 将 AI SDK UIMessage 转换为 Spark 消息卡片格式
 */

import {
  MessageContentSchema,
  MessageContentType,
  type Message,
  type MessageContent,
} from '@spark/types'
import type { UIMessage } from 'ai'
import { parseMarkdownToCards } from './parseMarkdownToCards.js'

export const SPARK_CARD_DATA_TYPE = 'data-spark-card' as const

type SparkCardDataPart = {
  type: typeof SPARK_CARD_DATA_TYPE
  data: unknown
}

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map(part => part.text)
    .join('')
}

function parseSparkCardPart(part: SparkCardDataPart): MessageContent | null {
  const parsed = MessageContentSchema.safeParse(part.data)
  return parsed.success ? parsed.data : null
}

/** 按 parts 顺序组装卡片：data-spark-card + 文本拆分的 code/text */
function partsToMessageContent(
  uiMessage: UIMessage,
  options?: { streaming?: boolean },
): MessageContent | MessageContent[] {
  const cards: MessageContent[] = []

  for (const part of uiMessage.parts) {
    if (part.type === SPARK_CARD_DATA_TYPE) {
      const card = parseSparkCardPart(part as SparkCardDataPart)
      if (card) cards.push(card)
      continue
    }

    if (part.type === 'text' && 'text' in part && part.text) {
      const isAssistant = uiMessage.role === 'assistant'
      if (isAssistant) {
        cards.push(...parseMarkdownToCards(part.text))
      } else {
        cards.push({
          type: MessageContentType.TEXT,
          text: part.text,
          markdown: false,
        })
      }
    }
  }

  if (cards.length === 0 && options?.streaming) {
    return {
      type: MessageContentType.TEXT,
      text: '',
      markdown: true,
    }
  }

  if (cards.length === 1) return cards[0]
  return cards
}

export function uiMessageToSparkMessage(
  uiMessage: UIMessage,
  options?: { streaming?: boolean; agentId?: string },
): Message {
  const content = partsToMessageContent(uiMessage, options)

  return {
    id: uiMessage.id,
    role: uiMessage.role,
    content,
    metadata: {
      streaming: options?.streaming,
      agentId: options?.agentId,
    },
  }
}
