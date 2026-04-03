"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Copy, Check } from "lucide-react";
import { FanCardsConfig, DEFAULT_FAN_CONFIG } from "@/components/ui/agent-card";

// ── Design tokens ──────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ── 参数配置 ───────────────────────────────────────────────────────
interface ParameterDef {
  key: keyof FanCardsConfig;
  label: string;
  category: "动效" | "布局";
  min: number;
  max: number;
  step: number;
}

const PARAMETERS: ParameterDef[] = [
  { key: "hoverY", label: "悬浮高度", category: "动效", min: -40, max: 0, step: 1 },
  { key: "hoverScale", label: "悬浮放大", category: "动效", min: 0.8, max: 1.5, step: 0.05 },
  { key: "animDuration", label: "动画时长", category: "动效", min: 0.1, max: 0.8, step: 0.05 },
  { key: "dist1X", label: "近邻推开", category: "布局", min: 0, max: 60, step: 1 },
  { key: "dist2X", label: "次邻推开", category: "布局", min: 0, max: 40, step: 1 },
  { key: "overlapX", label: "卡片重叠", category: "布局", min: -30, max: 0, step: 1 },
  { key: "outerMarginTop", label: "外侧下沉", category: "布局", min: 0, max: 60, step: 1 },
];

interface FanCardEditorProps {
  config: FanCardsConfig;
  onChange: (config: FanCardsConfig) => void;
  hidden?: boolean;
}

export default function FanCardEditor({ config, onChange, hidden = false }: FanCardEditorProps) {
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleSliderChange = (key: keyof FanCardsConfig, value: number) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  const generateCode = () => {
    return `const DEFAULT_FAN_CONFIG = {
  hoverY: ${config.hoverY},
  hoverScale: ${config.hoverScale},
  dist1X: ${config.dist1X},
  dist2X: ${config.dist2X},
  overlapX: ${config.overlapX},
  outerMarginTop: ${config.outerMarginTop},
  animDuration: ${config.animDuration},
};`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode());
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  if (hidden) return null;

  const groupedParams = {
    "动效": PARAMETERS.filter(p => p.category === "动效"),
    "布局": PARAMETERS.filter(p => p.category === "布局"),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: EASE }}
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        width: 232,
        borderRadius: 12,
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(20px) saturate(60%)",
        WebkitBackdropFilter: "blur(20px) saturate(60%)",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        overflow: "hidden",
        fontFamily: FONT,
        zIndex: 10,
      }}
    >
      {/* 头部 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 12px",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <span style={{
            fontSize: 14,
            fontWeight: 500,
            color: "rgba(0,0,0,0.9)",
          }}>
            ⚙ 卡片参数
          </span>
        </div>
        <button style={{
          width: 20,
          height: 20,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          color: "rgba(0,0,0,0.45)",
          transition: "color 100ms",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.7)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.45)")}
        >
          ×
        </button>
      </div>

      {/* 内容区 */}
      <div style={{ padding: "12px" }}>
        {/* 各分类参数 */}
        {(Object.entries(groupedParams) as Array<[string, ParameterDef[]]>).map(([category, params]) => (
          <div key={category} style={{ marginBottom: 12 }}>
            {/* 分类标题 */}
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(0,0,0,0.45)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 6,
            }}>
              {category}
            </div>

            {/* 参数列表 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {params.map((param) => (
                <div key={param.key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {/* 标签 + 值 */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <label style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "rgba(0,0,0,0.7)",
                    }}>
                      {param.label}
                    </label>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "rgba(0,0,0,0.5)",
                      fontFamily: "var(--font-pixelify-sans), 'Pixelify Sans', sans-serif",
                      minWidth: 32,
                      textAlign: "right",
                    }}>
                      {config[param.key].toFixed(param.step < 1 ? 2 : 0)}
                    </span>
                  </div>

                  {/* 滑块 */}
                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={config[param.key]}
                    onChange={(e) => handleSliderChange(param.key, parseFloat(e.target.value))}
                    style={{
                      width: "100%",
                      height: 4,
                      borderRadius: 2,
                      background: "linear-gradient(to right, #E6E9EF 0%, #E6E9EF calc((100% - var(--value, 0) * 100%)), rgba(0,0,0,0.2) calc((100% - var(--value, 0) * 100%)), rgba(0,0,0,0.2) 100%)",
                      WebkitAppearance: "none",
                      appearance: "none",
                      cursor: "pointer",
                      outlineOffset: 2,
                      "--value": ((config[param.key] - param.min) / (param.max - param.min)).toString(),
                    } as React.CSSProperties}
                  />
                </div>
              ))}
            </div>

            {category === "布局" && <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "8px 0" }} />}
          </div>
        ))}
      </div>

      {/* 代码区 - 可折叠 */}
      <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <button
          onClick={() => setIsCodeExpanded(!isCodeExpanded)}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 12,
            fontWeight: 500,
            color: "rgba(0,0,0,0.6)",
            transition: "background 100ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.03)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span>▶ 代码（点击展开）</span>
        </button>

        {/* 代码块 - 展开时显示 */}
        {isCodeExpanded && (
          <motion.div
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: 500 }}
            exit={{ opacity: 0, maxHeight: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              padding: "8px 12px",
              backgroundColor: "rgba(0,0,0,0.02)",
              borderTop: "1px solid rgba(0,0,0,0.06)",
              position: "relative",
            }}>
              {/* 代码内容 */}
              <pre style={{
                margin: 0,
                fontSize: 10,
                fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                color: "rgba(0,0,0,0.7)",
                lineHeight: "1.4",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}>
                {generateCode()}
              </pre>

              {/* 复制按钮 */}
              <button
                onClick={handleCopy}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 28,
                  height: 28,
                  border: "none",
                  background: copyFeedback ? "rgba(34, 197, 94, 0.1)" : "rgba(0,0,0,0.08)",
                  borderRadius: 6,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: copyFeedback ? "#22C55E" : "rgba(0,0,0,0.45)",
                  transition: "all 100ms",
                }}
                onMouseEnter={(e) => !copyFeedback && (e.currentTarget.style.background = "rgba(0,0,0,0.12)")}
                onMouseLeave={(e) => !copyFeedback && (e.currentTarget.style.background = "rgba(0,0,0,0.08)")}
              >
                {copyFeedback ? (
                  <Check size={14} />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
