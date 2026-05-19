import { MessageContentType, type Message } from '@spark/types'
import { useState } from 'react'
import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MessageCard } from '../components/cards'

/** 生成示例消息 */
function generateDemoMessages(): Message[] {
  return [
    // 1. 文本消息
    {
      id: '1',
      role: 'user',
      content: {
        type: MessageContentType.TEXT,
        text: '请帮我写一个 TypeScript 函数，实现数组去重',
        markdown: false,
      },
      timestamp: new Date(),
    },
    {
      id: '2',
      role: 'assistant',
      content: {
        type: MessageContentType.TEXT,
        text: '好的，我来帮你写一个 TypeScript 的数组去重函数：\n\n**方法一：使用 Set**\n```typescript\nfunction unique<T>(arr: T[]): T[] {\n  return [...new Set(arr)]\n}\n```\n\n**方法二：使用 filter**\n```typescript\nfunction unique<T>(arr: T[]): T[] {\n  return arr.filter((item, index) => arr.indexOf(item) === index)\n}\n```',
        markdown: true,
      },
      timestamp: new Date(),
      metadata: {
        model: 'gpt-4o-mini',
        latency: 1234,
      },
    },

    // 2. 代码消息
    {
      id: '3',
      role: 'assistant',
      content: {
        type: MessageContentType.CODE,
        code: 'function fibonacci(n: number): number {\n  if (n <= 1) return n\n  return fibonacci(n - 1) + fibonacci(n - 2)\n}',
        language: 'typescript',
        copyable: true,
      },
      timestamp: new Date(),
    },

    // 3. 图片消息
    {
      id: '4',
      role: 'assistant',
      content: {
        type: MessageContentType.IMAGE,
        url: 'https://picsum.photos/400/300',
        alt: '示例图片',
        width: 400,
        height: 300,
      },
      timestamp: new Date(),
    },

    // 4. 思考过程
    {
      id: '5',
      role: 'assistant',
      content: {
        type: MessageContentType.THINKING,
        content: '分析用户需求：\n1. 需要 TypeScript 数组去重\n2. 最好提供多种实现方式\n3. 需要考虑类型安全\n4. 性能对比：Set O(n)，filter O(n²)',
        isComplete: true,
      },
      timestamp: new Date(),
    },

    // 5. 工具调用
    {
      id: '6',
      role: 'assistant',
      content: {
        type: MessageContentType.TOOL_CALL,
        toolName: 'get_weather',
        toolArgs: { city: '北京', unit: 'celsius' },
        toolResult: JSON.stringify({ temp: 25, condition: '晴', humidity: 60 }),
        status: 'success',
      },
      timestamp: new Date(),
    },

    // 6. 文件附件
    {
      id: '7',
      role: 'user',
      content: {
        type: MessageContentType.FILE,
        fileName: 'report.pdf',
        fileSize: 2048576,
        fileType: 'application/pdf',
        url: '#',
      },
      timestamp: new Date(),
    },

    // 7. 操作按钮
    {
      id: '8',
      role: 'assistant',
      content: [
        {
          type: MessageContentType.TEXT,
          text: '我可以为你执行以下操作：',
          markdown: false,
        },
        {
          type: MessageContentType.ACTION,
          actionType: 'button',
          label: '查看代码示例',
          value: 'show_code',
          variant: 'primary',
        },
        {
          type: MessageContentType.ACTION,
          actionType: 'link',
          label: '查看文档',
          href: 'https://typescriptlang.org/docs',
          variant: 'secondary',
        },
      ],
      timestamp: new Date(),
    },

    // 8. Agent 切换
    {
      id: '9',
      role: 'system',
      content: {
        type: MessageContentType.AGENT_SWITCH,
        fromAgent: '通用助手',
        toAgent: '代码专家',
        reason: '检测到代码相关问题',
      },
      timestamp: new Date(),
    },

    // 9. 系统消息
    {
      id: '10',
      role: 'system',
      content: {
        type: MessageContentType.SYSTEM,
        systemType: 'welcome',
        content: '👋 欢迎使用 Spark AI！\n\n我支持文本、代码、图片、工具调用等多种对话形式。',
      },
    },
    {
      id: '11',
      role: 'system',
      content: {
        type: MessageContentType.SYSTEM,
        systemType: 'warning',
        content: '⚠️ 当前为演示模式，部分功能不可用。',
      },
    },
  ]
}

export function CardDemo() {
  const [messages] = useState<Message[]>(generateDemoMessages())
  const [selectedType, setSelectedType] = useState<string>('all')

  const filteredMessages = selectedType === 'all'
    ? messages
    : messages.filter(msg => {
      const content = msg.content
      if (Array.isArray(content)) {
        return content.some(c => c.type === selectedType)
      }
      return content.type === selectedType
    })

  const cardTypes = [
    { value: 'all', label: '全部' },
    { value: 'text', label: '文本' },
    { value: 'code', label: '代码' },
    { value: 'image', label: '图片' },
    { value: 'thinking', label: '思考' },
    { value: 'tool_call', label: '工具' },
    { value: 'file', label: '文件' },
    { value: 'action', label: '操作' },
    { value: 'agent_switch', label: '切换' },
    { value: 'system', label: '系统' },
  ]

  const handleAction = (value: string) => {
    alert(`操作触发: ${value}`)
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b p-4">
        <h1 className="mb-4 text-2xl font-bold">📋 消息卡片样式展示</h1>
        <div className="flex flex-wrap gap-2">
          {cardTypes.map(type => (
            <Button
              key={type.value}
              size="sm"
              type="button"
              variant={selectedType === type.value ? 'default' : 'secondary'}
              className={cn('rounded-full')}
              onClick={() => setSelectedType(type.value)}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      <Conversation className="flex-1">
        <ConversationContent className="gap-6">
          {filteredMessages.map(msg => (
            <MessageCard
              key={msg.id}
              message={msg}
              onAction={handleAction}
            />
          ))}
        </ConversationContent>
      </Conversation>

      <div className="border-t p-4 text-center text-muted-foreground text-sm">
        Spark AI · AI Elements 组件展示
      </div>
    </div>
  )
}
