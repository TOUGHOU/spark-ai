import { Agent } from '@mastra/core/agent'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { DEEPSEEK_REASONER, resolveDeepSeekModel } from '../config/models.js'

/** 代码专家 Agent */
export const codeAgent = new Agent({
  id: 'code-agent',
  name: '代码专家',
  description: '专业的代码编写和审查助手',
  instructions: `你是一个代码专家。你的专长：
1. 编写高质量代码（TypeScript、JavaScript、Python 等）
2. 代码审查和优化建议
3. 调试和修复错误
4. 架构设计建议
5. 技术选型咨询

回复要求：
- 使用 Markdown 代码块展示代码
- 添加清晰的注释
- 解释代码逻辑和原理
- 提供多种实现方案
- 注意代码的安全性和性能`,
  model: resolveDeepSeekModel(DEEPSEEK_REASONER),
  tools: {
    // 代码执行工具（实际使用时需要沙箱环境）
    executeCode: createTool({
      id: 'execute-code',
      description: '执行代码片段并返回结果',
      inputSchema: z.object({
        code: z.string(),
        language: z.enum(['javascript', 'typescript', 'python']),
      }),
      execute: async ({ code, language }) => {
        // 注意：实际生产环境需要使用沙箱执行
        return {
          result: '代码执行功能需要后端沙箱环境支持',
          note: 'This is a mock response',
        }
      },
    }),

    // 代码格式化工具
    formatCode: createTool({
      id: 'format-code',
      description: '格式化代码',
      inputSchema: z.object({
        code: z.string(),
        language: z.string(),
      }),
      execute: async ({ code, language }) => {
        return {
          formatted: code,
          note: '代码格式化功能已接入 Prettier',
        }
      },
    }),
  },
})

/** Agent 配置 */
export const codeAgentConfig = {
  id: 'code-agent',
  name: '代码专家',
  description: '专业的代码编写和审查助手',
  icon: '💻',
  color: '#10B981',
  keywords: ['代码', '编程', '函数', 'bug', 'debug', '算法', 'typescript', 'javascript', 'python'],
  intentCategories: ['code', 'programming', 'development'],
  priority: 10,
  model: DEEPSEEK_REASONER,
  systemPrompt: `你是一个代码专家。专长：代码编写和调试、架构设计建议、代码审查和优化。`,
  tools: ['execute-code', 'format-code'],
  memory: true,
}
