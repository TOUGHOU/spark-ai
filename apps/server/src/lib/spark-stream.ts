/**
 * @file spark-stream.ts
 * @description AI SDK 流式协议中的 Spark 卡片 data part
 */

import { MessageContentType, type AgentSwitchContent, type MessageContent } from '@spark/types'

export const SPARK_CARD_DATA_TYPE = 'data-spark-card' as const

export function writeSparkCard(
  writer: { write: (part: Record<string, unknown>) => void },
  content: MessageContent,
  id?: string,
) {
  writer.write({
    type: SPARK_CARD_DATA_TYPE,
    id: id ?? crypto.randomUUID(),
    data: content,
  })
}

export function buildAgentSwitchCard(options: {
  toAgentId: string
  toAgentName?: string
  fromAgentId?: string
  fromAgentName?: string
  reason?: string
}): AgentSwitchContent {
  return {
    type: MessageContentType.AGENT_SWITCH,
    toAgent: options.toAgentName ?? options.toAgentId,
    fromAgent: options.fromAgentName ?? options.fromAgentId,
    reason: formatRouteReason(options.reason),
  }
}

function formatRouteReason(reason?: string): string | undefined {
  if (!reason) return undefined
  const labels: Record<string, string> = {
    'keyword-match': '关键词匹配',
    'user-selected': '手动选择',
    'default-fallback': '默认助手',
  }
  if (labels[reason]) return labels[reason]
  if (reason.startsWith('intent:')) return `意图识别 · ${reason.slice(7)}`
  return reason
}
