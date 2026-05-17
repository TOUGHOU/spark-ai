/**
 * @file models.ts
 * @description DeepSeek 模型配置（Mastra model router）
 */

/** 通用对话，成本低、速度快 */
export const DEEPSEEK_CHAT = 'deepseek/deepseek-chat'

/** 复杂推理（代码、数据分析等可选用） */
export const DEEPSEEK_REASONER = 'deepseek/deepseek-reasoner'

export type DeepSeekModelId = typeof DEEPSEEK_CHAT | typeof DEEPSEEK_REASONER

/** 显式传入 API Key，避免仅依赖 Mastra 读取 process.env 失败 */
export function resolveDeepSeekModel(modelId: DeepSeekModelId) {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim()
  if (!apiKey) {
    throw new Error(
      '未配置 DEEPSEEK_API_KEY。请在 apps/server/.env.local 中设置（可复制 .env.example）',
    )
  }

  return {
    id: modelId,
    url: 'https://api.deepseek.com',
    apiKey,
  }
}
