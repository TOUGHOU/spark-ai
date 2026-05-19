import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { Loader } from '@/components/ai-elements/loader'
import { Message, MessageContent } from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useSparkChat } from '../hooks/useSparkChat'
import { getMessageText, uiMessageToSparkMessage } from '../lib/uiMessageAdapter'
import { selectCurrentThread, useChatStore } from '../stores/chatStore'
import { MessageCard } from './cards'

export function ChatWindow() {
  const currentThread = useChatStore(selectCurrentThread)
  const updateThreadTitle = useChatStore(s => s.updateThreadTitle)
  const agents = useChatStore(s => s.agents)
  const threadId = currentThread?.id ?? null
  const agentId = currentThread?.agentId

  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
    regenerate,
  } = useSparkChat({ threadId, agentId })

  const isBusy = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    const firstUser = messages.find(m => m.role === 'user')
    if (!firstUser || !threadId || !currentThread) return
    if (currentThread.title !== '新对话') return

    const fullText = getMessageText(firstUser)
    const title = fullText.slice(0, 20)
    if (title) {
      updateThreadTitle(threadId, title + (fullText.length > 20 ? '...' : ''))
    }
  }, [messages, threadId, currentThread, updateThreadTitle])

  const handleSubmit = ({ text }: PromptInputMessage) => {
    const trimmed = text.trim()
    if (!trimmed || isBusy) return
    sendMessage({ text: trimmed })
  }

  const handleAction = (value: string) => {
    console.log('Action triggered:', value)
  }

  const activeAgent = agentId ? agents.find(a => a.id === agentId) : undefined

  return (
    <div className="flex h-full flex-col bg-background">
      {activeAgent && (
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <span className="text-base">{activeAgent.icon}</span>
          <span className="text-sm font-medium">{activeAgent.name}</span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-muted-foreground text-xs">
            {activeAgent.description}
          </span>
        </div>
      )}

      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              description="输入消息开始与 Spark AI 对话"
              title="暂无消息"
            />
          ) : (
            messages.map((uiMessage, index) => {
              const isStreamingAssistant =
                uiMessage.role === 'assistant' &&
                index === messages.length - 1 &&
                status === 'streaming'

              const sparkMessage = uiMessageToSparkMessage(uiMessage, {
                streaming: isStreamingAssistant,
                agentId,
              })

              return (
                <MessageCard
                  key={uiMessage.id}
                  message={sparkMessage}
                  onAction={handleAction}
                />
              )
            })
          )}

          {status === 'submitted' && (
            <Message from="assistant">
              <MessageContent>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader size={18} />
                  <span>正在思考...</span>
                </div>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {error && (
        <Alert className="mx-4 mb-2" variant="destructive">
          <AlertCircle />
          <AlertDescription className="flex items-center justify-between gap-2">
            <span>{error.message || '请求失败，请重试'}</span>
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() => regenerate()}
            >
              重试
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="border-t p-4">
        <PromptInput
          className="w-full"
          onSubmit={handleSubmit}
        >
          <PromptInputBody>
            <PromptInputTextarea
              disabled={!!error}
              placeholder="输入消息..."
            />
          </PromptInputBody>
          <PromptInputFooter>
            {isBusy ? (
              <PromptInputButton
                aria-label="停止生成"
                type="button"
                onClick={() => stop()}
              >
                停止
              </PromptInputButton>
            ) : (
              <PromptInputSubmit disabled={!!error} status={status} />
            )}
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}
