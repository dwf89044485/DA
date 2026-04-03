# WeData AI Demo — 项目规范

## 项目定位

这是一个 **AI 对话功能演示项目**。目标是构建一个完整的 Agent 对话界面 demo，
用于向他人演示 AI 对话过程、任务拆解执行、工具调用等交互体验。

**不是**组件展示站，**不是**文档站。
是一个有完整叙事流程的产品级 demo。

---

## 技术栈（锁定，不得随意替换）

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16（App Router） |
| 语言 | TypeScript，严格模式 |
| 样式 | Tailwind CSS v4 + inline style（Design DNA token） |
| 组件库 | shadcn/ui（base-nova 风格） |
| 动效 | framer-motion |
| 图标 | lucide-react |

**禁止**引入 styled-components、emotion、CSS Modules 等额外样式方案。
**禁止**引入 Redux、Zustand 等状态管理库（用 React useState/useContext 即可）。

> ⚠️ Next.js 版本注意：本项目使用 Next.js 16，API 与旧版本有差异，
> 写代码前先确认 `node_modules/next/dist/docs/` 中的最新规范。

---

## Design DNA（必须遵守）

完整的三维设计基因定义在 **`design-dna.json`**，包含：
- **design_system** — 颜色、字体、间距、圆角、阴影、动效等可度量 token
- **design_style** — 情绪、视觉语言、构图、交互手感等定性描述
- **visual_effects** — 特效规范（当前以 CSS + framer-motion 为主）

所有组件的视觉实现必须对齐 `design-dna.json` 中的 token，不得随意使用 Tailwind 默认色。
开发前先读 `design-dna.json`，token 在组件顶部用 `const` 定义。

---

## 项目结构规范

```
wedata/
├── app/
│   └── page.tsx               ← 完整 Agent 对话 demo 主页面（唯一页面）
├── components/
│   └── ui/                    ← 所有 UI 组件放这里
│       ├── agent-plan.tsx     ← 任务执行进度（已完成）
│       ├── chat-input.tsx     ← 对话输入框（待做）
│       ├── message-bubble.tsx ← 对话气泡（待做）
│       └── ...                ← 后续新增组件
└── lib/
    └── utils.ts
```

### 组件文件规范
- 每个组件一个文件，放在 `components/ui/`
- 文件名：`kebab-case.tsx`
- 组件名：`PascalCase`
- 顶部必须写 `"use client"`（所有组件均为客户端组件）
- Design DNA token 在组件顶部用 `const` 定义，不得硬编码散落各处

---

## 页面架构

`app/page.tsx` 是**唯一页面**，组装所有组件，呈现完整 demo。

典型布局参考：
```
┌─────────────────────────────────────┐
│  顶部：Agent 身份 / 任务标题         │
├──────────────┬──────────────────────┤
│  左/主区：   │  右/侧区：           │
│  对话消息流  │  任务执行进度         │
│  (message-   │  (agent-plan)        │
│   bubble)    │                      │
├──────────────┴──────────────────────┤
│  底部：输入框 (chat-input)           │
└─────────────────────────────────────┘
```

最大内容宽度：`880px`，水平居中。

---

## 状态管理约定

- 使用 `useState` / `useContext` 管理 demo 状态
- 对话消息用 `Message[]` 数组驱动
- 任务进度用 `Task[]` 数组驱动
- demo 数据写在组件顶部 `initialXxx` 常量中，不调用真实 API

---

## 组件交付标准

每个组件交付前必须满足：

1. `npx tsc --noEmit` 零报错
2. `npm run build` 构建成功
3. 视觉上与 Design DNA 对齐（颜色、圆角、阴影、字体）
4. 动效符合"克制"原则（functional，非装饰）
5. 支持 `prefers-reduced-motion` 降级

---

## 命名与注释约定

- 状态变量：`camelCase`，语义明确（`isExpanded` 而非 `open`）
- 事件处理：`handle` 前缀（`handleSend`、`handleTaskClick`）
- 类型定义：写在组件文件顶部，`interface` 优先
- 注释：只在"为什么这么做"不明显时写，不写废话注释

---

## 输出前缀要求

每次回复必须以 `🚜` 作为首行，正文内容从第二行开始输出，违反即为失败

## 禁止事项

- ❌ 不得修改 `components.json`、`tsconfig.json`、`next.config.ts`（除非有明确需求）
- ❌ 不得安装未经确认的 npm 包
- ❌ 不得在组件里调用真实后端 API（这是 demo，数据全部 mock）
- ❌ 不得使用 Tailwind 默认语义色（`bg-primary`、`text-muted-foreground` 等）替代 Design DNA token
- ❌ 不得创建多个页面路由（`/demo/xxx` 等）——只有一个主页面
- ❌ **`web-lakehouse/` 目录完全禁区**：未经用户明确要求，禁止阅读、搜索、修改该目录下的任何文件。TypeScript 检查、grep、glob 等操作必须排除该路径。Git 操作同理——不得 add/commit/diff 该目录。该目录已在 `.gitignore` 中排除，不属于本项目。

---

## gstack

所有网页浏览任务**必须**使用 gstack 的 `/browse` 技能，**禁止**使用 `mcp__claude-in-chrome__*` 系列工具。

### 可用技能列表

`/office-hours` · `/plan-ceo-review` · `/plan-eng-review` · `/plan-design-review` · `/design-consultation` · `/design-shotgun` · `/design-html` · `/review` · `/ship` · `/land-and-deploy` · `/canary` · `/benchmark` · `/browse` · `/connect-chrome` · `/qa` · `/qa-only` · `/design-review` · `/setup-browser-cookies` · `/setup-deploy` · `/retro` · `/investigate` · `/document-release` · `/codex` · `/cso` · `/autoplan` · `/careful` · `/freeze` · `/guard` · `/unfreeze` · `/gstack-upgrade` · `/learn`

---

## Agentation（可视化反馈工具）

项目已集成 [Agentation](https://www.agentation.com)，用于在浏览器中直接标注 UI 问题，Claude Code 通过 MCP 实时接收标注并修复。

### 启动方式

开发时需要**同时启动两个服务**：

```bash
# 终端 1：启动 MCP server（让 Claude Code 能接收标注）
npx agentation-mcp server

# 终端 2：启动 Next.js 开发服务器
npm run dev
```

### 工作流

1. 浏览器打开页面 → 使用 Agentation 工具栏在 UI 上圈注问题
2. 标注通过 MCP server（端口 4747）同步到 Claude Code
3. 收到 Agentation 标注后，**优先处理**，视为与用户指令同等优先级

### 配置位置

- MCP server：`~/.claude.json` → `mcpServers.agentation`
- 前端组件：`components/agentation-provider.tsx`（仅 development 环境加载）
- 挂载点：`app/layout.tsx` → `<AgentationProvider />`

### 验证配置

```bash
npx agentation-mcp doctor
```

---

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
