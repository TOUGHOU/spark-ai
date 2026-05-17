import { Agent } from '@mastra/core/agent'
import { z } from 'zod'
import { DEEPSEEK_CHAT, resolveDeepSeekModel } from '../config/models.js'

/** 意图分类 Agent（轻量级，用于路由决策） */
export const routerAgent = new Agent({
  id: 'router-agent',
  name: '路由助手',
  instructions: `你是一个意图分类器。你的任务是分析用户的输入，判断其意图类别。

可选类别：
- code (代码相关)
- creative (创意写作)
- data (数据分析)
- general (通用对话)

只返回类别名称，不要有任何其他输出。`,
  model: resolveDeepSeekModel(DEEPSEEK_CHAT),
  tools: {},
})
