import { z } from 'zod'

/** Agent 配置定义 */
export const AgentConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  
  // 展示
  icon: z.string().optional(),
  color: z.string().optional(),
  
  // 路由规则
  keywords: z.array(z.string()).optional(),
  intentCategories: z.array(z.string()).optional(),
  priority: z.number().default(0),
  
  // Agent 配置
  model: z.string().default('deepseek/deepseek-chat'),
  systemPrompt: z.string(),
  tools: z.array(z.string()).optional(),
  memory: z.boolean().default(true),
  
  // 访问控制
  isDefault: z.boolean().default(false),
  maxTokens: z.number().optional(),
})

export type AgentConfig = z.infer<typeof AgentConfigSchema>

/** Agent 路由决策 */
export const AgentRouteSchema = z.object({
  agentId: z.string(),
  confidence: z.number().min(0).max(1).optional(),
  reason: z.string().optional(),
})

export type AgentRoute = z.infer<typeof AgentRouteSchema>

/** Agent 列表响应 */
export const AgentListResponseSchema = z.object({
  agents: z.array(AgentConfigSchema),
  defaultAgentId: z.string(),
})

export type AgentListResponse = z.infer<typeof AgentListResponseSchema>

/** Agent 切换请求 */
export const AgentSwitchRequestSchema = z.object({
  threadId: z.string(),
  agentId: z.string(),
  reason: z.string().optional(),
})

export type AgentSwitchRequest = z.infer<typeof AgentSwitchRequestSchema>

/** Agent 对话请求 */
export const AgentChatRequestSchema = z.object({
  message: z.string().min(1),
  threadId: z.string().optional(),
  agentId: z.string().optional(),
  stream: z.boolean().default(true),
})

export type AgentChatRequest = z.infer<typeof AgentChatRequestSchema>
