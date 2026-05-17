import { AgentRoute } from '@spark/types'
import { routerAgent } from '../agents/router-agent.js'
import type { AgentRegistry } from './agent-registry.js'

/** 智能路由服务 */
export class AgentRouter {
  constructor(private registry: AgentRegistry) { }

  /** 路由决策主函数 */
  async route(input: string, context?: any): Promise<AgentRoute> {
    // 1. 关键词匹配（快速路径，O(n)）
    const keywordMatch = this.registry.matchByKeyword(input)
    if (keywordMatch) {
      return {
        agentId: keywordMatch,
        confidence: 0.9,
        reason: 'keyword-match',
      }
    }

    // 2. LLM 意图识别（慢速路径）
    try {
      const intentResult = await this.detectIntent(input)
      const intentMatch = this.registry.matchByIntent(intentResult)
      if (intentMatch) {
        return {
          agentId: intentMatch,
          confidence: 0.8,
          reason: `intent: ${intentResult}`,
        }
      }
    } catch (err) {
      console.warn('Intent detection failed, falling back to default:', err)
    }

    // 3. 返回默认 Agent
    const defaultId = this.registry.getDefaultAgentId()
    return {
      agentId: defaultId,
      confidence: 0.5,
      reason: 'default-fallback',
    }
  }

  /** 使用 LLM 进行意图识别 */
  private async detectIntent(input: string): Promise<string> {
    const prompt = `分析以下用户输入的意图类别。

用户输入：${input}

可选类别：
- code: 代码相关（编程、调试、算法等）
- creative: 创意写作（文案、故事、营销等）
- data: 数据分析（SQL、统计、可视化等）
- general: 通用对话（闲聊、问答等）

只返回类别名称（小写），不要有任何其他输出：`

    const result = await routerAgent.generate(prompt)

    const intent = result.text.trim().toLowerCase()
    const validIntents = ['code', 'creative', 'data', 'general']

    return validIntents.includes(intent) ? intent : 'general'
  }

  /** 批量路由（用于历史消息分析） */
  async batchRoute(inputs: string[]): Promise<AgentRoute[]> {
    return Promise.all(inputs.map(input => this.route(input)))
  }
}

/** 创建路由服务实例 */
export function createAgentRouter(registry: AgentRegistry): AgentRouter {
  return new AgentRouter(registry)
}
