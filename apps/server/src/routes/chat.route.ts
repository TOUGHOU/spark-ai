/**
 * @file chat.route.ts
 * @description AI SDK 兼容的聊天流式接口
 */

import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from 'ai'
import type { Context } from 'hono'
import { agentRegistry } from '../registry/agent-registry.js'
import { createAgentRouter } from '../registry/agent-router.js'
import { buildAgentSwitchCard, writeSparkCard } from '../lib/spark-stream.js'

function extractTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map(part => part.text)
    .join('')
}

/** 将前端 UIMessage[] 转换为 Mastra Agent 可理解的 CoreMessage 格式 */
interface SimpleMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

function uiMessagesToCoreMessages(messages: UIMessage[]): SimpleMessage[] {
  return messages.map(msg => {
    const text = msg.parts
      ?.filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map(part => part.text)
      .join('') ?? ''

    if (msg.role === 'user') {
      return { role: 'user' as const, content: text }
    }
    if (msg.role === 'assistant') {
      return { role: 'assistant' as const, content: text }
    }
    return { role: 'system' as const, content: text }
  })
}

export async function handleChatRequest(c: Context) {
  try {
    const body = await c.req.json()
    const {
      messages,
      id: chatId,
      threadId,
      agentId: forcedAgentId,
      previousAgentId,
    } = body as {
      messages?: UIMessage[]
      id?: string
      threadId?: string
      agentId?: string
      previousAgentId?: string
    }

    if (!messages?.length) {
      return c.json({ error: 'Messages are required' }, 400)
    }

    const lastMessage = messages[messages.length - 1]
    const messageText = extractTextFromMessage(lastMessage)

    if (!messageText.trim()) {
      return c.json({ error: 'Message text is required' }, 400)
    }

    let agentId = forcedAgentId
    let routeReason = forcedAgentId ? 'user-selected' : undefined

    if (!agentId) {
      const agentRouter = createAgentRouter(agentRegistry)
      const route = await agentRouter.route(messageText)
      agentId = route.agentId
      routeReason = route.reason
    }

    const agent = agentRegistry.getMastraAgent(agentId)
    if (!agent) {
      return c.json({ error: `Agent not found: ${agentId}` }, 404)
    }

    const resolvedThreadId = threadId || chatId || crypto.randomUUID()
    const toConfig = agentRegistry.getConfig(agentId)
    const fromConfig = previousAgentId
      ? agentRegistry.getConfig(previousAgentId)
      : undefined

    const shouldShowAgentSwitch =
      !previousAgentId || previousAgentId !== agentId

    console.log(`[Chat] agent=${agentId} thread=${resolvedThreadId}`)
    console.log(`[Chat] message=${messageText.slice(0, 120)}`)

    const stream = createUIMessageStream({
      originalMessages: messages,
      execute: async ({ writer }) => {
        if (shouldShowAgentSwitch) {
          writeSparkCard(
            writer as unknown as { write: (part: unknown) => void },
            buildAgentSwitchCard({
              toAgentId: agentId,
              toAgentName: toConfig?.name,
              fromAgentId: previousAgentId,
              fromAgentName: fromConfig?.name,
              reason: routeReason,
            }),
          )
        }

        const textId = crypto.randomUUID()
        writer.write({ type: 'text-start', id: textId })

        // 传入完整对话历史，支持多轮对话
        const coreMessages = uiMessagesToCoreMessages(messages)
        const result = await agent.stream(coreMessages)

        for await (const chunk of result.textStream) {
          writer.write({
            type: 'text-delta',
            id: textId,
            delta: chunk,
          })
        }

        writer.write({ type: 'text-end', id: textId })
      },
      onError: error =>
        error instanceof Error ? error.message : 'Internal server error',
    })

    return createUIMessageStreamResponse({ stream })
  } catch (error: unknown) {
    console.error('[Chat Error]', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ error: message }, 500)
  }
}
