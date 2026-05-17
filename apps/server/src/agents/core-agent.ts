import { Agent } from '@mastra/core/agent'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { DEEPSEEK_CHAT, resolveDeepSeekModel } from '../config/models.js'

/** 通用助手 Agent */
export const coreAgent = new Agent({
  id: 'core-agent',
  name: '通用助手',
  description: '通用 AI 助手，可以回答各种问题',
  instructions: `你是一个通用 AI 助手。你的职责：
- 回答用户的各种问题
- 提供准确、有帮助的信息
- 保持友好、专业的态度
- 如果问题超出了你的能力范围，建议用户切换到合适的专业 Agent

你可以通过工具调用来获取实时信息或执行特定任务。`,
  model: resolveDeepSeekModel(DEEPSEEK_CHAT),
  tools: {
    // 示例工具：获取当前时间
    getCurrentTime: createTool({
      id: 'get-current-time',
      description: '获取当前时间',
      inputSchema: z.object({
        locale: z
          .string()
          .optional()
          .describe('显示语言区域，例如 zh-CN'),
      }),
      outputSchema: z.object({
        time: z.string(),
        timezone: z.string(),
      }),
      execute: async ({ locale }) => {
        const now = new Date()
        return {
          time: now.toLocaleString(locale ?? 'zh-CN'),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      },
    }),
  },
})

/** Agent 配置 */
export const coreAgentConfig = {
  id: 'core-agent',
  name: '通用助手',
  description: '通用 AI 助手，可以回答各种问题',
  icon: '🤖',
  color: '#3B82F6',
  keywords: ['你好', '帮助', '什么是', '怎么', '为什么'],
  priority: 0,
  isDefault: true,
  model: DEEPSEEK_CHAT,
  systemPrompt: `你是一个通用 AI 助手。保持友好、专业的态度。`,
  tools: ['get-current-time'],
  memory: true,
}
