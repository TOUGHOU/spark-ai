/**
 * @file useSparkChat.ts
 * @description 基于 @ai-sdk/react 的 Spark 聊天 Hook
 */

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useMemo } from 'react'

interface UseSparkChatOptions {
  threadId: string | null
  agentId?: string
}

export function useSparkChat({ threadId, agentId }: UseSparkChatOptions) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        prepareSendMessagesRequest: ({ id, messages, body }) => ({
          body: {
            ...body,
            id: id ?? threadId ?? undefined,
            threadId: id ?? threadId ?? undefined,
            messages,
            agentId,
          },
        }),
      }),
    [threadId, agentId],
  )

  return useChat({
    id: threadId ?? undefined,
    transport,
  })
}
