import { create } from 'zustand'
import type { Message, MessageContent, MessageContentSchema } from '@spark/types'

export interface Thread {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  agentId?: string
}

interface ChatState {
  threads: Thread[]
  currentThreadId: string | null

  // Actions
  createThread: (agentId?: string) => void
  selectThread: (id: string) => void
  addMessage: (content: MessageContent, role: 'user' | 'assistant' | 'system') => void
  updateMessage: (threadId: string, messageId: string, content: Partial<Message>) => void
  updateThreadTitle: (id: string, title: string) => void
  clearThread: (id: string) => void
  deleteThread: (id: string) => void
}

/** 当前选中的会话（须用 selector 订阅，勿从 store 解构 getter） */
export const selectCurrentThread = (state: ChatState): Thread | null =>
  state.threads.find(t => t.id === state.currentThreadId) ?? null

export const useChatStore = create<ChatState>((set, get) => ({
  threads: [],
  currentThreadId: null,

  createThread: (agentId) => {
    const newThread: Thread = {
      id: crypto.randomUUID(),
      title: '新对话',
      messages: [],
      createdAt: new Date(),
      agentId,
    }
    set(state => ({
      threads: [newThread, ...state.threads],
      currentThreadId: newThread.id,
    }))
  },
  
  selectThread: (id) => {
    set({ currentThreadId: id })
  },
  
  addMessage: (content, role) => {
    const { currentThreadId, threads } = get()
    if (!currentThreadId) return
    
    const newMessage: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
    }
    
    set({
      threads: threads.map(t => 
        t.id === currentThreadId 
          ? { 
              ...t, 
              messages: [...t.messages, newMessage],
              // 如果是第一条消息，用内容的前20个字符作为标题
              title: t.messages.length === 0 && role === 'user' 
                ? String(content).slice(0, 20) + (String(content).length > 20 ? '...' : '')
                : t.title
            }
          : t
      ),
    })
  },
  
  updateMessage: (threadId, messageId, updates) => {
    set(state => ({
      threads: state.threads.map(t => 
        t.id === threadId 
          ? { 
              ...t, 
              messages: t.messages.map(m => 
                m.id === messageId ? { ...m, ...updates } : m
              )
            }
          : t
      ),
    }))
  },
  
  updateThreadTitle: (id, title) => {
    set(state => ({
      threads: state.threads.map(t => 
        t.id === id ? { ...t, title } : t
      ),
    }))
  },
  
  clearThread: (id) => {
    set(state => ({
      threads: state.threads.map(t => 
        t.id === id ? { ...t, messages: [] } : t
      ),
    }))
  },
  
  deleteThread: (id) => {
    set(state => ({
      threads: state.threads.filter(t => t.id !== id),
      currentThreadId: state.currentThreadId === id 
        ? (state.threads[0]?.id || null) 
        : state.currentThreadId,
    }))
  },
}))
