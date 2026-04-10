"use client";

import React from "react";
import { IconAiNewChat, IconData } from "./wedata-icons";

// ── Design DNA tokens ────────────────────────────────────────────
const TEXT_PRIMARY = "rgba(0,0,0,0.9)";
const ICON_COLOR = "rgba(0,0,0,0.5)";
const HOVER_ICON_BTN = "rgba(0,0,0,0.05)";
const FONT_HEADING =
  "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const BTN_SIZE = 44;
const ICON_SIZE = 16;

// ── Types ────────────────────────────────────────────────────────
interface ChatTitlebarProps {
  title?: string;
  onNewChat?: () => void;
  onArtifacts?: () => void;
}

// ── Component ────────────────────────────────────────────────────
export default function ChatTitlebar({
  title,
  onNewChat,
  onArtifacts,
}: ChatTitlebarProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "20px 16px",
        fontFamily: FONT_HEADING,
      }}
    >
      {/* ── Center: Title (flex-1, text-center) ── */}
      <p
        style={{
          flex: "1 0 0",
          fontSize: 18,
          fontWeight: 600,
          lineHeight: "26px",
          color: TEXT_PRIMARY,
          textAlign: "center",
          margin: 0,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </p>

      {/* ── Right: Action buttons ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexShrink: 0,
        }}
      >
        {/* 新建对话 — 默认隐藏，hover titlebar 时显示 */}
        <ActionButton
          onClick={onNewChat}
          label="新建对话"
          style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.2s ease" }}
        >
          <IconAiNewChat size={ICON_SIZE} color={ICON_COLOR} />
        </ActionButton>

        {/* 产物 — 常显 */}
        <ActionButton onClick={onArtifacts} label="产物">
          <IconData size={ICON_SIZE} color={ICON_COLOR} />
        </ActionButton>
      </div>
    </div>
  );
}

// ── Pill icon button ─────────────────────────────────────────────
function ActionButton({
  children,
  onClick,
  label,
  style: extraStyle,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
  style?: React.CSSProperties;
}) {
  const [btnHovered, setBtnHovered] = React.useState(false);

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setBtnHovered(true)}
      onMouseLeave={() => setBtnHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: BTN_SIZE,
        height: BTN_SIZE,
        borderRadius: 100,
        border: "none",
        background: btnHovered ? HOVER_ICON_BTN : "transparent",
        cursor: "pointer",
        padding: 0,
        transition: "background 0.15s ease",
        ...extraStyle,
      }}
    >
      {children}
    </button>
  );
}
