import { Mastra } from '@mastra/core'
import { createLogger } from '@mastra/core/logger'
import { InMemoryStore } from '@mastra/core/storage'

// 导入 Agents
import { codeAgent } from '../agents/code-agent.js'
import { coreAgent } from '../agents/core-agent.js'
import { creativeAgent } from '../agents/creative-agent.js'
import { dataAgent } from '../agents/data-agent.js'
import { routerAgent } from '../agents/router-agent.js'

// 导入 Agent 配置
import { codeAgentConfig } from '../agents/code-agent.js'
import { coreAgentConfig } from '../agents/core-agent.js'
import { creativeAgentConfig } from '../agents/creative-agent.js'
import { dataAgentConfig } from '../agents/data-agent.js'

// 导入注册中心
import { agentRegistry } from '../registry/agent-registry.js'

// 注册所有 Agent 配置
agentRegistry
  .register({ ...coreAgentConfig, isDefault: true })
  .register({ ...codeAgentConfig, isDefault: false })
  .register({ ...creativeAgentConfig, isDefault: false })
  .register({ ...dataAgentConfig, isDefault: false })

// 注册所有 Mastra Agent 实例
agentRegistry
  .registerMastraAgent('core-agent', coreAgent)
  .registerMastraAgent('code-agent', codeAgent)
  .registerMastraAgent('creative-agent', creativeAgent)
  .registerMastraAgent('data-agent', dataAgent)
  .registerMastraAgent('router-agent', routerAgent)

export const mastra = new Mastra({
  agents: {
    coreAgent,
    codeAgent,
    creativeAgent,
    dataAgent,
    routerAgent,
  },

  // 日志配置
  logger: createLogger({
    name: 'Spark AI',
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  }),

  // 存储配置（默认内存存储，生产环境可换 LibSQLStore / PostgresStore 等）
  storage: new InMemoryStore(),
})

export default mastra
