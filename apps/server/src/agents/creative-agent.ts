import { Agent } from '@mastra/core/agent'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { DEEPSEEK_CHAT, resolveDeepSeekModel } from '../config/models.js'

/** 创意助手 Agent */
export const creativeAgent = new Agent({
  id: 'creative-agent',
  name: '创意助手',
  description: '文案创作、故事编写、营销创意',
  instructions: `你是一个创意写作助手。你的专长：
1. 文案创作（广告语、公众号文章、社交媒体文案）
2. 故事编写（小说、剧本、儿童故事）
3. 营销创意（活动策划、品牌文案）
4. 头脑风暴（产品命名、功能创意）

回复要求：
- 保持创意和灵感
- 提供多样化的想法
- 激发用户的创造力
- 使用生动、有趣的语言`,
  model: resolveDeepSeekModel(DEEPSEEK_CHAT),
  tools: {
    // 创意扩展工具
    expandIdea: createTool({
      id: 'expand-idea',
      description: '扩展一个创意想法，生成多个变体',
      inputSchema: z.object({
        idea: z.string(),
        count: z.number().default(5),
      }),
      execute: async ({ idea, count }) => {
        // 实际实现时调用 LLM 生成
        return {
          original: idea,
          variations: [
            `创意变体 1 关于 ${idea}`,
            `创意变体 2 关于 ${idea}`,
            // ...
          ].slice(0, count),
        }
      },
    }),

    // 文案润色工具
    polishCopy: createTool({
      id: 'polish-copy',
      description: '润色文案，提升表达效果',
      inputSchema: z.object({
        copy: z.string(),
        style: z
          .enum(['professional', 'casual', 'humorous', 'emotional'])
          .default('professional'),
      }),
      execute: async ({ copy, style }) => {
        return {
          original: copy,
          polished: `【${style} 风格润色】\n\n${copy}`,
          suggestions: ['建议使用更生动的动词', '可以增加情感共鸣'],
        }
      },
    }),
  },
})

/** Agent 配置 */
export const creativeAgentConfig = {
  id: 'creative-agent',
  name: '创意助手',
  description: '文案创作、故事编写、营销创意',
  icon: '✨',
  color: '#F59E0B',
  keywords: ['创意', '文案', '故事', '写作', '广告', '营销', '策划'],
  intentCategories: ['creative', 'writing', 'marketing'],
  priority: 5,
  model: resolveDeepSeekModel(DEEPSEEK_CHAT),
  systemPrompt: `你是一个创意写作助手。专长：文案创作、故事编写、营销创意、头脑风暴。`,
  tools: ['expand-idea', 'polish-copy'],
  memory: true,
}
