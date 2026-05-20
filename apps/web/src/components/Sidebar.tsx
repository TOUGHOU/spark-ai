import { useChatStore } from '../stores/chatStore'
import { Plus, MessageSquare, Trash2, Bot, Video } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type AppView = 'chat' | 'demo' | 'douyin'

interface SidebarProps {
  activeView?: AppView
  onNavigate?: (view: AppView) => void
}

export function Sidebar({ activeView = 'chat', onNavigate }: SidebarProps) {
  const {
    threads,
    currentThreadId,
    selectThread,
    createThread,
    deleteThread,
    agents,
    defaultAgentId,
  } = useChatStore()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [agentSectionOpen, setAgentSectionOpen] = useState(true)

  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => {
        if (data.agents && data.defaultAgentId) {
          useChatStore.getState().setAgents(data.agents, data.defaultAgentId)
        }
      })
      .catch(() => {})
  }, [])

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN')
  }

  const handleNewThread = (agentId?: string) => {
    createThread(agentId || defaultAgentId || undefined)
  }

  return (
    <aside className="flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="space-y-2 border-b border-sidebar-border p-4">
        <Button className="w-full gap-2" type="button" onClick={() => handleNewThread()}>
          <Plus className="size-4" />
          新对话
        </Button>
        <Button
          className={cn(
            'w-full gap-2',
            activeView === 'douyin' && 'bg-sidebar-accent text-sidebar-accent-foreground',
          )}
          type="button"
          variant="ghost"
          onClick={() => onNavigate?.('douyin')}
        >
          <Video className="size-4" />
          抖音下载
        </Button>
      </div>

      {agents.length > 0 && (
        <div className="border-b border-sidebar-border">
          <button
            type="button"
            onClick={() => setAgentSectionOpen(!agentSectionOpen)}
            className="flex w-full items-center justify-between px-4 py-2 text-muted-foreground text-xs transition-colors hover:text-foreground"
          >
            <span className="flex items-center gap-1">
              <Bot className="size-3.5" /> 智能体
            </span>
            <span>{agentSectionOpen ? '▾' : '▸'}</span>
          </button>
          {agentSectionOpen && (
            <div className="space-y-1 px-2 pb-2">
              {agents.map(agent => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => handleNewThread(agent.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <span className="text-base">{agent.icon}</span>
                  <p className="min-w-0 flex-1 truncate text-xs font-medium">
                    {agent.name}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {threads.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground text-sm">
            暂无对话记录
          </p>
        ) : (
          threads.map(thread => {
            const threadAgent = agents.find(a => a.id === thread.agentId)
            const isActive = thread.id === currentThreadId

            return (
              <div
                key={thread.id}
                className="relative"
                onMouseEnter={() => setHoveredId(thread.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <button
                  type="button"
                  onClick={() => {
                    onNavigate?.('chat')
                    selectThread(thread.id)
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                  )}
                >
                  <MessageSquare className="size-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{thread.title}</p>
                    <p className="flex items-center gap-1 text-muted-foreground text-xs">
                      {threadAgent && <span>{threadAgent.icon}</span>}
                      <span>{formatTime(thread.createdAt)}</span>
                    </p>
                  </div>
                </button>

                {hoveredId === thread.id && (
                  <Button
                    className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                    title="删除对话"
                    onClick={e => {
                      e.stopPropagation()
                      deleteThread(thread.id)
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="border-t border-sidebar-border p-2 flex items-center justify-center gap-2">
        <ThemeToggle />
        <p className="text-muted-foreground text-xs">Spark AI v0.1.0</p>
      </div>
    </aside>
  )
}
