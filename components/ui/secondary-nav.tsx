"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// ── Design tokens ──────────────────────────────────────────────
const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_SF = "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const C = {
  bg: "#F9FAFC",
  borderColor: "#E6E9EF",
  textPrimary: "rgba(0,0,0,0.9)",
  textTertiary: "rgba(0,0,0,0.5)",
  hoverBg: "#ECEEF2",
  badgeBg: "#F64041",
  badgeText: "rgba(255,255,255,0.9)",
  btnBorder: "#EDF0F5",
  btnShadow: "0px 2px 4px -2px rgba(0,0,0,0.12)",
  btnGradient: "linear-gradient(180deg, #FFFFFF 4.3%, #FAFBFC 56.93%)",
} as const;

// ── Animation constants ───────────────────────────────────────
const COLLAPSE_DURATION = 0.22;
const COLLAPSE_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const CONTENT_FADE = 0.18;
const COLLAPSED_WIDTH = 80;
const EXPANDED_WIDTH = 320;

// ── Status icon types ──────────────────────────────────────────
type TaskStatus = "loading" | "pending" | "check";

// ── Icon components (inline SVG with Figma path data) ──────────

function IconLoading({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <style>{`@keyframes sec-nav-spin { to { transform: rotate(360deg); } }`}</style>
      <g style={{ transformOrigin: "center", animation: "sec-nav-spin 1.2s linear infinite" }}>
        <path d="M8 1.5C4.41038 1.5 1.5 4.41038 1.5 8C1.5 11.5896 4.41038 14.5 8 14.5V12.875C5.30761 12.875 3.125 10.6924 3.125 8C3.125 5.30761 5.30761 3.125 8 3.125C10.6924 3.125 12.875 5.30761 12.875 8H14.5C14.5 4.41038 11.5896 1.5 8 1.5Z" fill="#00B6C3"/>
      </g>
    </svg>
  );
}

function IconPending({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="5" stroke="#FF8800" strokeWidth="1.2" strokeDasharray="3 2.5" fill="none"/>
    </svg>
  );
}

function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M13.3137 4.943L6.24264 12.014L2 7.771L2.943 6.828L6.243 10.128L12.371 4L13.3137 4.943Z" fill="rgba(0,0,0,0.9)"/>
    </svg>
  );
}

function IconAiNewChat({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <g clipPath="url(#clip-ai-new-chat)">
        <path d="M5 7.5H8M8 7.5H11M8 7.5V4.5M8 7.5V10.5M8 1C12.0041 1 15.25 4.01408 15.25 7.73214C15.25 11.4502 12.0041 14.4643 8 14.4643C7.80723 14.4643 7.61621 14.4573 7.42722 14.4436C6.44468 14.3725 5.9534 14.337 5.69885 14.3823C5.60769 14.3985 5.58792 14.403 5.49882 14.4282C5.25 14.4985 4.9782 14.6554 4.4346 14.9692L4.27661 15.0604C4.07539 15.1766 3.97478 15.2347 3.89246 15.2351C3.78021 15.2358 3.67635 15.1758 3.62077 15.0783C3.58001 15.0067 3.58001 14.8906 3.58001 14.6582C3.58001 14.1771 3.58001 13.9366 3.54677 13.7533C3.48736 13.4256 3.45186 13.3321 3.27898 13.0475C3.18227 12.8883 2.92112 12.5936 2.39883 12.0044C1.36886 10.8424 0.75 9.35476 0.75 7.73214C0.75 4.01408 3.99594 1 8 1Z" stroke="rgba(0,0,0,0.7)" strokeWidth="1.33" fill="none"/>
      </g>
      <defs>
        <clipPath id="clip-ai-new-chat">
          <rect width="16" height="16" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}

function IconFolder({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M4.358 2C4.736 2 4.99 1.998 5.239 2.034C5.789 2.114 6.312 2.331 6.757 2.664C6.958 2.814 7.137 2.996 7.404 3.263L7.475 3.332H7.577C7.524 3.334 7.497 3.334 7.577 3.334H11.333C11.942 3.334 12.467 3.332 12.884 3.389C13.321 3.447 13.741 3.58 14.081 3.92C14.42 4.26 14.553 4.679 14.612 5.115C14.668 5.533 14.667 6.057 14.667 6.667V8C14.667 9.238 14.668 10.235 14.563 11.016C14.455 11.816 14.225 12.49 13.69 13.025C13.155 13.56 12.481 13.789 11.681 13.897C10.9 14.002 9.905 14 8.667 14H7.333C6.094 14 5.099 14.002 4.318 13.897C3.518 13.789 2.844 13.56 2.309 13.025C1.774 12.49 1.544 11.816 1.436 11.016C1.331 10.235 1.333 9.238 1.333 8V4.782C1.333 4.428 1.332 4.123 1.352 3.873C1.373 3.616 1.418 3.36 1.541 3.112C1.735 2.721 2.053 2.402 2.445 2.208C2.692 2.086 2.948 2.04 3.206 2.02C3.456 2 3.761 2 4.115 2H4.358ZM2.667 7.334V8C2.667 9.276 2.668 10.167 2.758 10.838C2.846 11.49 3.006 11.835 3.252 12.081C3.498 12.327 3.844 12.488 4.496 12.575C5.167 12.666 6.057 12.667 7.333 12.667H8.667C9.942 12.667 10.832 12.666 11.503 12.575C12.156 12.488 12.501 12.327 12.747 12.081C12.993 11.835 13.153 11.49 13.241 10.838C13.331 10.167 13.333 9.276 13.333 8V7.334H2.667ZM4.115 3.334C3.739 3.334 3.497 3.334 3.312 3.349C3.135 3.363 3.069 3.387 3.037 3.403C2.906 3.468 2.801 3.574 2.736 3.704C2.72 3.736 2.695 3.802 2.681 3.98C2.666 4.164 2.667 4.407 2.667 4.782V6H13.328C13.323 5.707 13.315 5.48 13.29 5.293C13.251 5.004 13.188 4.913 13.137 4.862C13.087 4.812 12.996 4.749 12.708 4.71C12.399 4.669 11.98 4.667 11.333 4.667H7.577C7.497 4.667 7.391 4.669 7.285 4.653C7.064 4.622 6.855 4.535 6.677 4.401C6.592 4.337 6.518 4.262 6.461 4.205C6.167 3.911 6.065 3.811 5.959 3.731C5.691 3.532 5.378 3.402 5.047 3.355C4.916 3.336 4.774 3.334 4.358 3.334H4.115Z" fill="rgba(0,0,0,0.9)"/>
    </svg>
  );
}

function IconChevronDown({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M10.242 4.57L7.033 7.778L3.825 4.57L3 5.395L7.033 9.428L11.067 5.395L10.242 4.57Z" fill="rgba(0,0,0,0.5)"/>
    </svg>
  );
}

function IconChevronRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M4.57 10.242L7.778 7.033L4.57 3.825L5.395 3L9.428 7.033L5.395 11.067L4.57 10.242Z" fill="rgba(0,0,0,0.5)"/>
    </svg>
  );
}

function IconSidebarPanel({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-0.335 -1.335 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M5.665 0.665002V12.665M2.165 3.665H4.165M2.165 6.665H4.165M4.665 12.665H10.665C12.5506 12.665 13.4934 12.665 14.0792 12.0792C14.665 11.4934 14.665 10.5506 14.665 8.665V4.665C14.665 2.77938 14.665 1.83657 14.0792 1.25079C13.4934 0.665002 12.5506 0.665002 10.665 0.665002H4.665C2.77938 0.665002 1.83657 0.665002 1.25079 1.25079C0.665002 1.83657 0.665002 2.77938 0.665002 4.665V8.665C0.665002 10.5506 0.665002 11.4934 1.25079 12.0792C1.83657 12.665 2.77938 12.665 4.665 12.665Z" stroke="rgba(0,0,0,0.9)" strokeWidth="1.33"/>
    </svg>
  );
}

// ── Status icon renderer ───────────────────────────────────────
function StatusIcon({ status }: { status: TaskStatus }) {
  switch (status) {
    case "loading": return <IconLoading />;
    case "pending": return <IconPending />;
    case "check":   return <IconCheck />;
  }
}

// ── Badge component ────────────────────────────────────────────
function Badge({ count }: { count: number }) {
  return (
    <div style={{
      width: 16, height: 16, borderRadius: 100,
      backgroundColor: C.badgeBg,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: FONT, fontSize: 12, fontWeight: 500,
        lineHeight: "20px", color: C.badgeText,
      }}>
        {count}
      </span>
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ padding: "24px 12px 8px", width: "100%" }}>
      <span style={{
        fontFamily: FONT, fontSize: 12, fontWeight: 400,
        lineHeight: "20px", color: C.textTertiary,
      }}>
        {label}
      </span>
    </div>
  );
}

// ── Task item ──────────────────────────────────────────────────
function TaskItem({ status, title, badge, indented }: {
  status: TaskStatus;
  title: string;
  badge?: number;
  indented?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 34, display: "flex", alignItems: "center",
        paddingLeft: indented ? 36 : 12, paddingRight: 12,
        borderRadius: 20, cursor: "pointer",
        backgroundColor: hovered ? C.hoverBg : "transparent",
        transition: "background 100ms", width: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 0 0", minWidth: 0 }}>
        <StatusIcon status={status} />
        <span style={{
          fontFamily: FONT, fontSize: 14, fontWeight: 400,
          lineHeight: "22px", color: C.textPrimary,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          flex: "1 0 0", minWidth: 0,
        }}>
          {title}
        </span>
        {badge !== undefined && <Badge count={badge} />}
      </div>
    </div>
  );
}

// ── More link ──────────────────────────────────────────────────
function MoreLink({ count }: { count: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 34, display: "flex", alignItems: "center",
        paddingLeft: 12, paddingRight: 12, borderRadius: 20,
        cursor: "pointer", backgroundColor: hovered ? C.hoverBg : "transparent",
        transition: "background 100ms", width: "100%",
      }}
    >
      <span style={{
        fontFamily: FONT, fontSize: 12, fontWeight: 400,
        lineHeight: "20px", color: C.textTertiary,
      }}>
        更多({count})
      </span>
    </div>
  );
}

// ── Folder item ────────────────────────────────────────────────
function FolderItem({ name, expanded, onToggle, children }: {
  name: string;
  expanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <>
      <div
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          height: 34, display: "flex", alignItems: "center",
          paddingLeft: 12, paddingRight: 12, borderRadius: 20,
          cursor: "pointer", backgroundColor: hovered ? C.hoverBg : "transparent",
          transition: "background 100ms", width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 0 0", minWidth: 0 }}>
          <IconFolder />
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{
              fontFamily: FONT, fontSize: 14, fontWeight: 400,
              lineHeight: "22px", color: C.textPrimary,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {name}
            </span>
            {expanded ? <IconChevronDown /> : <IconChevronRight />}
          </div>
        </div>
      </div>
      {expanded && children}
    </>
  );
}

// ── Icon button for collapsed toolbar ──────────────────────────
function ToolbarButton({ onClick, title, children }: {
  onClick?: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={title}
      style={{
        width: 40, height: 40, borderRadius: 20,
        border: "none", background: hovered ? C.hoverBg : "transparent",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        padding: 0, transition: "background 100ms", flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────
interface SecondaryNavProps {
  onToggle?: () => void;
}

export default function SecondaryNav({ onToggle }: SecondaryNavProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [folder1Open, setFolder1Open] = useState(true);
  const [folder2Open, setFolder2Open] = useState(true);

  const contentFade: React.CSSProperties = {
    transition: `opacity ${CONTENT_FADE}s ease`,
    pointerEvents: "auto",
  };

  return (
    <motion.div
      animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH, minWidth: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      transition={{ duration: COLLAPSE_DURATION, ease: COLLAPSE_EASE }}
      style={{
        height: "100vh",
        backgroundColor: C.bg,
        borderRight: `1px solid ${C.borderColor}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        fontFamily: FONT,
        userSelect: "none",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── 标题栏 (84px) ── */}
      <div style={{
        height: 84, flexShrink: 0,
        display: "flex", alignItems: "center",
        overflow: "hidden", position: "relative",
      }}>
        {/* 展开态标题栏 */}
        <div style={{
          ...contentFade,
          position: "absolute", inset: 0,
          opacity: collapsed ? 0 : 1,
          pointerEvents: collapsed ? "none" : "auto",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "0 16px",
        }}>
          <div style={{
            height: 44, display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 8px" }}>
              <span style={{
                fontFamily: FONT_SF, fontSize: 18, fontWeight: 600,
                lineHeight: "26px", color: C.textPrimary, whiteSpace: "nowrap",
              }}>
                DataBuddy
              </span>
            </div>
            <ToolbarButton onClick={() => setCollapsed(true)} title="收起面板">
              <IconSidebarPanel />
            </ToolbarButton>
          </div>
        </div>

        {/* 收起态工具栏：新建 + 展开 */}
        <div style={{
          ...contentFade,
          position: "absolute", inset: 0,
          opacity: collapsed ? 1 : 0,
          pointerEvents: collapsed ? "auto" : "none",
          display: "flex", alignItems: "center",
          padding: "0 8px",
        }}>
          <ToolbarButton onClick={onToggle} title="新建对话">
            <IconAiNewChat />
          </ToolbarButton>
          <ToolbarButton onClick={() => setCollapsed(false)} title="展开面板">
            <IconSidebarPanel />
          </ToolbarButton>
        </div>
      </div>

      {/* ── 新建任务按钮（展开态） ── */}
      <div style={{
        ...contentFade,
        opacity: collapsed ? 0 : 1,
        pointerEvents: collapsed ? "none" : "auto",
        padding: "0 12px", flexShrink: 0,
        height: collapsed ? 0 : "auto",
        overflow: "hidden",
      }}>
        <button style={{
          width: "100%", height: 44, borderRadius: 100,
          border: `1px solid ${C.btnBorder}`, background: C.btnGradient,
          boxShadow: C.btnShadow, display: "flex", alignItems: "center",
          justifyContent: "center", gap: 8, cursor: "pointer",
          padding: "8px 20px", outline: "none",
        }}>
          <IconAiNewChat />
          <span style={{
            fontFamily: FONT, fontSize: 14, fontWeight: 500,
            lineHeight: "22px", color: C.textPrimary,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            新建任务
          </span>
        </button>
      </div>

      {/* ── 可滚动列表区（展开态） ── */}
      <div style={{
        ...contentFade,
        flex: 1,
        opacity: collapsed ? 0 : 1,
        pointerEvents: collapsed ? "none" : "auto",
        overflowY: "auto", overflowX: "hidden",
        padding: "0 12px", scrollbarWidth: "none",
      }}>
        <SectionHeader label="最近任务" />
        <TaskItem status="loading" title="ETL 开发_订单数据同步流程项目" />
        <TaskItem status="pending" title="统计近 7 天各渠道用户支付金额，按天汇总，输出可直接使用的 SQL 与结果" />
        <TaskItem status="check" title="接入业务库【订单表】数据源：自动识别表结构与数据质量，生成标准数仓模型，配置 T+1 同步任务" badge={1} />
        <TaskItem status="check" title="接入业务库【用户表】数据源：自动识别表结构与数据质量，生成标准数仓模型，配置 T+1 同步任务" badge={1} />
        <TaskItem status="check" title="猫眼_客户留存指标分析" />
        <TaskItem status="check" title="T+1调度工作流编排" />
        <MoreLink count={7} />

        <SectionHeader label="文件空间" />
        <FolderItem name="junyangliu_dev" expanded={folder1Open} onToggle={() => setFolder1Open(v => !v)}>
          <TaskItem indented status="check" title="基于用户复购、订单、活跃数据，搭建业务监控看板：包含趋势图、明细表、核心指标卡片" badge={2} />
          <TaskItem indented status="pending" title="用户复购率指标开发" />
          <TaskItem indented status="check" title="猫眼_客户留存率指标血缘分析" />
          <TaskItem indented status="check" title="零售业务_月度库存健康度指标开发" />
        </FolderItem>

        <FolderItem name="junyangliu_test" expanded={folder2Open} onToggle={() => setFolder2Open(v => !v)}>
          <TaskItem indented status="check" title="基于用户复购、订单、活跃数据，搭建业务监控看板：包含趋势图、明细表、核心指标卡片" badge={2} />
          <TaskItem indented status="pending" title="用户复购率指标开发" />
          <TaskItem indented status="check" title="猫眼_客户留存率指标血缘分析" />
        </FolderItem>

        <FolderItem name="junyangliu001" expanded={false} onToggle={() => {}} />
        <FolderItem name="junyangliu002" expanded={false} onToggle={() => {}} />
        <FolderItem name="junyangliu003" expanded={false} onToggle={() => {}} />
      </div>
    </motion.div>
  );
}
