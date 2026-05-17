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

function extractTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map(part => part.text)
    .join('')
}

export async function handleChatRequest(c: Context) {
  try {
    const body = await c.req.json()
    const {
      messages,
      id: chatId,
      threadId,
      agentId: forcedAgentId,
    } = body as {
      messages?: UIMessage[]
      id?: string
      threadId?: string
      agentId?: string
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
    if (!agentId) {
      const agentRouter = createAgentRouter(agentRegistry)
      const route = await agentRouter.route(messageText)
      agentId = route.agentId
    }

    const agent = agentRegistry.getMastraAgent(agentId)
    if (!agent) {
      return c.json({ error: `Agent not found: ${agentId}` }, 404)
    }

    const resolvedThreadId = threadId || chatId || crypto.randomUUID()

    console.log(`[Chat] agent=${agentId} thread=${resolvedThreadId}`)
    console.log(`[Chat] message=${messageText.slice(0, 120)}`)

    const stream = createUIMessageStream({
      originalMessages: messages,
      execute: async ({ writer }) => {
        const textId = crypto.randomUUID()

        writer.write({ type: 'text-start', id: textId })

        const result = await agent.stream(messageText)

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
