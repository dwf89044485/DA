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

// ── Inline SVG icons ───────────────────────────────────────────
function IconLoading({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, animation: "spin 1.2s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path
        d="M8 1.5A6.5 6.5 0 1 0 14.5 8"
        stroke="#1664FF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPending({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="4.5" stroke="#D6DBE3" strokeWidth="1" fill="none" />
    </svg>
  );
}

function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M4.5 8.5L6.5 10.5L11.5 5.5"
        stroke="rgba(0,0,0,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconAiNewChat({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M8 2V14M2 8H14" stroke="rgba(0,0,0,0.7)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconFolder({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M2 4.5C2 3.67 2.67 3 3.5 3H6.29a1 1 0 0 1 .7.29L8 4.3h4.5c.83 0 1.5.67 1.5 1.5v5.7c0 .83-.67 1.5-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5V4.5Z"
        stroke="rgba(0,0,0,0.5)"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

function IconChevronDown({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M4 5.5L7 8.5L10 5.5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M5.5 4L8.5 7L5.5 10" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSidebarPanel({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="rgba(0,0,0,0.5)" strokeWidth="1" fill="none" />
      <line x1="6" y1="3" x2="6" y2="13" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
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
