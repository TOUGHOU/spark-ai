import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

// 导入 Mastra 实例和 Agent 注册中心
import { mastra } from './mastra/index.js'
import { agentRegistry } from './registry/agent-registry.js'
import { createAgentRouter } from './registry/agent-router.js'
import { handleChatRequest } from './routes/chat.route.js'
import {
  handleDouyinDownload,
  handleDouyinParse,
} from './routes/douyin.route.js'

const app = new Hono()

// 中间件
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// 健康检查
app.get('/', c => c.json({ 
  name: 'Spark AI Server',
  version: '0.1.0',
  status: 'ok',
  agents: agentRegistry.listAgents().map(a => a.id),
}))

// 获取所有 Agent
app.get('/api/agents', c => {
  const agents = agentRegistry.listAgents()
  const defaultId = agentRegistry.getDefaultAgentId()
  
  return c.json({
    agents: agents.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      color: a.color,
    })),
    defaultAgentId: defaultId,
  })
})

// 抖音视频解析与下载
app.post('/api/douyin/parse', handleDouyinParse)
app.post('/api/douyin/download', handleDouyinDownload)

// 对话接口（AI SDK 流式，供 @ai-sdk/react useChat 使用）
app.post('/api/chat', handleChatRequest)

// 流式对话接口
app.post('/api/chat/stream', async (c) => {
  try {
    const body = await c.req.json()
    const { message, threadId, agentId: forcedAgentId } = body
    
    if (!message) {
      return c.json({ error: 'Message is required' }, 400)
    }
    
    // 1. 决定 Agent
    let agentId = forcedAgentId
    if (!agentId) {
      const agentRouter = createAgentRouter(agentRegistry)
      const route = await agentRouter.route(message)
      agentId = route.agentId
    }
    
    // 2. 获取 Agent
    const agent = mastra.getAgentById(agentId)
    if (!agent) {
      return c.json({ error: `Agent not found: ${agentId}` }, 404)
    }
    
    // 3. 流式生成
    console.log(`[Stream] Using agent: ${agentId}`)
    
    // 支持多轮对话：构建 CoreMessage[]
    const coreMessages = body.messages
      ? body.messages.map((msg: any) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.parts
            ?.filter((p: any) => p.type === 'text')
            .map((p: any) => p.text)
            .join('') ?? msg.content ?? '',
        }))
      : [{ role: 'user' as const, content: message }]
    
    const stream = await agent.stream(coreMessages, {
      threadId: threadId || crypto.randomUUID(),
    })
    
    // 4. 返回流式响应
    // 注意：实际生产环境需要使用正确的 SSE 格式
    const textStream = stream.textStream
    
    return new Response(textStream as any, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
    
  } catch (error: any) {
    console.error('[Stream Error]', error)
    return c.json({
      success: false,
      error: error.message || 'Internal server error',
    }, 500)
  }
})

// 启动服务器
if (!process.env.DEEPSEEK_API_KEY) {
  console.warn('⚠️  DEEPSEEK_API_KEY 未设置，请在 apps/server/.env.local 中配置')
}

const port = Number(process.env.PORT) || 3001
console.log(`🚀 Server running at http://localhost:${port}`)
console.log(`📋 Available agents: ${agentRegistry.listAgents().map(a => a.id).join(', ')}`)

serve({
  fetch: app.fetch,
  port,
})
