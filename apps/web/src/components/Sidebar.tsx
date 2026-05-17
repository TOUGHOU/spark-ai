import { useChatStore } from '../stores/chatStore'
import { Plus, MessageSquare, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function Sidebar() {
  const { threads, currentThreadId, selectThread, createThread, deleteThread } = useChatStore()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

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

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={() => createThread()}
          className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>新对话</span>
        </button>
      </div>
      
      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {threads.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            暂无对话记录
          </div>
        ) : (
          threads.map(thread => (
            <div
              key={thread.id}
              className="relative"
              onMouseEnter={() => setHoveredId(thread.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <button
                onClick={() => selectThread(thread.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                  thread.id === currentThreadId
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <MessageSquare size={16} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate">{thread.title}</p>
                  <p className="text-xs text-gray-500">{formatTime(thread.createdAt)}</p>
                </div>
              </button>
              
              {/* 删除按钮 */}
              {hoveredId === thread.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteThread(thread.id)
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-red-600/50 rounded transition-colors"
                  title="删除对话"
                >
                  <Trash2 size={14} className="text-gray-400 hover:text-white" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* 底部 */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
        Spark AI v0.1.0
      </div>
    </aside>
  )
}
