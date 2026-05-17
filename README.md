# Spark AI ✨

AI 星火 - 基于 Mastra 的全栈 AI Agent 应用

## 技术栈

| 层级 | 技术 |
|------|------|
| **Monorepo** | pnpm workspaces + Turborepo |
| **前端** | Vite + React 18 + TypeScript |
| **状态管理** | Zustand |
| **数据校验** | Zod |
| **前后端通信** | tRPC |
| **后端** | Hono + `@mastra/hono` |
| **AI 框架** | Mastra + Vercel AI SDK |
| **UI** | Tailwind CSS + Lucide Icons |

## 项目结构

```
spark-ai/
├── apps/
│   ├── web/           # Vite + React 前端
│   └── server/        # Hono 后端
│
├── packages/
│   ├── types/         # 共享类型定义（Zod schemas）
│   └── config/        # 共享配置
│
├── pnpm-workspace.yaml
└── turbo.json
```

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（前后端同时启动）
pnpm dev

# 只启动前端
pnpm dev:web

# 只启动后端
pnpm dev:server

# 构建
pnpm build

# 类型检查
pnpm typecheck
```

## 端口

- 前端：http://localhost:5173
- 后端：http://localhost:3001

## TODO

- [ ] 集成 Mastra Agent
- [ ] 配置 tRPC 路由
- [ ] 实现流式响应
- [ ] 添加认证
- [ ] 数据库集成
