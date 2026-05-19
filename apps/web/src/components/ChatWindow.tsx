import { AlertCircle, Loader, Send, Square } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSparkChat } from '../hooks/useSparkChat'
import { getMessageText, uiMessageToSparkMessage } from '../lib/uiMessageAdapter'
import { selectCurrentThread, useChatStore } from '../stores/chatStore'
import { MessageCard } from './cards'

export function ChatWindow() {
  const [input, setInput] = useState('')
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

  const handleSend = () => {
    const text = input.trim()
    if (!text || isBusy) return

    sendMessage({ text })
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleAction = (value: string) => {
    console.log('Action triggered:', value)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Agent 标识栏 */}
      {agentId && agents.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-700 flex items-center gap-2">
          {(() => {
            const a = agents.find(a => a.id === agentId)
            if (!a) return null
            return (
              <>
                <span className="text-base">{a.icon}</span>
                <span className="text-sm font-medium text-gray-300">{a.name}</span>
                <span className="text-xs text-gray-500">·</span>
                <span className="text-xs text-gray-500">{a.description}</span>
              </>
            )
          })()}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            发送消息开始对话
          </div>
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
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <Loader size={18} className="animate-spin" />
            </div>
            <div className="bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-md">
              <span className="text-gray-400">正在思考...</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          <AlertCircle size={16} />
          <span className="flex-1">{error.message || '请求失败，请重试'}</span>
          <button
            type="button"
            onClick={() => regenerate()}
            className="rounded px-2 py-1 hover:bg-red-500/20 transition-colors"
          >
            重试
          </button>
        </div>
      )}

      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            rows={1}
            disabled={isBusy || !!error}
            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 text-white placeholder-gray-400 resize-none disabled:opacity-60"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          {isBusy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl transition-colors"
              title="停止生成"
            >
              <Square size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || !!error}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl transition-colors"
            >
              <Send size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
