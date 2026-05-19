import { Agent } from '@mastra/core/agent'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { DEEPSEEK_REASONER, resolveDeepSeekModel } from '../config/models.js'

/** 数据分析 Agent */
export const dataAgent = new Agent({
  id: 'data-agent',
  name: '数据分析师',
  description: '数据分析和可视化助手',
  instructions: `你是一个数据分析师。你的专长：
1. 数据分析和统计
2. SQL 查询编写
3. 数据可视化建议
4. 业务指标解读
5. 数据报告生成

回复要求：
- 使用表格展示数据
- 提供 SQL 查询语句
- 给出可视化图表建议
- 解释数据背后的含义`,
  model: DEEPSEEK_REASONER,
  tools: {
    // SQL 查询生成工具
    generateSQL: createTool({
      id: 'generate-sql',
      description: '根据自然语言生成 SQL 查询',
      inputSchema: z.object({
        query: z.string().describe('自然语言查询'),
        dialect: z.enum(['mysql', 'postgresql', 'sqlite', 'sqlserver']).default('postgresql'),
        schema: z.string().optional().describe('数据库 schema 描述'),
      }),
      execute: async ({ query, dialect, schema }) => {
        // 实际实现时调用 LLM 生成 SQL
        return {
          sql: `SELECT * FROM users WHERE ...`,  // 生成的 SQL
          explanation: '查询所有符合条件的用户',
          dialect,
        }
      },
    }),

    // 数据分析工具
    analyzeData: createTool({
      id: 'analyze-data',
      description: '分析数据集并返回统计结果',
      inputSchema: z.object({
        data: z.array(z.record(z.unknown())).describe('数据数组'),
        metrics: z.array(z.string()).default(['mean', 'median', 'std']),
      }),
      execute: async ({ data, metrics }) => {
        // 简化的统计分析
        return {
          rowCount: data.length,
          metrics: {
            mean: '计算中...',
            median: '计算中...',
          },
          insights: ['数据分布较均匀', '存在异常值'],
        }
      },
    }),
  },
})

/** Agent 配置 */
export const dataAgentConfig = {
  id: 'data-agent',
  name: '数据分析师',
  description: '数据分析和可视化助手',
  icon: '📊',
  color: '#8B5CF6',
  keywords: ['数据', '分析', 'SQL', '统计', '图表', '可视化', '指标'],
  intentCategories: ['data', 'analytics', 'sql'],
  priority: 8,
  model: DEEPSEEK_REASONER,
  systemPrompt: `你是一个数据分析师。专长：数据分析和统计、SQL 查询编写、数据可视化建议。`,
  tools: ['generate-sql', 'analyze-data'],
  memory: true,
}
