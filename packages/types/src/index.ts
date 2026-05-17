// Re-export all types from submodules
export {
  MessageContentType,
  TextContentSchema,
  CodeContentSchema,
  ImageContentSchema,
  ToolCallContentSchema,
  ThinkingContentSchema,
  FileContentSchema,
  ActionContentSchema,
  AgentSwitchContentSchema,
  SystemContentSchema,
  MessageContentSchema,
  MessageRoleSchema,
  MessageMetadataSchema,
  MessageSchema,
  MessageCardConfigSchema,
  CardRendererMap,
  ChatInputSchema,
  ChatStreamInputSchema,
  StreamChunkSchema,
} from './message.js'
export type {
  TextContent,
  CodeContent,
  ImageContent,
  ToolCallContent,
  ThinkingContent,
  FileContent,
  ActionContent,
  AgentSwitchContent,
  SystemContent,
  MessageContent,
  MessageRole,
  Message,
  MessageCardConfig,
  CardRendererType,
  ChatInput,
  ChatStreamInput,
  CreateMessageOptions,
  StreamChunk,
} from './message.js'
export {
  AgentConfigSchema,
  AgentRouteSchema,
  AgentListResponseSchema,
  AgentSwitchRequestSchema,
  AgentChatRequestSchema,
} from './agent.js'
export type {
  AgentConfig,
  AgentRoute,
  AgentListResponse,
  AgentSwitchRequest,
  AgentChatRequest,
} from './agent.js'

// ============ User Types ============

import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
})

export type User = z.infer<typeof UserSchema>
