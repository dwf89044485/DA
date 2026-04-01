"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Sidebar from "@/components/ui/sidebar";
import ClaudeChatInput, { type ChatInputHandle, type SkillChip } from "@/components/ui/claude-style-chat-input";
import { AgentFanCards } from "@/components/ui/agent-card";
import { IconAiHistory, IconCatalog, IconWorkflow, IconSQL, IconOps, IconMLExp } from "@/components/ui/wedata-icons";
import StudioView from "@/components/ui/studio-view";
import AiRunningBubble from "@/components/ui/ai-running-bubble";

// ── Design tokens ──────────────────────────────────────────────
const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

// ── expanded skill label → icon 映射 ────────────────────────────
const SKILL_ICON_COLOR = "rgba(0,0,0,0.45)";
const SKILL_ICON_MAP: Record<string, React.ReactNode> = {
  // Rigel
  "需求转模型": <IconCatalog size={14} color={SKILL_ICON_COLOR} />,
  "生成调度方案": <IconWorkflow size={14} color={SKILL_ICON_COLOR} />,
  "自动数仓开发": <IconSQL size={14} color={SKILL_ICON_COLOR} />,
  "检测管道异常": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  "接入数据源": <IconCatalog size={14} color={SKILL_ICON_COLOR} />,
  "优化任务性能": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  // Vega
  "智能分析": <IconCatalog size={14} color={SKILL_ICON_COLOR} />,
  "可视化报告": <IconWorkflow size={14} color={SKILL_ICON_COLOR} />,
  "SQL 诊断": <IconSQL size={14} color={SKILL_ICON_COLOR} />,
  "异常归因": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  "趋势预测": <IconMLExp size={14} color={SKILL_ICON_COLOR} />,
  "数据清洗": <IconSQL size={14} color={SKILL_ICON_COLOR} />,
  // Altair
  "质量检测": <IconCatalog size={14} color={SKILL_ICON_COLOR} />,
  "元数据管理": <IconWorkflow size={14} color={SKILL_ICON_COLOR} />,
  "血缘分析": <IconSQL size={14} color={SKILL_ICON_COLOR} />,
  "合规审计": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  "安全脱敏": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  "标签治理": <IconCatalog size={14} color={SKILL_ICON_COLOR} />,
  // Sirius
  "特征工程": <IconCatalog size={14} color={SKILL_ICON_COLOR} />,
  "模型训练": <IconMLExp size={14} color={SKILL_ICON_COLOR} />,
  "自动调参": <IconSQL size={14} color={SKILL_ICON_COLOR} />,
  "模型部署": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  "A/B 实验": <IconWorkflow size={14} color={SKILL_ICON_COLOR} />,
  "模型监控": <IconOps size={14} color={SKILL_ICON_COLOR} />,
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
  const chatInputRef = useRef<ChatInputHandle>(null);
  const dataClawRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleSkillClick = useCallback((label: string) => {
    // 单标签模式：直接替换，从映射表查找图标
    setActiveSkills([{ id: label, label, icon: SKILL_ICON_MAP[label] }]);
    requestAnimationFrame(() => chatInputRef.current?.focus());
  }, []);

  const handleRemoveSkill = useCallback((id: string) => {
    setActiveSkills((prev) => prev.filter((s) => s.id !== id));
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
            pointerEvents: viewState === "studio" ? "auto" : "none",
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
          justifyContent: "center",
          scrollbarWidth: "none",
        }}>
          {/* 内容宽度容器 880px */}
          <div style={{
            width: "100%",
            maxWidth: 880,
            padding: "0 0 24px",
          }}>
            <AnimatePresence>
              {activeSkills.length === 0 && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  style={{ marginTop: -50 }}
                >
                  {/* ── 欢迎标题 ── */}
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                    padding: "40px 0 24px",
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

                  {/* Agent 名片卡片 — 四卡扇形排列 */}
                  <div style={{ marginTop: 40 }}>
                    <AgentFanCards onSkillClick={handleSkillClick} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── 底部输入框区域 ── */}
        <div style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          padding: "0 20px 32px",
        }}>
          <div style={{ width: "100%", maxWidth: 880 }}>
            <ClaudeChatInput
              ref={chatInputRef}
              placeholder="选择一位专家或直接分配任务"
              skills={activeSkills}
              onRemoveSkill={handleRemoveSkill}
            />
          </div>
        </div>

        </motion.div>
        )}
      </div>
    </div>
  );
}
