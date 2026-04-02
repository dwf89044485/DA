"use client";

import React from "react";
import { IconAiNewChat, IconAiHistory } from "./wedata-icons";

// ── Design DNA tokens ────────────────────────────────────────────
const TEXT_PRIMARY = "rgba(0,0,0,0.9)";
const ICON_COLOR = "rgba(0,0,0,0.5)";
const HOVER_ICON_BTN = "rgba(0,0,0,0.05)";
const FONT_HEADING = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_ACCENT = "var(--font-pixelify-sans), 'Pixelify Sans', sans-serif";
const ACCENT_DEFAULT = "#2873FF";
const HEADER_HEIGHT = 84;
const BTN_SIZE = 44;
const AVATAR_SIZE = 32;

// ── Types ────────────────────────────────────────────────────────
interface ChatTitlebarProps {
  agent: {
    name: string;       // "Rigel"
    title: string;      // "数仓工程专家"
    avatar: string;     // "/agents/rigel.png"
    nameColor?: string; // "#2873FF"
  };
  onNewChat?: () => void;
  onHistory?: () => void;
}

// ── Component ────────────────────────────────────────────────────
export default function ChatTitlebar({ agent, onNewChat, onHistory }: ChatTitlebarProps) {
  const nameColor = agent.nameColor ?? ACCENT_DEFAULT;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: HEADER_HEIGHT,
        width: "100%",
        fontFamily: FONT_HEADING,
      }}
    >
      {/* ── Left: Avatar + Title + Name ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Circular avatar — crops the head from the full-body illustration */}
        <div
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img
            src={agent.avatar}
            alt={agent.name}
            style={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              objectFit: "cover",
              objectPosition: "top center",
              display: "block",
            }}
          />
        </div>

        {/* Title + Name */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              lineHeight: "26px",
              color: TEXT_PRIMARY,
            }}
          >
            {agent.title}
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 500,
              lineHeight: "24px",
              fontFamily: FONT_ACCENT,
              color: nameColor,
            }}
          >
            {agent.name}
          </span>
        </div>
      </div>

      {/* ── Right: Action buttons ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        <ActionButton onClick={onNewChat} label="新建对话">
          <IconAiNewChat size={20} color={ICON_COLOR} />
        </ActionButton>
        <ActionButton onClick={onHistory} label="历史记录">
          <IconAiHistory size={20} color={ICON_COLOR} />
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
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: BTN_SIZE,
        height: BTN_SIZE,
        borderRadius: 100,
        border: "none",
        background: hovered ? HOVER_ICON_BTN : "transparent",
        cursor: "pointer",
        padding: 0,
        transition: "background 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}
