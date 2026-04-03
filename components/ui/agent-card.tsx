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

export interface FanCardsConfig {
  hoverY: number;           // 悬浮上移  默认 -10
  hoverScale: number;       // 悬浮放大  默认 1.2
  dist1X: number;           // 近邻推开  默认 30
  dist2X: number;           // 次邻推开  默认 16
  overlapX: number;         // 卡片重叠  默认 -8
  outerMarginTop: number;   // 外侧卡下沉 默认 30
  animDuration: number;     // 动画时长  默认 0.35
}

export const DEFAULT_FAN_CONFIG: FanCardsConfig = {
  hoverY: -10,
  hoverScale: 1.2,
  dist1X: 30,
  dist2X: 16,
  overlapX: -8,
  outerMarginTop: 30,
  animDuration: 0.35,
};

interface AgentCardProps {
  /** 英文名 */
  name: string;
  /** 英文名颜色（默认蓝色） */
  nameColor?: string;
  /** 中文头衔 */
  title: string;
  /** 头像图片 URL（上层，需透明通道） */
  avatar: string;
  /** 背景图片 URL（底层） */
  bgImage?: string;
  /** 简介描述（hover 展开时替换标签区） */
  description?: string;
  /** 数据指标（hover 展开时显示） */
  stats?: StatItem[];
  /** 默认状态显示的技能标签（带图标） */
  skills: SkillTag[];
  /** hover 展开后显示的全部技能标签（纯文字） */
  expandedSkills?: string[];
  /** 召唤时的引导文案（"告诉我……" 部分） */
  summonText?: string;
  /** CTA 按钮文字 */
  ctaLabel?: string;
  /** 点击回调 */
  onClick?: () => void;
  /** 展开技能标签点击回调 */
  onSkillClick?: (label: string) => void;
  /** CTA「立即召唤」按钮点击回调 */
  onSummon?: () => void;
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
  nameColor,
  title,
  avatar,
  bgImage,
  description,
  stats,
  skills,
  expandedSkills,
  summonText,
  ctaLabel = "立即召唤",
  onClick,
  onSkillClick,
  onSummon,
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
      {/* ── 底层：背景图（可选，透过头像透明区域显现） ───── */}
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
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
      )}
      {/* ── 上层：人物头像 ───────────────────────────────── */}
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
          background: "rgba(255,255,255,0.76)",
          backdropFilter: "blur(20px) saturate(60%)",
          WebkitBackdropFilter: "blur(20px) saturate(60%)",
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
              color: nameColor ?? T.blue,
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
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginTop: 24,
            }}
          >
            {expandedSkills.map((label, i) => {
              const [isHovered, setIsHovered] = React.useState(false);
              return (
              <div
                key={i}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  onSkillClick?.(label);
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
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
            onClick={(e) => { e.stopPropagation(); onSummon?.(); }}
            onMouseEnter={(e) => {
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
  avatar: "/agents/1a.png",
  bgImage: "/agents/1b.png",
  summonText: "今天想开发什么数仓？",
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
    "接入数据源",
    "需求转数据模型",
    "优化任务性能",
    "自动数仓开发",
    "生成调度方案",
    "检测管道异常",
  ],
};

// ── 快捷用法 ────────────────────────────────────────────────────
export function RigelCard({ onClick }: { onClick?: () => void }) {
  return <AgentCard {...RIGEL_DATA} onClick={onClick} />;
}

// ── 预设数据：其他 Agent ────────────────────────────────────────
export const VEGA_DATA: AgentCardProps = {
  name: "Vega",
  nameColor: "#00BBA2",
  title: "数据分析专家",
  avatar: "/agents/2a.png",
  bgImage: "/agents/2b.png",
  summonText: "今天想分析什么数据？",
  description:
    "精通多维数据分析与智能洞察，用自然语言取数，快速识别趋势异常，输出高质量数据报告",
  stats: [
    { value: "200+", label: "分析模板" },
    { value: "90%", label: "自动化率" },
    { value: "3min", label: "平均出报告" },
  ],
  skills: [
    { label: "自然语言取数", icon: <IconCatalog size={14} color={ic} /> },
    { label: "智能趋势分析", icon: <IconWorkflow size={14} color={ic} /> },
    { label: "多维数据洞察", icon: <IconSQL size={14} color={ic} /> },
    { label: "生成数据报告", icon: <IconOps size={14} color={ic} /> },
  ],
  expandedSkills: [
    "异常归因",
    "自然语言取数",
    "指标拆解",
    "智能趋势分析",
    "生成数据报告",
    "多维数据洞察",
  ],
};

export const ORION_DATA: AgentCardProps = {
  name: "Orion",
  nameColor: "#CC6B3A",
  title: "数据治理专家",
  avatar: "/agents/3a.png",
  bgImage: "/agents/3b.png",
  summonText: "今天想治理哪些数据？",
  description:
    "全面覆盖数据质量、血缘追踪与元数据管理，自动识别口径冲突，确保数据资产健康可信",
  stats: [
    { value: "50+", label: "治理规则" },
    { value: "99.5%", label: "质量达标率" },
    { value: "1000+", label: "治理表数" },
  ],
  skills: [
    { label: "监测数据质量", icon: <IconCatalog size={14} color={ic} /> },
    { label: "智能血缘维护", icon: <IconWorkflow size={14} color={ic} /> },
    { label: "自动管理元数据", icon: <IconSQL size={14} color={ic} /> },
    { label: "识别口径冲突", icon: <IconOps size={14} color={ic} /> },
  ],
  expandedSkills: [
    "安全脱敏",
    "自动管理元数据",
    "标签治理",
    "监测数据质量",
    "智能血缘维护",
    "识别口径冲突",
  ],
};

export const NOVA_DATA: AgentCardProps = {
  name: "Nova",
  nameColor: "#934BFF",
  title: "业务运营专家",
  avatar: "/agents/4a.png",
  bgImage: "/agents/4b.png",
  summonText: "今天想运营什么业务？",
  description:
    "专注业务指标监控与运营看板搭建，智能预警异常波动，帮助业务团队快速自助取数、驱动决策",
  stats: [
    { value: "100+", label: "运营模板" },
    { value: "5min", label: "看板搭建" },
    { value: "99%", label: "预警准确率" },
  ],
  skills: [
    { label: "业务指标监控", icon: <IconWorkflow size={14} color={ic} /> },
    { label: "智能异常预警", icon: <IconOps size={14} color={ic} /> },
    { label: "自助取数", icon: <IconCatalog size={14} color={ic} /> },
    { label: "生成运营看板", icon: <IconSQL size={14} color={ic} /> },
  ],
  expandedSkills: [
    "自助取数",
    "业务指标监控",
    "生成运营看板",
    "智能异常预警",
    "目标达成追踪",
    "用户行为分析",
  ],
};

// ── 四卡扇形排列组件 ───────────────────────────────────────────
const FAN_CARDS = [
  { data: RIGEL_DATA, rotate: -10 },
  { data: VEGA_DATA,  rotate: -3  },
  { data: ORION_DATA, rotate: 3   },
  { data: NOVA_DATA,  rotate: 10  },
];

export function AgentFanCards({
  onSkillClick,
  onSummon,
  config = DEFAULT_FAN_CONFIG,
}: {
  onSkillClick?: (label: string, agent: { name: string; title: string; avatar: string; summonText?: string }) => void;
  onSummon?: (agent: { name: string; title: string; avatar: string; summonText?: string }) => void;
  config?: FanCardsConfig;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const getOffset = (i: number) => {
    if (hoveredIdx === null) return { x: 0 };
    if (i === hoveredIdx) return { x: 0 };
    const dist = Math.abs(i - hoveredIdx);
    if (dist === 1) {
      const dir = i < hoveredIdx ? -1 : 1;
      return { x: dir * config.dist1X };
    }
    if (dist === 2) {
      const dir = i < hoveredIdx ? -1 : 1;
      return { x: dir * config.dist2X };
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
                y: isHovered ? config.hoverY : 0,
                rotate,
                scale: isHovered ? config.hoverScale : 1,
              }}
              transition={{ duration: config.animDuration, ease: EASE }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                flexShrink: 0,
                marginLeft: i === 0 ? 0 : config.overlapX,
                marginTop: (i === 0 || i === 3) ? config.outerMarginTop : 0,
                transformOrigin: "center bottom",
                zIndex: isHovered ? 20 : 1,
                position: "relative",
                boxShadow: isHovered
                  ? "0 80px 160px rgba(0,0,0,0.22), 0 32px 64px rgba(0,0,0,0.14)"
                  : "0 2px 8px rgba(0,0,0,0.04)",
                borderRadius: 24,
                transition: `box-shadow ${config.animDuration}s cubic-bezier(0.4,0,0.2,1)`,
              }}
            >
              <AgentCard {...data} isHovered={isHovered} onSkillClick={(label) => onSkillClick?.(label, { name: data.name, title: data.title, avatar: data.avatar, summonText: data.summonText })} onSummon={() => onSummon?.({ name: data.name, title: data.title, avatar: data.avatar, summonText: data.summonText })} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
