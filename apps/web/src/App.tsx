import { useState, useEffect } from 'react'
import { selectCurrentThread, useChatStore } from './stores/chatStore'
import { ChatWindow } from './components/ChatWindow'
import { Sidebar } from './components/Sidebar'
import { CardDemo } from './components/CardsDemo'

function App() {
  const currentThread = useChatStore(selectCurrentThread)
  const [showDemo, setShowDemo] = useState(false)

  // 按 Ctrl+D 打开演示页面
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        setShowDemo(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // 演示模式
  if (showDemo) {
    return (
      <div className="h-full">
        <button
          onClick={() => setShowDemo(false)}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
        >
          ← 返回聊天
        </button>
        <CardDemo />
      </div>
    )
  }

  return (
    <div className="flex h-full bg-gray-900 text-white">
      {/* 侧边栏 */}
      <Sidebar />
      
      {/* 主聊天区域 */}
      <main className="flex-1 flex flex-col">
        {currentThread ? (
          <ChatWindow />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">✨ Spark AI</h1>
              <p className="text-gray-400 mb-8">你的智能 AI 助手</p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => useChatStore.getState().createThread()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  开始新对话
                </button>
                <button 
                  onClick={() => setShowDemo(true)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  查看卡片样式
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4">按 Ctrl+D 快速切换演示模式</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
