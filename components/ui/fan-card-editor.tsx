/**
 * ⚠️ 删除指南（耦合性：零，可随时安全删除）
 *
 * 1. 删除本文件：components/ui/fan-card-editor.tsx
 * 2. app/page.tsx 中移除：
 *    - import FanCardEditor from "@/components/ui/fan-card-editor"
 *    - <FanCardEditor config={fanConfig} onChange={setFanConfig} onHoverChange={setIsEditorHovered} />
 *    - 相关 state（如仅此处使用）：fanConfig / setFanConfig / isEditorHovered / setIsEditorHovered
 */
"use client";

import React, { useState, useId, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, RotateCcw, Settings } from "lucide-react";
import { FanCardsConfig, DEFAULT_FAN_CONFIG } from "@/components/ui/agent-card";

// ── Design tokens ──────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ── 参数配置 ───────────────────────────────────────────────────────
interface ParameterDef {
  key: keyof FanCardsConfig;
  label: string;
  min: number;
  max: number;
  step: number;
}

interface ParameterGroup {
  label: string;
  params: ParameterDef[];
}

const PARAMETER_GROUPS: ParameterGroup[] = [
  {
    label: "扇形布局",
    params: [
      { key: "overlapX", label: "卡片重叠", min: -30, max: 20, step: 1 },
    ],
  },
  {
    label: "扇形角度",
    params: [
      { key: "rotateOuter", label: "外侧旋转", min: 0, max: 30, step: 1 },
      { key: "rotateInner", label: "内侧旋转", min: 0, max: 15, step: 1 },
      { key: "outerCardOffset", label: "外侧下沉", min: 0, max: 60, step: 1 },
    ],
  },
  {
    label: "Hover 推开",
    params: [
      { key: "dist1X", label: "近邻推开", min: 0, max: 60, step: 1 },
      { key: "dist2X", label: "次邻推开", min: 0, max: 40, step: 1 },
    ],
  },
  {
    label: "悬浮物理",
    params: [
      { key: "hoverHeight", label: "悬浮高度", min: 0, max: 1.4, step: 0.05 },
      { key: "yFactor", label: "Y偏移系数", min: 0, max: 80, step: 1 },
      { key: "scaleFactor", label: "放大系数", min: 0, max: 0.8, step: 0.02 },
    ],
  },
  {
    label: "Hover 投影",
    params: [
      { key: "shadowBlur1Range", label: "主投影模糊", min: 0, max: 300, step: 2 },
      { key: "shadowY1Range", label: "主投影Y偏移", min: 0, max: 150, step: 1 },
      { key: "shadowAlpha1Range", label: "主投影透明度", min: 0, max: 0.5, step: 0.01 },
      { key: "shadowBlur2Range", label: "副投影模糊", min: 0, max: 150, step: 2 },
      { key: "shadowY2Range", label: "副投影Y偏移", min: 0, max: 80, step: 1 },
      { key: "shadowAlpha2Range", label: "副投影透明度", min: 0, max: 0.3, step: 0.01 },
    ],
  },
  {
    label: "静态投影",
    params: [
      { key: "restShadowY", label: "投影Y", min: 0, max: 20, step: 1 },
      { key: "restShadowBlur", label: "投影模糊", min: 0, max: 40, step: 1 },
      { key: "restShadowAlpha", label: "投影透明度", min: 0, max: 0.2, step: 0.01 },
    ],
  },
  {
    label: "信息区毛玻璃",
    params: [
      { key: "infoFromOpacity", label: "渐变起始透明度", min: 0, max: 1, step: 0.05 },
      { key: "infoToOpacity", label: "渐变结束透明度", min: 0, max: 1, step: 0.05 },
      { key: "infoBlur", label: "高斯模糊", min: 0, max: 60, step: 1 },
      { key: "infoSaturate", label: "饱和度", min: 0, max: 300, step: 5 },
    ],
  },
  {
    label: "动画",
    params: [
      { key: "fanTransitionDuration", label: "推开时长", min: 0.1, max: 1.0, step: 0.05 },
      { key: "hoverTransitionDuration", label: "浮起时长", min: 0.1, max: 1.0, step: 0.05 },
    ],
  },
];

// 所有参数的扁平列表（用于代码生成和全量 reset 等）
const ALL_PARAMETERS = PARAMETER_GROUPS.flatMap(g => g.params);

interface FanCardEditorProps {
  config: FanCardsConfig;
  onChange: (config: FanCardsConfig) => void;
  onHoverChange?: (isHovered: boolean) => void;
}

export default function FanCardEditor({ config, onChange, onHoverChange }: FanCardEditorProps) {
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    // 默认全部收起
    const init: Record<string, boolean> = {};
    PARAMETER_GROUPS.forEach((g) => { init[g.label] = true; });
    return init;
  });
  const sliderId = useId();

  const toggleGroup = useCallback((label: string) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const handleCollapse = useCallback(() => {
    // 关键：收起时立即释放卡片 hover 状态
    onHoverChange?.(false);
    setIsCollapsed(true);
  }, [onHoverChange]);

  const handleExpand = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  const handleSliderChange = (key: keyof FanCardsConfig, value: number) => {
    onChange({ ...config, [key]: value });
  };

  const handleResetParameter = (key: keyof FanCardsConfig) => {
    onChange({ ...config, [key]: DEFAULT_FAN_CONFIG[key] });
  };

  const handleMouseEnter = () => onHoverChange?.(true);
  const handleMouseLeave = () => onHoverChange?.(false);

  const generateCode = () => {
    const fmt = (key: keyof FanCardsConfig) => {
      const p = ALL_PARAMETERS.find(p => p.key === key);
      if (!p) return String(config[key]);
      return p.step < 1 ? config[key].toFixed(2) : String(config[key]);
    };
    const lines = Object.keys(DEFAULT_FAN_CONFIG).map(k => {
      const key = k as keyof FanCardsConfig;
      return `  ${key}: ${fmt(key)},`;
    });
    return `export const DEFAULT_FAN_CONFIG: FanCardsConfig = {\n${lines.join("\n")}\n};`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode());
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const getPercent = (param: ParameterDef) =>
    ((config[param.key] - param.min) / (param.max - param.min)) * 100;

  const cls = `fan-slider-${sliderId.replace(/:/g, "")}`;

  const renderSlider = (param: ParameterDef) => {
    const pct = getPercent(param);
    const isDefault = config[param.key] === DEFAULT_FAN_CONFIG[param.key];
    return (
      <div key={param.key} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.65)", display: "flex", alignItems: "baseline", gap: 4 }}>
            {param.label}
            <span style={{ fontSize: 9, fontWeight: 400, color: "rgba(0,0,0,0.28)", fontFamily: "'Monaco', 'Menlo', monospace" }}>
              {param.key}
            </span>
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 500,
              color: isDefault ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.7)",
              fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
              minWidth: 32,
              textAlign: "right",
              transition: "color 100ms",
            }}>
              {config[param.key].toFixed(param.step < 1 ? 2 : 0)}
            </span>
            {!isDefault && (
              <button
                onClick={() => handleResetParameter(param.key)}
                title="重置为默认值"
                style={{
                  width: 18, height: 18,
                  border: "none",
                  background: "rgba(0,0,0,0.05)",
                  borderRadius: 4,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(0,0,0,0.4)",
                  transition: "all 100ms",
                  padding: 0, flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "rgba(0,0,0,0.7)";
                  e.currentTarget.style.background = "rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(0,0,0,0.4)";
                  e.currentTarget.style.background = "rgba(0,0,0,0.05)";
                }}
              >
                <RotateCcw size={11} />
              </button>
            )}
          </div>
        </div>

        <input
          type="range"
          className={cls}
          min={param.min}
          max={param.max}
          step={param.step}
          value={config[param.key]}
          onChange={(e) => handleSliderChange(param.key, parseFloat(e.target.value))}
          style={{
            background: `linear-gradient(to right, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.22) ${pct}%, #E6E9EF ${pct}%, #E6E9EF 100%)`,
          }}
        />
      </div>
    );
  };

  return (
    <>
      {/* 注入 range slider 伪元素样式（始终存在，避免展开时闪烁） */}
      <style>{`
        .${cls} {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          margin: 6px 0;
          padding: 0;
          border: none;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          vertical-align: middle;
        }
        .${cls}::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 2px;
          background: transparent;
        }
        .${cls}::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          margin-top: -5px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid rgba(0,0,0,0.22);
          box-shadow: 0 1px 4px rgba(0,0,0,0.12);
          cursor: pointer;
          transition: border-color 120ms, box-shadow 120ms, transform 120ms;
        }
        .${cls}::-webkit-slider-thumb:hover {
          border-color: rgba(0,0,0,0.4);
          box-shadow: 0 1px 6px rgba(0,0,0,0.2);
          transform: scale(1.1);
        }
        .${cls}::-webkit-slider-thumb:active {
          border-color: rgba(0,0,0,0.5);
          transform: scale(0.95);
        }
        .${cls}::-moz-range-track {
          height: 4px;
          border: none;
          border-radius: 2px;
          background: #E6E9EF;
        }
        .${cls}::-moz-range-progress {
          height: 4px;
          border-radius: 2px;
          background: rgba(0,0,0,0.22);
        }
        .${cls}::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid rgba(0,0,0,0.22);
          box-shadow: 0 1px 4px rgba(0,0,0,0.12);
          cursor: pointer;
        }
      `}</style>

      <AnimatePresence mode="wait">
        {isCollapsed ? (
          /* ── 收起态：右下角黑色小圆球 ── */
          <motion.button
            key="collapsed-ball"
            initial={{
              opacity: 0,
              scale: 0.2,
              y: 0,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              // 打开：圆球飞向右上角，放大，变白，消失
              opacity: 0,
              scale: 2.5,
              y: "-65vh",
              backgroundColor: "rgba(255,255,255,0.72)",
            }}
            transition={{
              duration: 0.45,
              ease: [0.2, 0.8, 0.3, 1],
            }}
            onClick={handleExpand}
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: "rgba(0,0,0,0.82)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.85)",
              zIndex: 10,
              transition: "box-shadow 150ms, transform 150ms",
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.32)";
              e.currentTarget.style.transform += " scale(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.2)";
              e.currentTarget.style.transform = e.currentTarget.style.transform.replace(/ scale\(1\.08\)/, "");
            }}
            title="打开卡片参数编辑器"
          >
            <Settings size={15} strokeWidth={2.2} />
          </motion.button>
        ) : (
          /* ── 展开态：完整面板 ── */
          <motion.div
            key="expanded-panel"
            initial={{ opacity: 0, scale: 0.6, y: 40 }}
            animate={{ opacity: 1, y: 0, scale: 1, backgroundColor: "rgba(255,255,255,0.72)" }}
            exit={{
              // 收起：面板飞向右下角，缩成圆，变黑
              opacity: 0,
              scale: 0.12,
              y: "68vh",
              x: 85,
              borderRadius: 200,
              backgroundColor: "rgba(0,0,0,0.82)",
            }}
            transition={{
              duration: 0.55,
              ease: [0.4, 0, 0.65, 0.1],
            }}
            drag
            dragElastic={0.15}
            dragMomentum={false}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 260,
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(20px) saturate(60%)",
              WebkitBackdropFilter: "blur(20px) saturate(60%)",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              overflow: "hidden",
              fontFamily: FONT,
              zIndex: 10,
              cursor: "grab",
            }}
          >
            {/* ── 头部 ── */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Settings size={13} color="rgba(0,0,0,0.45)" strokeWidth={2} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(0,0,0,0.85)" }}>
                  卡片参数
                </span>
              </div>
              <button
                onClick={handleCollapse}
                style={{
                  width: 20, height: 20,
                  border: "none", background: "transparent",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 0, color: "rgba(0,0,0,0.35)",
                  borderRadius: 4,
                  transition: "color 100ms, background 100ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "rgba(0,0,0,0.7)";
                  e.currentTarget.style.background = "rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(0,0,0,0.35)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                ×
              </button>
            </div>

            {/* ── 参数区（可滚动） ── */}
            <div style={{ maxHeight: "60vh", overflowY: "auto", overflowX: "hidden" }}>
              {PARAMETER_GROUPS.map((group) => {
                const isGroupCollapsed = collapsedGroups[group.label] ?? false;
                return (
                  <div key={group.label} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                    {/* 分组标题 — 可折叠 */}
                    <button
                      onClick={() => toggleGroup(group.label)}
                      style={{
                        width: "100%",
                        padding: "7px 12px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        color: "rgba(0,0,0,0.45)",
                        fontFamily: FONT,
                        transition: "background 100ms",
                        letterSpacing: "0.02em",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{
                        display: "inline-block",
                        transition: "transform 200ms",
                        transform: isGroupCollapsed ? "rotate(0deg)" : "rotate(90deg)",
                        fontSize: 9,
                      }}>
                        ▶
                      </span>
                      <span>{group.label}</span>
                      <span style={{ fontSize: 9, color: "rgba(0,0,0,0.25)", fontWeight: 400 }}>
                        {group.params.length}
                      </span>
                    </button>

                    {/* 参数滑块 */}
                    <AnimatePresence>
                      {!isGroupCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: EASE }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{ padding: "2px 12px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
                            {group.params.map(renderSlider)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* ── 代码区 — 可折叠 ── */}
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
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(0,0,0,0.5)",
                  fontFamily: FONT,
                  transition: "background 100ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{
                  display: "inline-block",
                  transition: "transform 200ms",
                  transform: isCodeExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  fontSize: 10,
                }}>
                  ▶
                </span>
                <span>代码</span>
              </button>

              <AnimatePresence>
                {isCodeExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{
                      padding: "8px 12px 10px",
                      backgroundColor: "rgba(0,0,0,0.025)",
                      borderTop: "1px solid rgba(0,0,0,0.04)",
                      position: "relative",
                    }}>
                      <div style={{
                        fontSize: 9,
                        fontFamily: "'Monaco', 'Menlo', monospace",
                        color: "rgba(0,0,0,0.3)",
                        marginBottom: 6,
                        lineHeight: 1,
                      }}>
                        agent-card.tsx → DEFAULT_FAN_CONFIG
                      </div>
                      <pre style={{
                        margin: 0,
                        fontSize: 10,
                        fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                        color: "rgba(0,0,0,0.65)",
                        lineHeight: 1.5,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        paddingRight: 32,
                      }}>
                        {generateCode()}
                      </pre>

                      <button
                        onClick={handleCopy}
                        title={copyFeedback ? "已复制" : "复制代码"}
                        style={{
                          position: "absolute",
                          top: 8, right: 8,
                          width: 26, height: 26,
                          border: "none",
                          background: copyFeedback ? "rgba(34,197,94,0.1)" : "rgba(0,0,0,0.06)",
                          borderRadius: 6,
                          cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: copyFeedback ? "#22C55E" : "rgba(0,0,0,0.4)",
                          transition: "all 150ms",
                        }}
                        onMouseEnter={(e) => !copyFeedback && (e.currentTarget.style.background = "rgba(0,0,0,0.1)")}
                        onMouseLeave={(e) => !copyFeedback && (e.currentTarget.style.background = copyFeedback ? "rgba(34,197,94,0.1)" : "rgba(0,0,0,0.06)")}
                      >
                        {copyFeedback ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
