import { Agent } from '@mastra/core/agent'
import type { AgentConfig } from '@spark/types'

/** Agent 注册中心 */
export class AgentRegistry {
  private agents: Map<string, AgentConfig> = new Map()
  private mastraAgents: Map<string, Agent> = new Map()

  /** 注册 Agent 配置 */
  register(config: AgentConfig): this {
    this.agents.set(config.id, config)
    return this
  }

  /** 注册 Mastra Agent 实例 */
  registerMastraAgent(id: string, agent: Agent): this {
    this.mastraAgents.set(id, agent)
    return this
  }

  /** 获取所有 Agent 配置 */
  listAgents(): AgentConfig[] {
    return Array.from(this.agents.values())
  }

  /** 根据 ID 获取 Agent 配置 */
  getConfig(id: string): AgentConfig | undefined {
    return this.agents.get(id)
  }

  /** 获取 Mastra Agent 实例 */
  getMastraAgent(id: string): Agent | undefined {
    return this.mastraAgents.get(id)
  }

  /** 获取默认 Agent ID */
  getDefaultAgentId(): string {
    for (const [id, config] of this.agents) {
      if (config.isDefault) return id
    }
    // 返回第一个
    const first = this.agents.keys().next()
    return first.value || 'core-agent'
  }

  /** 根据关键词匹配 Agent */
  matchByKeyword(input: string): string | null {
    for (const [id, config] of this.agents) {
      if (config.keywords?.some(kw => input.toLowerCase().includes(kw.toLowerCase()))) {
        return id
      }
    }
    return null
  }

  /** 根据意图分类匹配 Agent */
  matchByIntent(intent: string): string | null {
    for (const [id, config] of this.agents) {
      if (config.intentCategories?.includes(intent)) {
        return id
      }
    }
    return null
  }
}

/** 全局注册中心实例 */
export const agentRegistry = new AgentRegistry()
