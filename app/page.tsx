"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Sidebar from "@/components/ui/sidebar";
import ClaudeChatInput, { type ChatInputHandle, type SkillChip } from "@/components/ui/claude-style-chat-input";
import { AgentFanCards, type FanCardsConfig, DEFAULT_FAN_CONFIG } from "@/components/ui/agent-card";
import FanCardEditor from "@/components/ui/fan-card-editor";
import { IconAiHistory, IconCatalog, IconWorkflow, IconSQL, IconOps, IconMLExp } from "@/components/ui/wedata-icons";
import StudioView from "@/components/ui/studio-view";
import AiRunningBubble from "@/components/ui/ai-running-bubble";
import ChatTitlebar from "@/components/ui/chat-titlebar";
import UserMessageBubble from "@/components/ui/user-message-bubble";
import Plan from "@/components/ui/agent-plan";
import ThinkingSummary from "@/components/ui/thinking-summary";

// ── Design tokens ──────────────────────────────────────────────
const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

// ── Agent 名称色映射 ──────────────────────────────────────────
const AGENT_NAME_COLORS: Record<string, string> = {
  Rigel: "#2873FF",
  Vega: "#00BBA2",
  Orion: "#CC6B3A",
  Nova: "#934BFF",
};

// ── Chat phase ──────────────────────────────────────────────────
type ChatPhase = "welcome" | "conversation";

// ── 当前召唤的 Agent 信息 ────────────────────────────────────────
interface SummonedAgent {
  name: string;
  title: string;
  avatar: string;
  summonText?: string;
}

// ── expanded skill label → icon 映射 ────────────────────────────
const SKILL_ICON_COLOR = "rgba(0,0,0,0.45)";
const SKILL_ICON_MAP: Record<string, React.ReactNode> = {
  // Rigel
  "需求转数据模型": <IconCatalog size={14} color={SKILL_ICON_COLOR} />,
  "生成调度方案": <IconWorkflow size={14} color={SKILL_ICON_COLOR} />,
  "自动数仓开发": <IconSQL size={14} color={SKILL_ICON_COLOR} />,
  "检测管道异常": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  "接入数据源": <IconCatalog size={14} color={SKILL_ICON_COLOR} />,
  "优化任务性能": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  // Vega
  "自然语言取数": <IconCatalog size={14} color={SKILL_ICON_COLOR} />,
  "智能趋势分析": <IconWorkflow size={14} color={SKILL_ICON_COLOR} />,
  "多维数据洞察": <IconSQL size={14} color={SKILL_ICON_COLOR} />,
  "生成数据报告": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  "异常归因": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  "指标拆解": <IconWorkflow size={14} color={SKILL_ICON_COLOR} />,
  // Orion
  "监测数据质量": <IconCatalog size={14} color={SKILL_ICON_COLOR} />,
  "智能血缘维护": <IconWorkflow size={14} color={SKILL_ICON_COLOR} />,
  "自动管理元数据": <IconSQL size={14} color={SKILL_ICON_COLOR} />,
  "识别口径冲突": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  "安全脱敏": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  "标签治理": <IconCatalog size={14} color={SKILL_ICON_COLOR} />,
  // Nova
  "业务指标监控": <IconWorkflow size={14} color={SKILL_ICON_COLOR} />,
  "智能异常预警": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  "自助取数": <IconCatalog size={14} color={SKILL_ICON_COLOR} />,
  "生成运营看板": <IconSQL size={14} color={SKILL_ICON_COLOR} />,
  "目标达成追踪": <IconWorkflow size={14} color={SKILL_ICON_COLOR} />,
  "用户行为分析": <IconMLExp size={14} color={SKILL_ICON_COLOR} />,
};

const C = {
  rightBg:   "#F9FAFC",
  titlebar:  "transparent",
  textTertiary: "rgba(0,0,0,0.5)",
  iconBtn:   "rgba(0,0,0,0.05)",
} as const;

const BUBBLE_TARGET = {
  width: 240,
  height: 72,
  right: 30,
  bottom: 50,
  radius: 100,
} as const;

const SHRINK_DURATION = 0.58;
const SHRINK_EASE: [number, number, number, number] = [0.23, 0.65, 0.25, 1];
const STUDIO_REVEAL_DURATION = 0.3;
const STUDIO_REVEAL_EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
const BUBBLE_REVEAL_EASE: [number, number, number, number] = [0.23, 0.64, 0.22, 1];

export default function Home() {
  const [targetView, setTargetView] = useState("dataclaw");
  const [viewState, setViewState] = useState<"dataclaw" | "shrinking" | "studio">("dataclaw");
  const [shrinkMetrics, setShrinkMetrics] = useState({
    scaleX: 0.18,
    scaleY: 0.1,
    x: -BUBBLE_TARGET.right,
    y: -BUBBLE_TARGET.bottom,
  });
  const [activeSkills, setActiveSkills] = useState<SkillChip[]>([]);
  const [summonedAgent, setSummonedAgent] = useState<SummonedAgent | null>(null);
  const [chatPhase, setChatPhase] = useState<ChatPhase>("welcome");
  const [userMessage, setUserMessage] = useState<string>("");
  // 对话流分步揭示：0=用户气泡, 1=思考摘要, 2=Plan卡片
  const [revealStep, setRevealStep] = useState(0);
  // 卡片参数配置
  const [fanConfig, setFanConfig] = useState<FanCardsConfig>(DEFAULT_FAN_CONFIG);
  const chatInputRef = useRef<ChatInputHandle>(null);
  const dataClawRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleSkillClick = useCallback((label: string, agent?: { name: string; title: string; avatar: string; summonText?: string }) => {
    setActiveSkills([{ id: label, label, icon: SKILL_ICON_MAP[label] }]);
    if (agent) {
      setSummonedAgent(agent);
    }
    requestAnimationFrame(() => chatInputRef.current?.focus());
  }, []);

  const handleSummon = useCallback((agent: { name: string; title: string; avatar: string; summonText?: string }) => {
    setSummonedAgent(agent);
    setActiveSkills([]);
    requestAnimationFrame(() => chatInputRef.current?.focus());
  }, []);

  const handleRemoveSkill = useCallback((id: string) => {
    setActiveSkills((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (next.length === 0) {
        setSummonedAgent(null);
      }
      return next;
    });
  }, []);

  const handleRemoveAgent = useCallback(() => {
    setSummonedAgent(null);
    setActiveSkills([]);
  }, []);

  const handleSendMessage = useCallback(({ message }: { message: string; files: unknown[] }) => {
    if (!message.trim()) return;
    setUserMessage(message.trim());
    // 如果没有召唤 agent，默认使用 Rigel
    if (!summonedAgent) {
      setSummonedAgent({
        name: "Rigel",
        title: "数仓工程专家",
        avatar: "/agents/1a.png",
      });
    }
    setChatPhase("conversation");
    // 清掉 skills 和 summonedAgent 相关的输入框状态
    setActiveSkills([]);
  }, [summonedAgent]);

  const handleNewChat = useCallback(() => {
    setChatPhase("welcome");
    setUserMessage("");
    setRevealStep(0);
    setSummonedAgent(null);
    setActiveSkills([]);
  }, []);

  const handleMenuClick = useCallback((id: string) => {
    if (viewState === "shrinking") return;

    if (id === "studio" && viewState === "dataclaw") {
      const rect = dataClawRef.current?.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        setShrinkMetrics({
          scaleX: BUBBLE_TARGET.width / rect.width,
          scaleY: BUBBLE_TARGET.height / rect.height,
          x: -BUBBLE_TARGET.right,
          y: -BUBBLE_TARGET.bottom,
        });
      }

      setTargetView("studio");
      if (shouldReduceMotion) {
        setViewState("studio");
        return;
      }

      setViewState("shrinking");
      return;
    }

    setTargetView(id);
    setViewState(id === "studio" ? "studio" : "dataclaw");
  }, [shouldReduceMotion, viewState]);

  return (
    <div style={{
      display: "flex",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      fontFamily: FONT,
    }}>

      {/* ── 左侧导航 ── */}
      <Sidebar activeId={targetView} onMenuClick={handleMenuClick} />

      {/* ── 右侧内容区 ── */}
      <div style={{ flex: 1, minWidth: 0, height: "100vh", overflow: "hidden", position: "relative" }}>
        {/* Studio 背景层：先露出主画布，不提前露出气泡 */}
        <motion.div
          initial={false}
          animate={{ opacity: viewState === "dataclaw" ? 0 : 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : STUDIO_REVEAL_DURATION, ease: STUDIO_REVEAL_EASE }}
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: viewState === "studio" ? "auto" : "none",
            zIndex: 0,
          }}
        >
          <StudioView />
        </motion.div>

        {/* 气泡层：单段连续收敛，避免二次缩放感 */}
        <motion.div
          initial={false}
          animate={viewState === "shrinking"
            ? { opacity: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)" }
            : viewState === "studio"
              ? { opacity: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)" }
              : { opacity: 0, scale: 2.5, x: -140, y: -200, filter: "blur(2px)" }
          }
          transition={shouldReduceMotion
            ? { duration: 0 }
            : viewState === "shrinking"
              ? {
                  duration: SHRINK_DURATION,
                  ease: BUBBLE_REVEAL_EASE,
                  opacity: {
                    duration: SHRINK_DURATION,
                    ease: [0.2, 0.85, 0.25, 1],
                  },
                }
              : { duration: 0.2, ease: EASE }
          }
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            transformOrigin: "bottom right",
            willChange: "opacity, transform, filter",
            zIndex: 1,
          }}
        >
          <AiRunningBubble />
        </motion.div>

        {/* DataClaw 顶层：缩小并直接收敛到气泡尺寸与位置 */}
        {(viewState === "dataclaw" || viewState === "shrinking") && (
        <motion.div
          ref={dataClawRef}
          initial={false}
          animate={viewState === "shrinking"
            ? {
                scaleX: shrinkMetrics.scaleX,
                scaleY: shrinkMetrics.scaleY,
                x: shrinkMetrics.x,
                y: shrinkMetrics.y,
                opacity: 0,
                borderRadius: BUBBLE_TARGET.radius,
                filter: "blur(1.2px)",
              }
            : { scaleX: 1, scaleY: 1, x: 0, y: 0, opacity: 1, borderRadius: 0, filter: "blur(0px)" }
          }
          transition={shouldReduceMotion
            ? { duration: 0 }
            : viewState === "shrinking"
              ? {
                  duration: SHRINK_DURATION,
                  ease: SHRINK_EASE,
                }
              : { duration: 0.24, ease: EASE }
          }
          onAnimationComplete={() => {
            if (viewState === "shrinking") {
              setViewState("studio");
            }
          }}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: C.rightBg,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transformOrigin: "bottom right",
            willChange: "transform, border-radius, opacity, filter",
            zIndex: 2,
          }}
        >
        {/* ── 顶部标题栏 84px ── */}
        <div style={{
          height: 84,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 20px",
          position: "relative",
        }}>
          <AnimatePresence mode="wait">
            {chatPhase === "welcome" ? (
              <motion.div
                key="welcome-header"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
                style={{ display: "flex", alignItems: "center" }}
              >
                {/* 历史记录按钮 */}
                <button style={{
                  width: 44, height: 44,
                  borderRadius: 100,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 100ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.iconBtn)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <IconAiHistory size={20} color={C.textTertiary} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="chat-header"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                style={{ width: "100%" }}
              >
                <ChatTitlebar
                  agent={{
                    name: summonedAgent?.name ?? "Rigel",
                    title: summonedAgent?.title ?? "数仓工程专家",
                    avatar: summonedAgent?.avatar ?? "/agents/1a.png",
                    nameColor: AGENT_NAME_COLORS[summonedAgent?.name ?? "Rigel"],
                  }}
                  onNewChat={handleNewChat}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── 中间内容区（可滚动） ── */}
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: chatPhase === "welcome" ? "center" : "flex-start",
          scrollbarWidth: "none",
          transition: "justify-content 0.3s",
          position: "relative",
        }}>
          {/* 参数编辑器 - 仅在 welcome 阶段显示 */}
          <AnimatePresence>
            {chatPhase === "welcome" && (
              <FanCardEditor config={fanConfig} onChange={setFanConfig} />
            )}
          </AnimatePresence>
          {/* 内容宽度容器 880px */}
          <div style={{
            width: "100%",
            maxWidth: 880,
            padding: chatPhase === "welcome" ? "0 0 24px" : "24px 0 120px",
          }}>
            <AnimatePresence mode="wait">
              {chatPhase === "welcome" ? (
                <motion.div
                  key="welcome"
                  initial={{ y: -16 }}
                  animate={{ y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  style={{ marginTop: -190, position: "relative" }}
                >
                  {/* ── 欢迎标题 + 卡片 — 选中技能后一起退出，叉掉后恢复 ── */}
                  <AnimatePresence>
                    {activeSkills.length === 0 && !summonedAgent && (
                      <motion.div
                        key="welcome-content"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } }}
                        exit={{ opacity: 0, y: -12, transition: { duration: 0.3, ease: EASE } }}
                      >
                        <div style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 8,
                          padding: "40px 0 24px",
                          transform: "translateY(-60px)",
                        }}>
                          <span style={{
                            fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: 36,
                            fontWeight: 600,
                            lineHeight: "40px",
                            color: "#000",
                            whiteSpace: "nowrap",
                          }}>WeData</span>
                          <span style={{
                            fontFamily: FONT,
                            fontSize: 32,
                            fontWeight: 600,
                            lineHeight: "40px",
                            color: "#000",
                            whiteSpace: "nowrap",
                          }}>专家团随时待命</span>
                        </div>
                        <div style={{ marginTop: -20 }}>
                          <AgentFanCards config={fanConfig} onSkillClick={handleSkillClick} onSummon={handleSummon} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="conversation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  style={{ display: "flex", flexDirection: "column", gap: 24 }}
                >
                  {/* Step 0: 用户气泡 — 立即出现 */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    onAnimationComplete={() => setRevealStep((s) => Math.max(s, 1))}
                  >
                    <UserMessageBubble content={userMessage} />
                  </motion.div>

                  {/* Step 1: 思考摘要 — 等用户气泡完成后出现 */}
                  {revealStep >= 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: EASE, delay: 0.3 }}
                      onAnimationComplete={() => setRevealStep((s) => Math.max(s, 2))}
                    >
                      <ThinkingSummary />
                    </motion.div>
                  )}

                  {/* Step 2: Agent 执行计划 — 等思考摘要完成后出现 */}
                  {revealStep >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: EASE, delay: 0.15 }}
                    >
                      <Plan />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* ── 置底输入框：固定距底部 32px，高度向上伸缩，不影响上方卡片布局 ── */}
        <div style={{
          position: "absolute",
          left: 20,
          right: 20,
          bottom: 32,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 3,
        }}>
          <div style={{ width: "100%", maxWidth: 880, position: "relative", pointerEvents: "auto" }}>
            {/* ── Agent 召唤引导：头像从输入框后面伸出（仅 welcome 阶段） ── */}
            <AnimatePresence>
              {chatPhase === "welcome" && summonedAgent && (
                <motion.div
                  key={summonedAgent.name}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, transition: { duration: 0.35, ease: EASE } }}
                  exit={{ y: 16, opacity: 0, transition: { duration: 0.2, ease: EASE } }}
                  style={{
                    position: "absolute",
                    bottom: "calc(100% - 20px)",
                    left: 0,
                    right: 0,
                    zIndex: 0,
                    display: "flex",
                    alignItems: "flex-end",
                    paddingBottom: 20,
                    pointerEvents: "none",
                  }}
                >
                  {/* 头像 */}
                  <img
                    src={summonedAgent.avatar}
                    alt={summonedAgent.name}
                    style={{
                      flexShrink: 0,
                      width: 120,
                      height: 106,
                      objectFit: "cover",
                      objectPosition: "top center",
                      pointerEvents: "none",
                      marginLeft: 20,
                    }}
                  />

                  {/* 引导文案 */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    paddingBottom: 28,
                    flexWrap: "nowrap",
                    marginLeft: 6,
                  }}>
                    <span style={{
                      fontFamily: FONT,
                      fontSize: 24,
                      fontWeight: 600,
                      lineHeight: "32px",
                      color: "rgba(0,0,0,0.9)",
                      whiteSpace: "nowrap",
                    }}>
                      我是{summonedAgent.title}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-pixelify-sans), 'Pixelify Sans', sans-serif",
                      fontSize: 28,
                      fontWeight: 500,
                      lineHeight: "32px",
                      color: "#2873FF",
                      whiteSpace: "nowrap",
                    }}>
                      {summonedAgent.name}
                    </span>
                    {summonedAgent.summonText && (
                      <span style={{
                        fontFamily: FONT,
                        fontSize: 24,
                        fontWeight: 600,
                        lineHeight: "32px",
                        color: "rgba(0,0,0,0.9)",
                        whiteSpace: "nowrap",
                      }}>
                        ，{summonedAgent.summonText}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 输入框：不设 zIndex，避免创建 stacking context，让内部 glow 的负 z-index 能逃逸到父级 */}
            <div style={{ position: "relative" }}>
              <ClaudeChatInput
                ref={chatInputRef}
                placeholder={chatPhase === "conversation" ? "继续对话..." : "选择一位专家或直接分配任务"}
                skills={chatPhase === "welcome" ? activeSkills : []}
                onRemoveSkill={handleRemoveSkill}
                agentChip={chatPhase === "welcome" ? (summonedAgent ?? undefined) : undefined}
                onRemoveAgent={handleRemoveAgent}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        </div>

        {/* 帘幕遮罩：覆盖整个 DataClaw 面板，与背景同色从不透明→透明，
            模拟 fade-in 而不影响子级 backdrop-filter */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: C.rightBg,
            pointerEvents: "none",
            zIndex: 50,
          }}
        />

        </motion.div>
        )}
      </div>
    </div>
  );
}
