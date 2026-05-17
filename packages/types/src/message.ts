import { z } from 'zod'

// ============ 消息内容类型（支持多种卡片）============

/** 消息内容类型 */
export enum MessageContentType {
  TEXT = 'text',
  CODE = 'code',
  IMAGE = 'image',
  TOOL_CALL = 'tool_call',
  THINKING = 'thinking',
  FILE = 'file',
  ACTION = 'action',
  AGENT_SWITCH = 'agent_switch',
  SYSTEM = 'system',
}

/** 文本消息 */
export const TextContentSchema = z.object({
  type: z.literal(MessageContentType.TEXT),
  text: z.string(),
  /** 可选：Markdown 格式 */
  markdown: z.boolean().optional().default(false),
})

/** 代码消息 */
export const CodeContentSchema = z.object({
  type: z.literal(MessageContentType.CODE),
  code: z.string(),
  language: z.string().optional().default('plaintext'),
  /** 代码是否可复制 */
  copyable: z.boolean().optional().default(true),
})

/** 图片消息 */
export const ImageContentSchema = z.object({
  type: z.literal(MessageContentType.IMAGE),
  url: z.string(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
})

/** 工具调用消息 */
export const ToolCallContentSchema = z.object({
  type: z.literal(MessageContentType.TOOL_CALL),
  toolName: z.string(),
  toolArgs: z.record(z.unknown()).optional(),
  toolResult: z.string().optional(),
  status: z.enum(['pending', 'success', 'error']).optional(),
})

/** 思考过程消息（AI 推理过程） */
export const ThinkingContentSchema = z.object({
  type: z.literal(MessageContentType.THINKING),
  /** 思考内容，支持 Markdown */
  content: z.string(),
  /** 思考是否完成 */
  isComplete: z.boolean().optional().default(false),
})

/** 文件附件消息 */
export const FileContentSchema = z.object({
  type: z.literal(MessageContentType.FILE),
  fileName: z.string(),
  fileSize: z.number().optional(),
  fileType: z.string().optional(),
  url: z.string().optional(),
  /** 本地 base64（上传时） */
  base64: z.string().optional(),
})

/** 操作按钮消息 */
export const ActionContentSchema = z.object({
  type: z.literal(MessageContentType.ACTION),
  actionType: z.enum(['button', 'link', 'input']),
  label: z.string(),
  value: z.string().optional(),
  href: z.string().optional(),
  /** 按钮样式 */
  variant: z.enum(['primary', 'secondary', 'danger', 'ghost']).optional(),
})

/** 代理切换消息（切换到另一个 Agent） */
export const AgentSwitchContentSchema = z.object({
  type: z.literal(MessageContentType.AGENT_SWITCH),
  fromAgent: z.string().optional(),
  toAgent: z.string(),
  reason: z.string().optional(),
})

/** 系统消息 */
export const SystemContentSchema = z.object({
  type: z.literal(MessageContentType.SYSTEM),
  /** 系统消息类型 */
  systemType: z.enum([
    'welcome',       // 欢迎消息
    'info',          // 普通提示
    'warning',       // 警告
    'error',         // 错误
    'context',       // 上下文变更
    'limit',         // 限制提示
  ]).optional(),
  content: z.string(),
})

// 内容联合类型（自动推导为 discriminated union）
export const MessageContentSchema = z.discriminatedUnion('type', [
  TextContentSchema,
  CodeContentSchema,
  ImageContentSchema,
  ToolCallContentSchema,
  ThinkingContentSchema,
  FileContentSchema,
  ActionContentSchema,
  AgentSwitchContentSchema,
  SystemContentSchema,
])

export type TextContent = z.infer<typeof TextContentSchema>
export type CodeContent = z.infer<typeof CodeContentSchema>
export type ImageContent = z.infer<typeof ImageContentSchema>
export type ToolCallContent = z.infer<typeof ToolCallContentSchema>
export type ThinkingContent = z.infer<typeof ThinkingContentSchema>
export type FileContent = z.infer<typeof FileContentSchema>
export type ActionContent = z.infer<typeof ActionContentSchema>
export type AgentSwitchContent = z.infer<typeof AgentSwitchContentSchema>
export type SystemContent = z.infer<typeof SystemContentSchema>
export type MessageContent = z.infer<typeof MessageContentSchema>

// ============ 基础消息结构 ============

export const MessageRoleSchema = z.enum(['user', 'assistant', 'system'])
export type MessageRole = z.infer<typeof MessageRoleSchema>

/** 消息元数据 */
export const MessageMetadataSchema = z.object({
  /** 是否正在流式传输 */
  streaming: z.boolean().optional(),
  /** 消息生成耗时（ms） */
  latency: z.number().optional(),
  /** 使用的模型 */
  model: z.string().optional(),
  /** Token 消耗 */
  tokens: z.object({
    prompt: z.number().optional(),
    completion: z.number().optional(),
    total: z.number().optional(),
  }).optional(),
  /** 当前 Agent ID */
  agentId: z.string().optional(),
  /** 反应/点赞 */
  reactions: z.record(z.number()).optional(),
})

export const MessageSchema = z.object({
  id: z.string(),
  role: MessageRoleSchema,
  /** 消息内容（支持多种卡片类型） */
  content: z.union([MessageContentSchema, z.array(MessageContentSchema)]),
  timestamp: z.date().or(z.string()).optional(),
  metadata: MessageMetadataSchema.optional(),
  /** 回复到哪条消息 */
  replyTo: z.string().optional(),
})

export type Message = z.infer<typeof MessageSchema>

// ============ 对话卡片展示配置 ============

/** 消息卡片的展示配置 */
export const MessageCardConfigSchema = z.object({
  /** 是否显示头像 */
  showAvatar: z.boolean().optional().default(true),
  /** 是否显示时间戳 */
  showTimestamp: z.boolean().optional().default(true),
  /** 是否显示元数据（模型、耗时等） */
  showMetadata: z.boolean().optional().default(false),
  /** 最大宽度（px） */
  maxWidth: z.number().optional().default(600),
  /** 动画效果 */
  animation: z.enum(['fade', 'slide', 'none']).optional().default('fade'),
})

export type MessageCardConfig = z.infer<typeof MessageCardConfigSchema>

// ============ 对话卡片渲染器映射 ============

/** 卡片类型到渲染器的映射（前端使用） */
export const CardRendererMap = {
  [MessageContentType.TEXT]: 'TextCard',
  [MessageContentType.CODE]: 'CodeCard',
  [MessageContentType.IMAGE]: 'ImageCard',
  [MessageContentType.TOOL_CALL]: 'ToolCallCard',
  [MessageContentType.THINKING]: 'ThinkingCard',
  [MessageContentType.FILE]: 'FileCard',
  [MessageContentType.ACTION]: 'ActionCard',
  [MessageContentType.AGENT_SWITCH]: 'AgentSwitchCard',
  [MessageContentType.SYSTEM]: 'SystemCard',
} as const

export type CardRendererType = keyof typeof CardRendererMap

// ============ 输入/输出 Schema ============

export const ChatInputSchema = z.object({
  text: z.string().min(1, '消息不能为空'),
  agentId: z.string().optional(),
  threadId: z.string().optional(),
  /** 附件列表 */
  attachments: z.array(FileContentSchema).optional(),
})

export type ChatInput = z.infer<typeof ChatInputSchema>

export const ChatStreamInputSchema = ChatInputSchema.extend({
  /** 是否返回思考过程 */
  includeThinking: z.boolean().optional().default(false),
})

export type ChatStreamInput = z.infer<typeof ChatStreamInputSchema>

// ============ 辅助类型 ============

/** 创建消息的快捷类型 */
export type CreateMessageOptions = Omit<Message, 'id' | 'timestamp'> & {
  id?: string
  timestamp?: Date | string
}

/** 流式消息块 */
export const StreamChunkSchema = z.object({
  type: z.enum(['content', 'thinking', 'tool_call', 'done', 'error']),
  content: z.string().optional(),
  toolName: z.string().optional(),
  toolArgs: z.unknown().optional(),
  error: z.string().optional(),
})

export type StreamChunk = z.infer<typeof StreamChunkSchema>
