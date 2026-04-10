"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconClose, IconArrowRightUp } from "./wedata-icons";

// ── Design DNA tokens ────────────────────────────────────────────
const FONT =
  "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const TEXT_PRIMARY = "rgba(0,0,0,0.9)";
const TEXT_TERTIARY = "rgba(0,0,0,0.5)";
const BG_PANEL = "#ffffff";
const BG_CARD = "#f7f8fb";
const BORDER_PANEL = "#e9ecf1";
const BORDER_CARD = "#e6e9ef";
const HOVER_BG = "rgba(0,0,0,0.04)";
const PANEL_WIDTH = 320;
const HEADER_HEIGHT = 84;
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

// ── File type → accent color mapping ─────────────────────────────
const FILE_TYPE_COLORS: Record<string, string> = {
  html: "#3B82F6",
  sql: "#8B5CF6",
  md: "#10B981",
  notebook: "#F59E0B",
};

function getFileTypeColor(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return FILE_TYPE_COLORS[ext] ?? "#94A3B8";
}

function getFileTypeLabel(filename: string): string {
  const ext = filename.split(".").pop()?.toUpperCase() ?? "";
  return ext;
}

// ── Mock data ────────────────────────────────────────────────────
interface Artifact {
  id: string;
  title: string;
  description: string;
}

const MOCK_ARTIFACTS: Artifact[] = [
  { id: "1", title: "2025年6至7月各地区的复购率设计方案.html", description: "数据读取脚本 · 从源表读取原始数据" },
  { id: "2", title: "clean_null_value.sql", description: "数据清洗脚本 · 空值过滤与格式标准化" },
  { id: "3", title: "read_source_data.sql", description: "数据读取脚本 · 从源表读取原始数据" },
  { id: "4", title: "clean_null_value.md", description: "数据清洗脚本 · 空值过滤与格式标准化" },
  { id: "5", title: "read_source_data.md", description: "数据读取脚本 · 从源表读取原始数据" },
  { id: "6", title: "clean_null_value.sql", description: "数据清洗脚本 · 空值过滤与格式标准化" },
  { id: "7", title: "read_source_data.notebook", description: "数据读取脚本 · 从源表读取原始数据" },
  { id: "8", title: "clean_null_value.notebook", description: "数据清洗脚本 · 空值过滤与格式标准化" },
];

// ── Types ────────────────────────────────────────────────────────
interface ArtifactsPanelProps {
  open: boolean;
  onClose: () => void;
}

// ── Component ────────────────────────────────────────────────────
export default function ArtifactsPanel({ open, onClose }: ArtifactsPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: PANEL_WIDTH, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
          style={{
            height: "100%",
            flexShrink: 0,
            overflow: "hidden",
            background: BG_PANEL,
            borderLeft: `1px solid ${BORDER_PANEL}`,
            fontFamily: FONT,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ── 标题栏 ── */}
          <div
            style={{
              height: HEADER_HEIGHT,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                lineHeight: "26px",
                color: TEXT_PRIMARY,
              }}
            >
              产物
            </span>
            <CloseButton onClick={onClose} />
          </div>

          {/* ── 产物列表 ── */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "0 24px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              scrollbarWidth: "none",
            }}
          >
            {MOCK_ARTIFACTS.map((a) => (
              <ArtifactItem key={a.id} artifact={a} />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Close button (32×32) ─────────────────────────────────────────
function CloseButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type="button"
      aria-label="关闭产物面板"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 32,
        height: 32,
        borderRadius: 100,
        border: "none",
        background: hovered ? HOVER_BG : "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        transition: "background 0.15s ease",
        flexShrink: 0,
      }}
    >
      <IconClose size={16} color={TEXT_TERTIARY} />
    </button>
  );
}

// ── Artifact card (64px) ─────────────────────────────────────────
function ArtifactItem({ artifact }: { artifact: Artifact }) {
  const [hovered, setHovered] = React.useState(false);
  const accentColor = getFileTypeColor(artifact.title);
  const typeLabel = getFileTypeLabel(artifact.title);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 64,
        borderRadius: 16,
        background: hovered ? "#f0f2f5" : BG_CARD,
        border: `0.5px solid ${BORDER_CARD}`,
        display: "flex",
        alignItems: "center",
        padding: "12px 16px 12px 88px",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        transition: "background 0.15s ease",
        flexShrink: 0,
      }}
    >
      {/* ── 左侧文件类型图标（倾斜卡片） ── */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: "50%",
          transform: "translateY(-50%) rotate(-15deg)",
          width: 42,
          height: 54,
          borderRadius: 8,
          background: BG_PANEL,
          border: "0.5px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 4px -1px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: accentColor,
            letterSpacing: "0.02em",
            transform: "rotate(15deg)",
          }}
        >
          {typeLabel}
        </span>
      </div>

      {/* ── 文字区域 ── */}
      <div
        style={{
          flex: "1 0 0",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            lineHeight: "22px",
            color: TEXT_PRIMARY,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {artifact.title}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 400,
            lineHeight: "20px",
            color: TEXT_TERTIARY,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {artifact.description}
        </span>
      </div>

      {/* ── 右侧箭头 ── */}
      <div style={{ flexShrink: 0, marginLeft: 8 }}>
        <IconArrowRightUp size={16} color={TEXT_TERTIARY} />
      </div>
    </div>
  );
}
