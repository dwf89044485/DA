"use client";

import React, { useState } from "react";

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

// ── Status icon types ──────────────────────────────────────────
type TaskStatus = "loading" | "pending" | "check";

// ── Icon components (inline SVG with Figma path data) ──────────

/** 旋转弧线 — loading 状态（来自 Figma node 111:21571，teal 色弧） */
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

/** 虚线圆圈 — pending 状态（来自 Figma node 111:21575，橙色虚线圆） */
function IconPending({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="5" stroke="#FF8800" strokeWidth="1.2" strokeDasharray="3 2.5" fill="none"/>
    </svg>
  );
}

/** 对勾 — check/完成状态（来自 Figma node 111:21582） */
function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M13.3137 4.943L6.24264 12.014L2 7.771L2.943 6.828L6.243 10.128L12.371 4L13.3137 4.943Z" fill="rgba(0,0,0,0.9)"/>
    </svg>
  );
}

/** AI 新建对话图标（来自 Figma node 111:21505，气泡+十字） */
function IconAiNewChat({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <g clipPath="url(#clip-ai-new-chat)">
        <path d="M3.54677 13.7533L4.20111 13.6347L3.54677 13.7533ZM2.39883 12.0044L1.90118 12.4455L2.39883 12.0044ZM3.27898 13.0475L2.71062 13.3927V13.3927L3.27898 13.0475ZM4.27661 15.0604L4.6091 15.6363L4.6091 15.6363L4.27661 15.0604ZM3.89246 15.2351L3.88874 14.5701L3.89246 15.2351ZM3.62077 15.0783L4.19853 14.749V14.749L3.62077 15.0783ZM7.42722 14.4436L7.37921 15.1069L7.42722 14.4436ZM5.69885 14.3823L5.58235 13.7276L5.69885 14.3823ZM4.4346 14.9692L4.10212 14.3933L4.10211 14.3933L4.4346 14.9692ZM5.49882 14.4282L5.3181 13.7882L5.49882 14.4282ZM8 1V1.665C11.6841 1.665 14.585 4.4269 14.585 7.73214H15.25H15.915C15.915 3.60126 12.3241 0.335 8 0.335V1ZM15.25 7.73214H14.585C14.585 11.0374 11.6841 13.7993 8 13.7993V14.4643V15.1293C12.3241 15.1293 15.915 11.863 15.915 7.73214H15.25ZM8 14.4643V13.7993C7.82324 13.7993 7.64823 13.7929 7.47522 13.7804L7.42722 14.4436L7.37921 15.1069C7.58418 15.1217 7.79121 15.1293 8 15.1293V14.4643ZM4.4346 14.9692L4.10211 14.3933L3.94412 14.4845L4.27661 15.0604L4.6091 15.6363L4.76709 15.5451L4.4346 14.9692ZM2.39883 12.0044L2.89647 11.5633C1.96637 10.514 1.415 9.1806 1.415 7.73214H0.75H0.085C0.085 9.52891 0.771349 11.1708 1.90118 12.4455L2.39883 12.0044ZM0.75 7.73214H1.415C1.415 4.4269 4.31594 1.665 8 1.665V1V0.335C3.67594 0.335 0.085 3.60126 0.085 7.73214H0.75ZM3.58001 14.6582H4.24501C4.24501 14.2096 4.24782 13.8923 4.20111 13.6347L3.54677 13.7533L2.89244 13.8719C2.9122 13.9809 2.91501 14.1447 2.91501 14.6582H3.58001ZM2.39883 12.0044L1.90118 12.4455C2.1642 12.7422 2.35502 12.9575 2.49261 13.1188C2.63835 13.2896 2.69387 13.3651 2.71062 13.3927L3.27898 13.0475L3.84734 12.7022C3.76738 12.5706 3.64397 12.4192 3.50439 12.2556C3.35665 12.0824 3.15575 11.8558 2.89647 11.5633L2.39883 12.0044ZM3.54677 13.7533L4.20111 13.6347C4.17033 13.4649 4.13807 13.3088 4.07718 13.1483C4.0163 12.9879 3.93689 12.8496 3.84734 12.7022L3.27898 13.0475L2.71062 13.3927C2.79395 13.5299 2.81873 13.5807 2.83367 13.6201C2.84861 13.6595 2.86381 13.714 2.89244 13.8719L3.54677 13.7533ZM4.27661 15.0604L3.94413 14.4845C3.89261 14.5142 3.85306 14.5371 3.81903 14.5561C3.78478 14.5752 3.76439 14.5858 3.75207 14.5917C3.73922 14.5979 3.74603 14.5936 3.76591 14.5876C3.78765 14.581 3.83078 14.5705 3.88874 14.5701L3.89246 15.2351L3.89617 15.9001C4.08803 15.899 4.24242 15.8316 4.32782 15.7906C4.41661 15.748 4.5178 15.689 4.6091 15.6363L4.27661 15.0604ZM3.58001 14.6582H2.91501C2.91501 14.7636 2.91455 14.8807 2.92202 14.979C2.9292 15.0734 2.94801 15.2408 3.04301 15.4075L3.62077 15.0783L4.19853 14.749C4.22723 14.7994 4.23967 14.842 4.24483 14.8641C4.24955 14.8843 4.24927 14.8924 4.24819 14.8781C4.24715 14.8645 4.24614 14.8416 4.24558 14.8023C4.24502 14.7634 4.24501 14.7177 4.24501 14.6582H3.58001ZM3.89246 15.2351L3.88874 14.5701C4.01673 14.5694 4.13516 14.6378 4.19853 14.749L3.62077 15.0783L3.04301 15.4075C3.21754 15.7138 3.54368 15.9021 3.89617 15.9001L3.89246 15.2351ZM7.42722 14.4436L7.47522 13.7804C6.98815 13.7451 6.60832 13.7176 6.31905 13.7049C6.04295 13.6929 5.78981 13.6906 5.58235 13.7276L5.69885 14.3823L5.81535 15.037C5.86245 15.0286 5.98222 15.0215 6.26103 15.0337C6.52667 15.0453 6.88375 15.0711 7.37921 15.1069L7.42722 14.4436ZM4.4346 14.9692L4.76709 15.5451C5.34716 15.2102 5.53105 15.1101 5.67954 15.0682L5.49882 14.4282L5.3181 13.7882C4.96894 13.8868 4.60923 14.1005 4.10212 14.3933L4.4346 14.9692ZM5.69885 14.3823L5.58235 13.7276C5.46955 13.7476 5.42835 13.7571 5.3181 13.7882L5.49882 14.4282L5.67954 15.0682C5.7241 15.0556 5.73713 15.0523 5.74686 15.05C5.75659 15.0478 5.76977 15.0451 5.81535 15.037L5.69885 14.3823ZM5 7.5V8.165H8V7.5V6.835H5V7.5ZM8 7.5V8.165H11V7.5V6.835H8V7.5ZM8 4.5H7.335V7.5H8H8.665V4.5H8ZM8 7.5H7.335V10.5H8H8.665V7.5H8Z" fill="rgba(0,0,0,0.9)"/>
      </g>
      <defs>
        <clipPath id="clip-ai-new-chat">
          <rect width="16" height="16" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}

/** 文件夹图标（来自 Figma node 111:21621） */
function IconFolder({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M4.358 2C4.736 2 4.99 1.998 5.239 2.034C5.789 2.114 6.312 2.331 6.757 2.664C6.958 2.814 7.137 2.996 7.404 3.263L7.475 3.332H7.577C7.524 3.334 7.497 3.334 7.577 3.334H11.333C11.942 3.334 12.467 3.332 12.884 3.389C13.321 3.447 13.741 3.58 14.081 3.92C14.42 4.26 14.553 4.679 14.612 5.115C14.668 5.533 14.667 6.057 14.667 6.667V8C14.667 9.238 14.668 10.235 14.563 11.016C14.455 11.816 14.225 12.49 13.69 13.025C13.155 13.56 12.481 13.789 11.681 13.897C10.9 14.002 9.905 14 8.667 14H7.333C6.094 14 5.099 14.002 4.318 13.897C3.518 13.789 2.844 13.56 2.309 13.025C1.774 12.49 1.544 11.816 1.436 11.016C1.331 10.235 1.333 9.238 1.333 8V4.782C1.333 4.428 1.332 4.123 1.352 3.873C1.373 3.616 1.418 3.36 1.541 3.112C1.735 2.721 2.053 2.402 2.445 2.208C2.692 2.086 2.948 2.04 3.206 2.02C3.456 2 3.761 2 4.115 2H4.358ZM2.667 7.334V8C2.667 9.276 2.668 10.167 2.758 10.838C2.846 11.49 3.006 11.835 3.252 12.081C3.498 12.327 3.844 12.488 4.496 12.575C5.167 12.666 6.057 12.667 7.333 12.667H8.667C9.942 12.667 10.832 12.666 11.503 12.575C12.156 12.488 12.501 12.327 12.747 12.081C12.993 11.835 13.153 11.49 13.241 10.838C13.331 10.167 13.333 9.276 13.333 8V7.334H2.667ZM4.115 3.334C3.739 3.334 3.497 3.334 3.312 3.349C3.135 3.363 3.069 3.387 3.037 3.403C2.906 3.468 2.801 3.574 2.736 3.704C2.72 3.736 2.695 3.802 2.681 3.98C2.666 4.164 2.667 4.407 2.667 4.782V6H13.328C13.323 5.707 13.315 5.48 13.29 5.293C13.251 5.004 13.188 4.913 13.137 4.862C13.087 4.812 12.996 4.749 12.708 4.71C12.399 4.669 11.98 4.667 11.333 4.667H7.577C7.497 4.667 7.391 4.669 7.285 4.653C7.064 4.622 6.855 4.535 6.677 4.401C6.592 4.337 6.518 4.262 6.461 4.205C6.167 3.911 6.065 3.811 5.959 3.731C5.691 3.532 5.378 3.402 5.047 3.355C4.916 3.336 4.774 3.334 4.358 3.334H4.115Z" fill="rgba(0,0,0,0.9)"/>
    </svg>
  );
}

/** 下箭头（来自 Figma node 111:21628） */
function IconChevronDown({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M10.242 4.57L7.033 7.778L3.825 4.57L3 5.395L7.033 9.428L11.067 5.395L10.242 4.57Z" fill="rgba(0,0,0,0.5)"/>
    </svg>
  );
}

/** 右箭头（来自 Figma node 111:21688） */
function IconChevronRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M4.57 10.242L7.778 7.033L4.57 3.825L5.395 3L9.428 7.033L5.395 11.067L4.57 10.242Z" fill="rgba(0,0,0,0.5)"/>
    </svg>
  );
}

/** 侧边栏面板图标（来自 Figma node 111:21486，原始 Figma 路径） */
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
    <div style={{
      padding: "24px 12px 8px",
      width: "100%",
    }}>
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
        height: 34,
        display: "flex",
        alignItems: "center",
        paddingLeft: indented ? 36 : 12,
        paddingRight: 12,
        borderRadius: 20,
        cursor: "pointer",
        backgroundColor: hovered ? C.hoverBg : "transparent",
        transition: "background 100ms",
        width: "100%",
      }}
    >
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        flex: "1 0 0", minWidth: 0,
      }}>
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
        height: 34,
        display: "flex",
        alignItems: "center",
        paddingLeft: 12, paddingRight: 12,
        borderRadius: 20,
        cursor: "pointer",
        backgroundColor: hovered ? C.hoverBg : "transparent",
        transition: "background 100ms",
        width: "100%",
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
          height: 34,
          display: "flex",
          alignItems: "center",
          paddingLeft: 12, paddingRight: 12,
          borderRadius: 20,
          cursor: "pointer",
          backgroundColor: hovered ? C.hoverBg : "transparent",
          transition: "background 100ms",
          width: "100%",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          flex: "1 0 0", minWidth: 0,
        }}>
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

// ── Main component ─────────────────────────────────────────────
interface SecondaryNavProps {
  onToggle?: () => void;
}

export default function SecondaryNav({ onToggle }: SecondaryNavProps) {
  const [folder1Open, setFolder1Open] = useState(true);
  const [folder2Open, setFolder2Open] = useState(true);

  return (
    <div style={{
      width: 320,
      height: "100vh",
      backgroundColor: C.bg,
      borderRight: `1px solid ${C.borderColor}`,
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      fontFamily: FONT,
      userSelect: "none",
      overflow: "hidden",
    }}>

      {/* ── 标题栏 (84px) ── */}
      <div style={{
        height: 84,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 16px",
      }}>
        <div style={{
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "0 8px",
          }}>
            <span style={{
              fontFamily: FONT_SF, fontSize: 18, fontWeight: 600,
              lineHeight: "26px", color: C.textPrimary,
              whiteSpace: "nowrap",
            }}>
              DataBuddy
            </span>
          </div>
          <div
            onClick={onToggle}
            style={{
              width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 20,
              cursor: "pointer",
            }}
          >
            <IconSidebarPanel />
          </div>
        </div>
      </div>

      {/* ── 新建任务按钮 ── */}
      <div style={{ padding: "0 12px", flexShrink: 0 }}>
        <button style={{
          width: "100%",
          height: 44,
          borderRadius: 100,
          border: `1px solid ${C.btnBorder}`,
          background: C.btnGradient,
          boxShadow: C.btnShadow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          cursor: "pointer",
          padding: "8px 20px",
          outline: "none",
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

      {/* ── 可滚动列表区 ── */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        padding: "0 12px",
        scrollbarWidth: "none",
      }}>

        {/* 最近任务 */}
        <SectionHeader label="最近任务" />
        <TaskItem status="loading" title="ETL 开发_订单数据同步流程项目" />
        <TaskItem status="pending" title="统计近 7 天各渠道用户支付金额，按天汇总，输出可直接使用的 SQL 与结果" />
        <TaskItem status="check" title="接入业务库【订单表】数据源：自动识别表结构与数据质量，生成标准数仓模型，配置 T+1 同步任务" badge={1} />
        <TaskItem status="check" title="接入业务库【用户表】数据源：自动识别表结构与数据质量，生成标准数仓模型，配置 T+1 同步任务" badge={1} />
        <TaskItem status="check" title="猫眼_客户留存指标分析" />
        <TaskItem status="check" title="T+1调度工作流编排" />
        <MoreLink count={7} />

        {/* 文件空间 */}
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

        <FolderItem name="junyangliu001" expanded={false} onToggle={() => {}}>
        </FolderItem>

        <FolderItem name="junyangliu002" expanded={false} onToggle={() => {}}>
        </FolderItem>

        <FolderItem name="junyangliu003" expanded={false} onToggle={() => {}}>
        </FolderItem>

      </div>
    </div>
  );
}
