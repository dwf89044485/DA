"use client";

import React, { useState, useRef, useId, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, MousePointer, RotateCcw, X } from "lucide-react";

// ── Shared types (consumed by other components via re-export) ─────
export interface MotionParamDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  group: string;
}

export interface MotionStateDef {
  value: string;
  label: string;
}

export interface MotionTargetDef {
  id: string;
  label: string;
  schema: MotionParamDef[];
  defaultConfig: Record<string, number>;
  states?: MotionStateDef[];
  defaultState?: string;
}

export type MotionMode = "idle" | "selecting" | "editing";

// ── Design tokens ──────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const FONT =
  "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ── Props ──────────────────────────────────────────────────────────
interface MotionStateOption {
  value: string;
  label: string;
}

interface MotionPanelProps {
  targetLabel: string;
  schema: MotionParamDef[];
  config: Record<string, number>;
  defaultConfig: Record<string, number>;
  onChange: (config: Record<string, number>) => void;
  stateOptions?: MotionStateOption[];
  selectedState?: string;
  onStateChange?: (state: string) => void;
  onClose: () => void;
}

// ── Sub-component: StepButton ──────────────────────────────────────
function StepButton({
  direction,
  onClick,
}: {
  direction: "minus" | "plus";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === "minus" ? "减少" : "增加"}
      style={{
        width: 16,
        height: 16,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "rgba(0,0,0,0.03)",
        borderRadius: 4,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        flexShrink: 0,
        fontSize: 12,
        lineHeight: 1,
        fontWeight: 600,
        color: "rgba(0,0,0,0.40)",
        transition: "all 100ms",
        fontFamily: "'Monaco', 'Menlo', monospace",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "rgba(0,0,0,0.7)";
        e.currentTarget.style.background = "rgba(0,0,0,0.08)";
        e.currentTarget.style.borderColor = "rgba(0,0,0,0.18)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "rgba(0,0,0,0.40)";
        e.currentTarget.style.background = "rgba(0,0,0,0.03)";
        e.currentTarget.style.borderColor = "rgba(0,0,0,0.10)";
      }}
    >
      {direction === "minus" ? "−" : "+"}
    </button>
  );
}

// ── Sub-component: EditableValue ───────────────────────────────────
function EditableValue({
  value,
  decimals,
  isDefault,
  onCommit,
}: {
  value: number;
  decimals: number;
  isDefault: boolean;
  onCommit: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(value.toFixed(decimals));
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  };

  const commit = () => {
    setEditing(false);
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) onCommit(parsed);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        style={{
          width: 38,
          height: 16,
          fontSize: 11,
          fontWeight: 500,
          fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
          textAlign: "center",
          border: "1px solid rgba(0,0,0,0.18)",
          borderRadius: 3,
          outline: "none",
          background: "#fff",
          color: "rgba(0,0,0,0.7)",
          padding: "0 2px",
        }}
      />
    );
  }

  return (
    <span
      onClick={startEdit}
      title="点击编辑"
      style={{
        fontSize: 11,
        fontWeight: 500,
        color: isDefault ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.7)",
        fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
        minWidth: 32,
        textAlign: "center",
        transition: "color 100ms",
        cursor: "text",
        borderRadius: 3,
        padding: "0 2px",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(0,0,0,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {value.toFixed(decimals)}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────
export default function MotionPanel({
  targetLabel,
  schema,
  config,
  defaultConfig,
  onChange,
  stateOptions,
  selectedState,
  onStateChange,
  onClose,
}: MotionPanelProps) {
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >(() => {
    const init: Record<string, boolean> = {};
    for (const p of schema) {
      if (!(p.group in init)) {
        init[p.group] = true;
      }
    }
    return init;
  });
  const sliderId = useId();

  const toggleGroup = useCallback((label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const handleSliderChange = (key: string, value: number) => {
    onChange({ ...config, [key]: value });
  };

  const handleResetParameter = (key: string) => {
    onChange({ ...config, [key]: defaultConfig[key] });
  };

  const handleResetAll = () => {
    onChange({ ...defaultConfig });
  };

  const getPercent = (param: MotionParamDef) =>
    ((config[param.key] - param.min) / (param.max - param.min)) * 100;

  const hasAnyChange = schema.some(
    (p) => config[p.key] !== defaultConfig[p.key]
  );

  const cls = `motion-slider-${sliderId.replace(/:/g, "")}`;

  // Build ordered groups from schema, preserving first-appearance order
  const groups = useMemo(() => {
    const result: { label: string; params: MotionParamDef[] }[] = [];
    const map = new Map<string, MotionParamDef[]>();
    for (const p of schema) {
      let arr = map.get(p.group);
      if (!arr) {
        arr = [];
        map.set(p.group, arr);
        result.push({ label: p.group, params: arr });
      }
      arr.push(p);
    }
    return result;
  }, [schema]);

  const generateCode = useMemo(() => {
    const fmt = (key: string) => {
      const p = schema.find((s) => s.key === key);
      if (!p) return String(config[key]);
      return p.step < 1 ? config[key].toFixed(2) : String(config[key]);
    };
    const lines = Object.keys(config).map((k) => `  ${k}: ${fmt(k)},`);
    return `// ${targetLabel} → config\nexport const config = {\n${lines.join("\n")}\n};`;
  }, [config, schema, targetLabel]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const renderSlider = (param: MotionParamDef) => {
    const pct = getPercent(param);
    const isDefault = config[param.key] === defaultConfig[param.key];
    const decimals = param.step < 1 ? 2 : 0;

    const clampAndSet = (raw: number) => {
      const clamped = Math.min(param.max, Math.max(param.min, raw));
      const rounded = parseFloat(clamped.toFixed(decimals));
      handleSliderChange(param.key, rounded);
    };

    return (
      <div
        key={param.key}
        style={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <label
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "rgba(0,0,0,0.65)",
              display: "flex",
              alignItems: "baseline",
              gap: 4,
            }}
          >
            {param.label}
            <span
              style={{
                fontSize: 9,
                fontWeight: 400,
                color: "rgba(0,0,0,0.28)",
                fontFamily: "'Monaco', 'Menlo', monospace",
              }}
            >
              {param.key}
            </span>
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            {!isDefault && (
              <button
                onClick={() => handleResetParameter(param.key)}
                title="重置为默认值"
                style={{
                  width: 18,
                  height: 18,
                  border: "none",
                  background: "rgba(0,0,0,0.05)",
                  borderRadius: 4,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(0,0,0,0.4)",
                  transition: "all 100ms",
                  padding: 0,
                  flexShrink: 0,
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
            <StepButton
              direction="minus"
              onClick={() => clampAndSet(config[param.key] - param.step)}
            />
            <EditableValue
              value={config[param.key]}
              decimals={decimals}
              isDefault={isDefault}
              onCommit={clampAndSet}
            />
            <StepButton
              direction="plus"
              onClick={() => clampAndSet(config[param.key] + param.step)}
            />
          </div>
        </div>

        <input
          type="range"
          className={cls}
          min={param.min}
          max={param.max}
          step={param.step}
          value={config[param.key]}
          onChange={(e) =>
            handleSliderChange(param.key, parseFloat(e.target.value))
          }
          style={{
            background: `linear-gradient(to right, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.22) ${pct}%, #E6E9EF ${pct}%, #E6E9EF 100%)`,
          }}
        />
      </div>
    );
  };

  return (
    <>
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
          width: 8px;
          height: 16px;
          margin-top: -6px;
          border-radius: 4px;
          background: #fff;
          border: 1.5px solid rgba(0,0,0,0.22);
          box-shadow: 0 1px 4px rgba(0,0,0,0.12);
          cursor: pointer;
          transition: border-color 120ms, box-shadow 120ms, transform 120ms;
        }
        .${cls}::-webkit-slider-thumb:hover {
          border-color: rgba(0,0,0,0.4);
          box-shadow: 0 1px 6px rgba(0,0,0,0.2);
          transform: scaleX(1.15);
        }
        .${cls}::-webkit-slider-thumb:active {
          border-color: rgba(0,0,0,0.5);
          transform: scaleY(0.9);
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
          width: 8px;
          height: 16px;
          border-radius: 4px;
          background: #fff;
          border: 1.5px solid rgba(0,0,0,0.22);
          box-shadow: 0 1px 4px rgba(0,0,0,0.12);
          cursor: pointer;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 40 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.6, y: 40 }}
        transition={{ duration: 0.35, ease: EASE }}
        drag
        dragElastic={0.15}
        dragMomentum={false}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 260,
          borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.80)",
          backdropFilter: "blur(13px) saturate(90%)",
          WebkitBackdropFilter: "blur(13px) saturate(90%)",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          overflow: "hidden",
          fontFamily: FONT,
          zIndex: 10,
          cursor: "grab",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(0,0,0,0.85)",
            }}
          >
            {targetLabel}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {hasAnyChange && (
              <button
                onClick={handleResetAll}
                title="全部重置为默认值"
                style={{
                  width: 20,
                  height: 20,
                  border: "none",
                  background: "rgba(0,0,0,0.05)",
                  borderRadius: 4,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  flexShrink: 0,
                  color: "rgba(0,0,0,0.4)",
                  transition: "all 100ms",
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
                <RotateCcw size={12} />
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                width: 20,
                height: 20,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                color: "rgba(0,0,0,0.35)",
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
              <X size={13} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {stateOptions && selectedState !== undefined && onStateChange && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: "10px 12px",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(0,0,0,0.45)",
                letterSpacing: "0.02em",
              }}
            >
              组件状态
            </span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {stateOptions.map((option) => {
                const isSelected = option.value === selectedState;
                return (
                  <button
                    key={option.value}
                    onClick={() => onStateChange(option.value)}
                    style={{
                      border: "none",
                      borderRadius: 999,
                      padding: "4px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      color: isSelected ? "#FFFFFF" : "rgba(0,0,0,0.6)",
                      background: isSelected ? "#1664FF" : "rgba(0,0,0,0.06)",
                      transition: "all 120ms",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "rgba(0,0,0,0.10)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "rgba(0,0,0,0.06)";
                      }
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Parameter groups ── */}
        <div
          style={{
            maxHeight: "60vh",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {groups.map((group) => {
            const isGroupCollapsed = collapsedGroups[group.label] ?? true;
            return (
              <div
                key={group.label}
                style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
              >
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
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(0,0,0,0.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span
                    style={{
                      display: "inline-block",
                      transition: "transform 200ms",
                      transform: isGroupCollapsed
                        ? "rotate(0deg)"
                        : "rotate(90deg)",
                      fontSize: 9,
                    }}
                  >
                    ▶
                  </span>
                  <span>{group.label}</span>
                  <span
                    style={{
                      fontSize: 9,
                      color: "rgba(0,0,0,0.25)",
                      fontWeight: 400,
                    }}
                  >
                    {group.params.length}
                  </span>
                </button>

                <AnimatePresence>
                  {!isGroupCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        style={{
                          padding: "2px 12px 10px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {group.params.map(renderSlider)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* ── Code section ── */}
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
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(0,0,0,0.03)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span
              style={{
                display: "inline-block",
                transition: "transform 200ms",
                transform: isCodeExpanded
                  ? "rotate(90deg)"
                  : "rotate(0deg)",
                fontSize: 10,
              }}
            >
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
                <div
                  style={{
                    padding: "8px 12px 10px",
                    backgroundColor: "rgba(0,0,0,0.025)",
                    borderTop: "1px solid rgba(0,0,0,0.04)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      fontFamily: "'Monaco', 'Menlo', monospace",
                      color: "rgba(0,0,0,0.3)",
                      marginBottom: 6,
                      lineHeight: 1,
                    }}
                  >
                    {targetLabel} → config
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      fontSize: 10,
                      fontFamily:
                        "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                      color: "rgba(0,0,0,0.65)",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      paddingRight: 32,
                    }}
                  >
                    {generateCode}
                  </pre>

                  <button
                    onClick={handleCopy}
                    title={copyFeedback ? "已复制" : "复制代码"}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 26,
                      height: 26,
                      border: "none",
                      background: copyFeedback
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(0,0,0,0.06)",
                      borderRadius: 6,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: copyFeedback
                        ? "#22C55E"
                        : "rgba(0,0,0,0.4)",
                      transition: "all 150ms",
                    }}
                    onMouseEnter={(e) =>
                      !copyFeedback &&
                      (e.currentTarget.style.background =
                        "rgba(0,0,0,0.1)")
                    }
                    onMouseLeave={(e) =>
                      !copyFeedback &&
                      (e.currentTarget.style.background = copyFeedback
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(0,0,0,0.06)")
                    }
                  >
                    {copyFeedback ? (
                      <Check size={13} />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

// ── MotionSelectButton (right-bottom toggle) ──────────────────────
interface MotionSelectButtonProps {
  mode: MotionMode;
  onClick: () => void;
}

export function MotionSelectButton({ mode, onClick }: MotionSelectButtonProps) {
  const isIdle = mode === "idle";

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "none",
        background: "rgba(0,0,0,0.82)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.90)",
        zIndex: 50,
        padding: 0,
      }}
      whileHover={{ scale: 1.1, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
      whileTap={{ scale: 0.95 }}
      title={isIdle ? "进入选择模式" : "退出"}
    >
      <AnimatePresence mode="wait">
        {isIdle ? (
          <motion.div
            key="mouse"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <MousePointer size={16} strokeWidth={2.2} />
          </motion.div>
        ) : (
          <motion.div
            key="close"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={16} strokeWidth={2.2} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
