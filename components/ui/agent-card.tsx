"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IconCatalog,
  IconWorkflow,
  IconSQL,
  IconOps,
  IconMLExp,
} from "@/components/ui/wedata-icons";

// ── Design tokens ───────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const DUR = { micro: 0.1, normal: 0.2, macro: 0.35 } as const;

const T = {
  primary: "rgba(0,0,0,0.9)",
  secondary: "rgba(0,0,0,0.7)",
  tertiary: "rgba(0,0,0,0.5)",
  disabled: "rgba(0,0,0,0.3)",
  solid: "#000000",
  blue: "#2873FF",
} as const;

const FONT =
  "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_EN =
  "var(--font-pixelify-sans), 'Pixelify Sans', 'PingFang SC', sans-serif";

// ── Types ───────────────────────────────────────────────────────
interface SkillTag {
  label: string;
  icon: React.ReactNode;
}

interface StatItem {
  value: string;
  label: string;
}

interface AgentCardProps {
  /** 英文名 */
  name: string;
  /** 中文头衔 */
  title: string;
  /** 头像图片 URL */
  avatar: string;
  /** 简介描述（hover 展开时替换标签区） */
  description?: string;
  /** 数据指标（hover 展开时显示） */
  stats?: StatItem[];
  /** 默认状态显示的技能标签（带图标） */
  skills: SkillTag[];
  /** hover 展开后显示的全部技能标签（纯文字） */
  expandedSkills?: string[];
  /** CTA 按钮文字 */
  ctaLabel?: string;
  /** 点击回调 */
  onClick?: () => void;
  /** 展开技能标签点击回调 */
  onSkillClick?: (label: string) => void;
  /** 受控 hover 状态：外部控制时优先使用 */
  isHovered?: boolean;
}

// ── 小箭头图标 ──────────────────────────────────────────────────
function ArrowUpRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M5.5 4.5H11.5V10.5M11.5 4.5L4.5 11.5"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── AI 聊天图标 ─────────────────────────────────────────────────
function AiChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1.5C4.41 1.5 1.5 4.08 1.5 7.25C1.5 8.87 2.28 10.33 3.56 11.35L3 14.5L6.26 12.82C6.82 12.94 7.4 13 8 13C11.59 13 14.5 10.42 14.5 7.25C14.5 4.08 11.59 1.5 8 1.5Z"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="5.5" cy="7.25" r="0.75" fill="white" />
      <circle cx="8" cy="7.25" r="0.75" fill="white" />
      <circle cx="10.5" cy="7.25" r="0.75" fill="white" />
    </svg>
  );
}

// ── 尺寸常量 ────────────────────────────────────────────────────
const CARD_HEIGHT = 438;

// ── Component ───────────────────────────────────────────────────
export default function AgentCard({
  name,
  title,
  avatar,
  description,
  stats,
  skills,
  expandedSkills,
  ctaLabel = "立即召唤",
  onClick,
  onSkillClick,
  isHovered: controlledHover,
}: AgentCardProps) {
  const [internalHover, setInternalHover] = useState(false);

  // 受控模式：外部传 isHovered 时使用外部值，否则用内部状态
  const hovered = controlledHover !== undefined ? controlledHover : internalHover;

  // 浏览器切 tab 时可能不触发 mouseleave，hovered 卡在 true
  useEffect(() => {
    const onVisChange = () => {
      if (document.hidden) setInternalHover(false);
    };
    document.addEventListener("visibilitychange", onVisChange);
    return () => document.removeEventListener("visibilitychange", onVisChange);
  }, []);

  const transition = { duration: DUR.macro, ease: EASE };

  return (
    <div
      onMouseEnter={() => controlledHover === undefined && setInternalHover(true)}
      onMouseLeave={() => controlledHover === undefined && setInternalHover(false)}
      onClick={onClick}
      style={{
        width: 288,
        height: CARD_HEIGHT,
        borderRadius: 24,
        overflow: "hidden",
        background: "#FFFFFF",
        boxShadow: "0px 4px 16px 0px rgba(0,0,0,0.06)",
        cursor: onClick ? "pointer" : "default",
        fontFamily: FONT,
        position: "relative",
      }}
    >
      {/* ── 渐变边框层（设计稿：上#E6E9EF → 下#FFFFFF，1px inside） */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 24,
          padding: 1,
          background: "linear-gradient(to bottom, #E6E9EF, #FFFFFF)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      {/* ── 头像 ─────────────────────────────────────────── */}
      <img
        src={avatar}
        alt={name}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "top center",
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />

      {/* ── 唯一信息区 — 从底部向上覆盖 ─────────────────── */}
      <motion.div
        initial={false}
        animate={{
          y: hovered ? 0 : CARD_HEIGHT - 156,
          paddingTop: hovered ? 24 : 14,
        }}
        transition={{ duration: DUR.macro, ease: EASE }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: 24,
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          display: "flex",
          flexDirection: "column",
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {/* ── 顶部：名字区 ─────────────────────────────── */}
        <div style={{ flexShrink: 0, marginBottom: 4 }}>
          {/* 英文名 */}
          <p
            style={{
              fontFamily: FONT_EN,
              fontSize: 20,
              lineHeight: "24px",
              fontWeight: 500,
              color: T.blue,
              margin: 0,
            }}
          >
            {name}
          </p>
          {/* 中文头衔 — hover 时字号变大 */}
          <motion.p
            initial={{ fontSize: 18, lineHeight: "26px" }}
            animate={{
              fontSize: hovered ? 20 : 18,
              lineHeight: hovered ? "28px" : "26px",
            }}
            transition={transition}
            style={{
              fontFamily: FONT,
              fontWeight: 600,
              color: T.solid,
              margin: 0,
            }}
          >
            {title}
          </motion.p>
        </div>

        {/* ── 标签/描述 切换区 — 同一位置，交叉淡入 ────── */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          {/* 默认：4 个技能标签 */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: hovered ? 0 : 1 }}
            transition={transition}
            style={{
              display: "grid",
              gridTemplateColumns: "auto auto",
              justifyContent: "start",
              gap: 4,
              // hover 时不占空间、不可交互
              ...(hovered
                ? { position: "absolute", top: 0, left: 0, pointerEvents: "none" as const }
                : {}),
            }}
          >
            {skills.map((skill, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  height: 28,
                  paddingLeft: 10,
                  paddingRight: 12,
                  borderRadius: 100,
                  background: "rgba(230,233,240,0.6)",
                }}
              >
                <span style={{ flexShrink: 0, display: "flex", width: 14, height: 14 }}>
                  {skill.icon}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: T.secondary,
                    whiteSpace: "nowrap",
                  }}
                >
                  {skill.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* hover：描述文字 */}
          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={transition}
              style={{
                fontSize: 12,
                lineHeight: "20px",
                color: T.secondary,
                margin: 0,
                textAlign: "justify",
                minHeight: 60,
                // 默认时不占空间、不可交互
                ...(!hovered
                  ? { position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "none" as const }
                  : {}),
              }}
            >
              {description}
            </motion.p>
          )}
        </div>

        {/* ── 以下内容：默认 opacity 0，hover 上浮后显现 ── */}

        {/* ③ 数据指标 */}
        {stats && stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={transition}
            style={{ display: "flex", gap: 12, marginTop: 12, flexShrink: 0 }}
          >
            {stats.map((stat, i) => (
              <div key={i} style={{ flex: 1 }}>
                <p
                  style={{
                    fontFamily: FONT_EN,
                    fontSize: 20,
                    lineHeight: "24px",
                    fontWeight: 400,
                    color: T.primary,
                    margin: 0,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    lineHeight: "16px",
                    color: T.secondary,
                    margin: 0,
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* ④ 分割线 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={transition}
          style={{
            width: "100%",
            height: 1,
            background: "rgba(0,0,0,0.08)",
            flexShrink: 0,
            marginTop: 24,
          }}
        />

        {/* ⑤ 展开标签 — 带箭头 */}
        {expandedSkills && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={transition}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 24,
            }}
          >
            {expandedSkills.map((label, i) => {
              const [isHovered, setIsHovered] = React.useState(false);
              return (
              <div
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  onSkillClick?.(label);
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  height: 28,
                  paddingLeft: 12,
                  paddingRight: 8,
                  borderRadius: 100,
                  background: isHovered ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.5)",
                  boxShadow: isHovered ? "0 1px 6px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.04)",
                  cursor: onSkillClick ? "pointer" : "default",
                  transition: "background 100ms, box-shadow 100ms",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    lineHeight: "20px",
                    color: T.primary,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
                <ArrowUpRight />
              </div>
              );
            })}
          </motion.div>
        )}

        {/* 弹性间距 — 把 CTA 推到底部 */}
        <div style={{ flex: 1 }} />

        {/* ⑥ CTA 按钮 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={transition}
          style={{ flexShrink: 0 }}
        >
          <div
            onMouseEnter={(e) => {
              const div = e.currentTarget as HTMLDivElement;
              div.style.background = "rgba(0,0,0,0.85)";
              div.style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)";
            }}
            onMouseLeave={(e) => {
              const div = e.currentTarget as HTMLDivElement;
              div.style.background = "rgba(0,0,0,0.75)";
              div.style.boxShadow = "0 2px 4px -2px rgba(0,0,0,0.2)";
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              height: 44,
              borderRadius: 100,
              background: "rgba(0,0,0,0.75)",
              boxShadow: "0 2px 4px -2px rgba(0,0,0,0.2)",
              cursor: "pointer",
              transition: "background 100ms, box-shadow 100ms",
            }}
          >
            <AiChatIcon />
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                lineHeight: "22px",
                color: "#FFFFFF",
                whiteSpace: "nowrap",
              }}
            >
              {ctaLabel}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── 图标颜色 ────────────────────────────────────────────────────
const ic = "rgba(0,0,0,0.45)";

// ── 预设数据：Rigel 名片 ────────────────────────────────────────
export const RIGEL_DATA: AgentCardProps = {
  name: "Rigel",
  title: "数仓工程专家",
  avatar: "/agents/rigel.png",
  description:
    "擅长数仓建模与全链路工程开发，把业务需求转化为可落地的数据架构，调度、运维、异常处理一手包办",
  stats: [
    { value: "40+", label: "支持建模模式" },
    { value: "80%", label: "减少重复开发" },
    { value: "99.2%", label: "调度成功率" },
  ],
  skills: [
    { label: "需求转数据模型", icon: <IconCatalog size={14} color={ic} /> },
    { label: "生成调度方案", icon: <IconWorkflow size={14} color={ic} /> },
    { label: "自动数仓开发", icon: <IconSQL size={14} color={ic} /> },
    { label: "检测管道异常", icon: <IconOps size={14} color={ic} /> },
  ],
  expandedSkills: [
    "需求转模型",
    "生成调度方案",
    "自动数仓开发",
    "检测管道异常",
    "接入数据源",
    "优化任务性能",
  ],
};

// ── 快捷用法 ────────────────────────────────────────────────────
export function RigelCard({ onClick }: { onClick?: () => void }) {
  return <AgentCard {...RIGEL_DATA} onClick={onClick} />;
}

// ── 预设数据：其他 Agent ────────────────────────────────────────
export const VEGA_DATA: AgentCardProps = {
  name: "Vega",
  title: "数据分析专家",
  avatar: "/agents/vega.png",
  description:
    "精通 SQL 分析与可视化，快速定位业务问题，输出高质量数据洞察报告",
  stats: [
    { value: "200+", label: "分析模板" },
    { value: "90%", label: "自动化率" },
    { value: "3min", label: "平均出报告" },
  ],
  skills: [
    { label: "智能分析", icon: <IconCatalog size={14} color={ic} /> },
    { label: "可视化报告", icon: <IconWorkflow size={14} color={ic} /> },
    { label: "SQL 诊断", icon: <IconSQL size={14} color={ic} /> },
    { label: "异常归因", icon: <IconOps size={14} color={ic} /> },
  ],
  expandedSkills: [
    "智能分析",
    "可视化报告",
    "SQL 诊断",
    "异常归因",
    "趋势预测",
    "数据清洗",
  ],
};

export const ALTAIR_DATA: AgentCardProps = {
  name: "Altair",
  title: "数据治理专家",
  avatar: "/agents/altair.png",
  description:
    "专注数据质量管理、元数据治理和数据安全合规，确保数据资产健康可控",
  stats: [
    { value: "50+", label: "治理规则" },
    { value: "99.5%", label: "质量达标率" },
    { value: "1000+", label: "治理表数" },
  ],
  skills: [
    { label: "质量检测", icon: <IconCatalog size={14} color={ic} /> },
    { label: "元数据管理", icon: <IconWorkflow size={14} color={ic} /> },
    { label: "血缘分析", icon: <IconSQL size={14} color={ic} /> },
    { label: "合规审计", icon: <IconOps size={14} color={ic} /> },
  ],
  expandedSkills: [
    "质量检测",
    "元数据管理",
    "血缘分析",
    "合规审计",
    "安全脱敏",
    "标签治理",
  ],
};

export const SIRIUS_DATA: AgentCardProps = {
  name: "Sirius",
  title: "ML 工程专家",
  avatar: "/agents/sirius.png",
  description:
    "全流程机器学习工程能力，从特征工程到模型部署，快速落地 AI 应用",
  stats: [
    { value: "30+", label: "算法框架" },
    { value: "5x", label: "迭代加速" },
    { value: "98.7%", label: "服务可用率" },
  ],
  skills: [
    { label: "特征工程", icon: <IconCatalog size={14} color={ic} /> },
    { label: "模型训练", icon: <IconMLExp size={14} color={ic} /> },
    { label: "自动调参", icon: <IconSQL size={14} color={ic} /> },
    { label: "模型部署", icon: <IconOps size={14} color={ic} /> },
  ],
  expandedSkills: [
    "特征工程",
    "模型训练",
    "自动调参",
    "模型部署",
    "A/B 实验",
    "模型监控",
  ],
};

// ── 四卡扇形排列组件 ───────────────────────────────────────────
const FAN_CARDS = [
  { data: RIGEL_DATA,  rotate: -10 },
  { data: VEGA_DATA,   rotate: -3  },
  { data: ALTAIR_DATA, rotate: 3   },
  { data: SIRIUS_DATA, rotate: 10  },
];

export function AgentFanCards({ onSkillClick }: { onSkillClick?: (label: string) => void }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const getOffset = (i: number) => {
    if (hoveredIdx === null) return { x: 0 };
    if (i === hoveredIdx) return { x: 0 };
    const dist = Math.abs(i - hoveredIdx);
    if (dist === 1) {
      const dir = i < hoveredIdx ? -1 : 1;
      return { x: dir * 20 };
    }
    if (dist === 2) {
      const dir = i < hoveredIdx ? -1 : 1;
      return { x: dir * 16 };
    }
    return { x: 0 };
  };

  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: 480,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 0,
        position: "relative",
      }}>
        {FAN_CARDS.map(({ data, rotate }, i) => {
          const isHovered = hoveredIdx === i;
          const { x } = getOffset(i);
          return (
            <motion.div
              key={data.name}
              animate={{
                x,
                y: isHovered ? -10 : 0,
                rotate,
                scale: isHovered ? 1.12 : 1,
              }}
              transition={{ duration: DUR.macro, ease: EASE }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                flexShrink: 0,
                marginLeft: i === 0 ? 0 : -8,
                marginTop: (i === 0 || i === 3) ? 30 : 0,
                transformOrigin: "center bottom",
                zIndex: isHovered ? 10 : 1,
                position: "relative",
                boxShadow: isHovered
                  ? "0 32px 64px rgba(0,0,0,0.16), 0 12px 20px rgba(0,0,0,0.08)"
                  : "0 4px 16px rgba(0,0,0,0.06)",
                borderRadius: 24,
                transition: `box-shadow ${DUR.macro}s cubic-bezier(0.4,0,0.2,1)`,
              }}
            >
              <AgentCard {...data} isHovered={isHovered} onSkillClick={onSkillClick} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
