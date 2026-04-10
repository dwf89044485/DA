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

solo 开发，无 PR 流程，采用「稳定主线 + 改造分支」双轨：

- `main`：只保留可运行、可回退版本
- `feat/*` / `refactor/*` / `备份`：承载大改造与高风险变更

**分支规则（强制）**
- 当任务属于「大改造 / 重构 / 高风险」时，第一步先创建或切换到独立分支，再开始改动。
- 大改造期间所有提交都在独立分支完成；未得到明确指令，不回写 `main`。
- 用户明确要求「提交」「推送」「提交推送」「commit」「push」时，直接执行，**禁止调用 `/ship`**。

```bash
git add -A
git commit -m "<message>"
# 若当前在 main：git push origin main
# 若当前在改造分支：git push -u origin <branch-name>
```

**回退规则（强制）**
- 已推送到远端的错误提交：优先 `git revert`。
- 仅本地未推送且用户确认后：可 `git reset --hard <commit>`。
- 大改造开始前，建议创建稳定锚点（commit/tag）。

**注意：** `CLAUDE.md` 是指向 `AGENTS.md` 的 symlink。为避免遗漏，默认使用 `git add -A`；如需定向暂存，再用 `git add AGENTS.md`。

**AI 自动执行清单（每次开发任务）**
1. 先执行 `git status` 与 `git branch --show-current`。
2. 若为大改造且当前在 `main`，先切独立分支再改代码。
3. 实施最小必要改动，不扩 scope。
4. 提交前执行 `npx tsc --noEmit` 与 `npm run build`；失败则停止并反馈。
5. 使用小步提交，便于精准回退。
6. 回复时给出分支名、commit hash、可用回退方式。

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

## Motion Editor 动效调参系统

本项目有一套通用的动效参数调节系统（选择模式 → 参数面板）。**组件开发和动效调参是两个独立阶段**：

1. **阶段一：组件开发** — 专注设计还原，不涉及动效系统
2. **阶段二：动效调参** — 组件完成后，接入 Motion Editor 系统

**当用户要求给组件「加动效」「调动效」「接入 Motion Editor」时**，必须先阅读 `docs/motion-editor-system.md`，然后按其中「接入新组件指南」（Section 7）执行：

1. 在组件文件中导出 `MotionTargetDef`（id / label / schema / defaultConfig）
2. 在 `app/page.tsx` 中用 `<MotionTargetOverlay>` 包裹组件
3. 添加对应的 `<MotionPanel>` 条件渲染

**不需要修改** MotionPanel、MotionSelectButton、MotionTargetOverlay 的代码。

---

## 启动 Dev Server

启动 WebUI 时**必须**使用 `run_in_background` 模式，禁止用普通 Bash 调用（会被 2 分钟超时 kill）：

```bash
npm run dev   # Bash 工具设置 run_in_background: true
```

这样 dev server 生命周期跟随 Claude 会话，退出时自动清理。

---

## Agentation

开发时同时启动：
```bash
npx agentation-mcp server   # 终端 1
npm run dev                  # 终端 2（或由 AI 通过 run_in_background 启动）
```
收到标注后优先处理，优先级等同用户指令。
