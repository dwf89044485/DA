# WeData AI Demo — 项目规范

## 项目定位

AI 对话功能演示项目。唯一页面 `app/page.tsx`，数据全部 mock，不调用真实 API。

---

## 技术栈（锁定）

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16（App Router） |
| 语言 | TypeScript 严格模式 |
| 样式 | Tailwind CSS v4 + inline style（Design DNA token） |
| 组件库 | shadcn/ui |
| 动效 | framer-motion |
| 图标 | lucide-react |

禁止引入其他样式方案（styled-components / emotion / CSS Modules）和状态管理库（Redux / Zustand）。

---

## Design DNA

所有视觉 token 来自 `design-dna.json`，开发前必读。token 在组件顶部用 `const` 定义，禁止硬编码或使用 Tailwind 默认语义色。

---

## 组件规范

- 放在 `components/ui/`，文件名 `kebab-case.tsx`，组件名 `PascalCase`
- 顶部必须写 `"use client"`
- 交付前：`npx tsc --noEmit` 零报错 + `npm run build` 成功

---

## 输出前缀

每次回复首行必须是 `🚜`，违反即为失败。

---

## 禁止事项

- 不得修改 `components.json`、`tsconfig.json`、`next.config.ts`
- 不得安装未经确认的 npm 包
- 不得创建多个页面路由
- `web-lakehouse/` 目录完全禁区：禁止读取、搜索、修改、git add/diff

---

## Git 工作流（优先级高于 Skill routing）

solo 开发，main 分支直推，无 PR 流程。

「提交」「推送」「提交推送」「commit」「push」等指令，直接执行，**禁止调用 `/ship`**：

```bash
git add <changed-files>
git commit -m "<message>"
git push origin main
```

**注意：** `CLAUDE.md` 是指向 `AGENTS.md` 的 symlink。提交时必须 `git add AGENTS.md`，`git add CLAUDE.md` 是 no-op。

---

## gstack

浏览任务必须用 `/browse`，禁止 `mcp__claude-in-chrome__*`。

可用技能：`/office-hours` · `/plan-ceo-review` · `/plan-eng-review` · `/plan-design-review` · `/design-consultation` · `/design-shotgun` · `/design-html` · `/review` · `/ship` · `/land-and-deploy` · `/canary` · `/benchmark` · `/browse` · `/connect-chrome` · `/qa` · `/qa-only` · `/design-review` · `/setup-browser-cookies` · `/setup-deploy` · `/retro` · `/investigate` · `/document-release` · `/codex` · `/cso` · `/autoplan` · `/careful` · `/freeze` · `/guard` · `/unfreeze` · `/gstack-upgrade` · `/learn`

---

## Skill routing

匹配到技能时，**第一个动作**就调用，不得先回答或用其他工具。

- 产品想法 / 头脑风暴 → `/office-hours`
- bug / 报错 / 500 → `/investigate`
- 提交推送 → **不适用，见上方 Git 工作流**
- QA / 找 bug → `/qa`
- code review → `/review`
- 设计系统 / 品牌 → `/design-consultation`
- 视觉审查 → `/design-review`
- 架构评审 → `/plan-eng-review`

---

## Agentation

开发时同时启动：
```bash
npx agentation-mcp server   # 终端 1
npm run dev                  # 终端 2
```
收到标注后优先处理，优先级等同用户指令。
