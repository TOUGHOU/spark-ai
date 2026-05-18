/**
 * @file parseMarkdownToCards.ts
 * @description 将 Markdown 文本拆分为 Spark 消息卡片（text + code）
 */

import { MessageContentType, type MessageContent } from '@spark/types'

const CODE_FENCE_RE = /```(\w+)?\n([\s\S]*?)```/g

/** 按 ``` 代码块拆分，其余为 markdown 文本卡片 */
export function parseMarkdownToCards(text: string): MessageContent[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  const cards: MessageContent[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  CODE_FENCE_RE.lastIndex = 0
  while ((match = CODE_FENCE_RE.exec(trimmed)) !== null) {
    const before = trimmed.slice(lastIndex, match.index).trim()
    if (before) {
      cards.push({
        type: MessageContentType.TEXT,
        text: before,
        markdown: true,
      })
    }

    cards.push({
      type: MessageContentType.CODE,
      code: match[2].replace(/\n$/, ''),
      language: match[1] || 'plaintext',
      copyable: true,
    })

    lastIndex = CODE_FENCE_RE.lastIndex
  }

  const rest = trimmed.slice(lastIndex).trim()
  if (rest) {
    cards.push({
      type: MessageContentType.TEXT,
      text: rest,
      markdown: true,
    })
  }

  if (cards.length === 0) {
    cards.push({
      type: MessageContentType.TEXT,
      text: trimmed,
      markdown: true,
    })
  }

  return cards
}
