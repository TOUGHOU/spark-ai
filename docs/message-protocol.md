# Spark AI - 消息协议设计

## 概述

设计了灵活可扩展的消息协议，支持多种对话卡片类型，采用 Zod 进行类型校验和自动推导。

## 消息结构

```
Message
├── id: string                    # 消息唯一 ID
├── role: user | assistant | system
├── content: MessageContent       # 消息内容（支持多种类型）
├── timestamp?: Date | string     # 时间戳
├── metadata?: MessageMetadata    # 元数据（模型、耗时等）
└── replyTo?: string              # 回复的消息 ID
```

## 支持的消息卡片类型

| 类型 | 说明 | 组件 |
|------|------|------|
| `text` | 文本消息，支持 Markdown | TextCard |
| `code` | 代码块，带语法高亮和复制 | CodeCard |
| `image` | 图片，支持懒加载 | ImageCard |
| `tool_call` | 工具调用，显示参数和结果 | ToolCallCard |
| `thinking` | AI 思考过程，可折叠 | ThinkingCard |
| `file` | 文件附件，支持下载 | FileCard |
| `action` | 按钮/链接交互 | ActionCard |
| `agent_switch` | Agent 切换提示 | AgentSwitchCard |
| `system` | 系统消息（欢迎、警告等） | SystemCard |

## 使用示例

### 发送文本消息
```ts
addMessage({
  type: 'text',
  text: '你好，这是一条消息',
  markdown: true,  // 启用 Markdown 渲染
}, 'user')
```

### 发送代码消息
```ts
addMessage({
  type: 'code',
  code: 'const hello = "world"',
  language: 'typescript',
  copyable: true,
}, 'assistant')
```

### 发送思考过程
```ts
addMessage({
  type: 'thinking',
  content: '让我思考一下这个问题...',
  isComplete: false,
}, 'assistant')

// 思考完成
updateMessage(threadId, messageId, {
  content: {
    type: 'thinking',
    content: '思考完成',
    isComplete: true,
  }
})
```

### 发送工具调用
```ts
addMessage({
  type: 'tool_call',
  toolName: 'get_weather',
  toolArgs: { city: '北京' },
  status: 'pending',
}, 'assistant')

// 工具返回结果
updateMessage(threadId, messageId, {
  content: {
    type: 'tool_call',
    toolName: 'get_weather',
    toolArgs: { city: '北京' },
    toolResult: '北京今天晴，25°C',
    status: 'success',
  }
})
```

### 发送系统消息
```ts
addMessage({
  type: 'system',
  systemType: 'welcome',
  content: '欢迎使用 Spark AI！',
}, 'system')
```

### 组合多种卡片
```ts
// 一条消息包含多个内容块
addMessage([
  {
    type: 'thinking',
    content: '思考中...',
  },
  {
    type: 'text',
    text: '这是回复内容',
  },
  {
    type: 'code',
    code: 'console.log("hello")',
    language: 'javascript',
  }
], 'assistant')
```

## 前端渲染

```tsx
import { MessageCard } from './components/cards'

// 自动根据 content.type 渲染对应卡片
messages.map(msg => (
  <MessageCard 
    key={msg.id} 
    message={msg}
    onAction={(value) => handleAction(value)}
  />
))
```

## 消息元数据

```ts
{
  streaming: true,           // 是否正在流式传输
  latency: 1234,            // 生成耗时（ms）
  model: 'gpt-4o-mini',     // 使用的模型
  tokens: {
    prompt: 100,
    completion: 200,
    total: 300,
  },
  agentId: 'core-agent',    // 当前 Agent ID
  reactions: {               // 点赞/反应
    '👍': 5,
    '👎': 1,
  }
}
```

## 扩展新卡片类型

1. 在 `packages/types/src/message.ts` 添加新的 Schema：
```ts
export const NewCardSchema = z.object({
  type: z.literal('new_type'),
  // 新卡片字段...
})

export type NewCard = z.infer<typeof NewCardSchema>
```

2. 更新 `MessageContentSchema` 的 discriminated union：
```ts
export const MessageContentSchema = z.discriminatedUnion('type', [
  // ...existing types
  NewCardSchema,
])
```

3. 创建对应的卡片组件：
```tsx
// src/components/cards/NewCard.tsx
export function NewCard({ content }: { content: NewCard }) {
  // 实现卡片渲染
}
```

4. 更新 `MessageCard.tsx` 的 switch 语句：
```ts
case 'new_type':
  return <NewCard content={content} />
```
