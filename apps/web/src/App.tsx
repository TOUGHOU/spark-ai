import { useState, useEffect } from 'react'
import { selectCurrentThread, useChatStore } from './stores/chatStore'
import { ChatWindow } from './components/ChatWindow'
import { Sidebar } from './components/Sidebar'
import { CardDemo } from './components/CardsDemo'
import { Button } from '@/components/ui/button'

function App() {
  const currentThread = useChatStore(selectCurrentThread)
  const [showDemo, setShowDemo] = useState(false)

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

  if (showDemo) {
    return (
      <div className="h-full bg-background text-foreground">
        <Button
          className="fixed top-4 right-4 z-50"
          type="button"
          variant="secondary"
          onClick={() => setShowDemo(false)}
        >
          ← 返回聊天
        </Button>
        <CardDemo />
      </div>
    )
  }

  return (
    <div className="flex h-full bg-background text-foreground">
      <Sidebar />
      <main className="flex flex-1 flex-col">
        {currentThread ? (
          <ChatWindow />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
            <h1 className="text-4xl font-bold">✨ Spark AI</h1>
            <p className="text-muted-foreground">你的智能 AI 助手</p>
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => useChatStore.getState().createThread()}
              >
                开始新对话
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDemo(true)}
              >
                查看卡片样式
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              按 Ctrl+D 快速切换演示模式
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
