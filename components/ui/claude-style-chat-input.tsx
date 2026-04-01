"use client";

import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { Plus, X, FileText, Loader2 } from "lucide-react";

// ── 实心纸飞机 SVG（对齐 Figma btn-send）────────────────────
function SendIcon({ size = 16, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14.2 1.8C14.5 1.5 14.9 1.8 14.8 2.2L12.2 13.6C12.1 14 11.7 14.1 11.4 13.9L8.2 11.6L6.6 13.3C6.3 13.6 5.8 13.4 5.8 13V10.4L12.4 3.4C12.5 3.3 12.3 3.1 12.2 3.2L4.2 9.2L1.6 7.8C1.2 7.6 1.2 7.1 1.6 6.9L14.2 1.8Z"
        fill={color}
      />
    </svg>
  );
}

// ── Design tokens ──────────────────────────────────────────────
const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ── Types ──────────────────────────────────────────────────────
interface AttachedFile {
  id: string;
  file: File;
  type: string;
  preview: string | null;
  uploadStatus: string;
}

export interface SkillChip {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface AgentChip {
  name: string;
  title: string;
  avatar: string;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// ── File Preview Card ──────────────────────────────────────────
const FilePreviewCard = ({
  file,
  onRemove,
}: {
  file: AttachedFile;
  onRemove: (id: string) => void;
}) => {
  const isImage = file.type.startsWith("image/") && file.preview;
  return (
    <div
      style={{
        position: "relative",
        flexShrink: 0,
        width: 80,
        height: 80,
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #E8EAED",
        backgroundColor: "#F2F4F8",
      }}
      className="group"
    >
      {isImage ? (
        <img
          src={file.preview!}
          alt={file.file.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6, height: "100%" }}>
          <FileText style={{ width: 16, height: 16, color: "#8B919E" }} />
          <span style={{ fontSize: 11, color: "#4A4F5A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {file.file.name}
          </span>
          <span style={{ fontSize: 10, color: "#8B919E" }}>{formatFileSize(file.file.size)}</span>
        </div>
      )}
      <button
        onClick={() => onRemove(file.id)}
        style={{
          position: "absolute", top: 4, right: 4,
          width: 18, height: 18, borderRadius: "50%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "none", cursor: "pointer",
          opacity: 0, transition: "opacity 0.15s",
        }}
        className="group-hover:opacity-100"
      >
        <X style={{ width: 10, height: 10, color: "#fff" }} />
      </button>
      {file.uploadStatus === "uploading" && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundColor: "rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Loader2 style={{ width: 18, height: 18, color: "#fff", animation: "spin 1s linear infinite" }} />
        </div>
      )}
    </div>
  );
};

export interface ChatInputHandle {
  focus: () => void;
}

// ── Main component ─────────────────────────────────────────────
interface ChatInputProps {
  onSendMessage?: (data: { message: string; files: AttachedFile[] }) => void;
  placeholder?: string;
  skills?: SkillChip[];
  onRemoveSkill?: (id: string) => void;
  agentChip?: AgentChip;
  onRemoveAgent?: () => void;
}

export const ClaudeChatInput = forwardRef<ChatInputHandle, ChatInputProps>(function ClaudeChatInput({
  onSendMessage,
  placeholder = "问我任何问题或分配一个任务",
  skills = [],
  onRemoveSkill,
  agentChip,
  onRemoveAgent,
}, ref) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasContent = message.trim().length > 0 || files.length > 0;
  // 激活态：聚焦或有技能标签或有 agent 标签时触发
  const isActive = isFocused || skills.length > 0 || !!agentChip;

  // 暴露 focus 方法给父组件
  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
  }), []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 320) + "px";
    }
  }, [message]);

  const handleFiles = useCallback((filesList: FileList | File[]) => {
    const newFiles: AttachedFile[] = Array.from(filesList).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: file.type.startsWith("image/") ? "image/unknown" : file.type,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      uploadStatus: "uploading",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((f) => {
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((p) => (p.id === f.id ? { ...p, uploadStatus: "complete" } : p))
        );
      }, 800 + Math.random() * 600);
    });
  }, []);

  const handleSend = () => {
    if (!hasContent) return;
    onSendMessage?.({ message, files });
    setMessage("");
    setFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{ width: "100%", fontFamily: FONT }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
      }}
    >
      {/* ── 彩色流动边框容器 ── */}
      {/* 原理：外层 padding:1.5px + overflow:hidden，内层白色 bg，中间旋转 conic-gradient 作为边框 */}
      <div style={{ position: "relative" }}>
        {/* ── 弥散投影层：同色 conic-gradient + blur，跟随旋转 ── */}
        <div
          style={{
            position: "absolute",
            inset: "var(--glow-inset, -8px)",
            borderRadius: 30,
            background: isActive
              ? "conic-gradient(from var(--angle, 0deg), #DDDDFD, #A8DCF2, #F2CEB8, #C7E9E5, #DDDDFD)"
              : "transparent",
            filter: "blur(26px)",
            opacity: isActive ? 0.6 : 0,
            animation: isActive ? "border-rotate 3s linear infinite, glow-breathe 6s ease-in-out infinite" : "none",
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
          }}
        />

        {/* ── 边框层 ── */}
        <div
          style={{
            position: "relative",
            borderRadius: isActive ? 25.5 : 25,   // 24 + border padding
            padding: isActive ? "1.5px" : "1px",
            transition: "padding 0.3s ease",
            background: isActive
              ? "conic-gradient(from var(--angle, 0deg), #DDDDFD, #A8DCF2, #F2CEB8, #C7E9E5, #DDDDFD)"
              : "#E8EAED",
            animation: isActive ? "border-rotate 3s linear infinite" : "none",
          }}
        >
        {/* ── 内层白色主容器 ── */}
        <div
          style={{
            position: "relative",
            borderRadius: 24,
            backgroundColor: "#FFFFFF",
            boxShadow: "0px 4px 8px -4px rgba(0,0,0,0.03), 0px 8px 16px -8px rgba(0,0,0,0.06)",
            transition: "box-shadow 0.3s ease",
            display: "flex",
            flexDirection: "column",
            paddingTop: 16,
            overflow: "hidden",
          }}
        >
          {/* 文件预览区 */}
          {files.length > 0 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 24px 12px" }}>
              {files.map((f) => (
                <FilePreviewCard
                  key={f.id}
                  file={f}
                  onRemove={(id) => setFiles((prev) => prev.filter((x) => x.id !== id))}
                />
              ))}
            </div>
          )}

          {/* ── 输入区域 ── */}
          <div
            style={{
              position: "relative",
              padding: "0 24px",
              // 激活态：最小高度 88px（对齐 Figma），默认：auto
              minHeight: isActive ? 88 : 24,
              transition: "min-height 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {/* 扫光 placeholder — 参考 HextaAI thinking shimmer */}
            {!message && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 24,
                  right: 24,
                  fontSize: 16,
                  lineHeight: "24px",
                  fontWeight: 400,
                  pointerEvents: "none",
                  userSelect: "none",
                  background:
                    "linear-gradient(110deg, #bbb, 35%, #fff, 50%, #bbb, 75%, #bbb)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmer 5s linear infinite",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {placeholder}
              </div>
            )}

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onPaste={(e) => {
                const items = e.clipboardData.items;
                const pastedFiles: File[] = [];
                for (let i = 0; i < items.length; i++) {
                  if (items[i].kind === "file") {
                    const file = items[i].getAsFile();
                    if (file) pastedFiles.push(file);
                  }
                }
                if (pastedFiles.length > 0) {
                  e.preventDefault();
                  handleFiles(pastedFiles);
                }
              }}
              rows={1}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                fontSize: 16,
                fontWeight: 400,
                lineHeight: "24px",
                color: "rgba(0,0,0,0.9)",
                fontFamily: FONT,
                overflow: "hidden",
                display: "block",
                minHeight: 24,
                maxHeight: 320,
                caretColor: "#1664FF",
              }}
            />
          </div>

          {/* ── 底部操作栏 ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
            }}
          >
            {/* 左侧工具区：激活态渐显，默认隐藏 */}
            <div
              style={{
                display: "flex",
                gap: 4,
                alignItems: "center",
                opacity: isActive ? 1 : 0,
                transform: isActive ? "translateY(0)" : "translateY(4px)",
                transition: "opacity 0.25s ease, transform 0.25s ease",
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              {/* Agent 角色标签：排第一位 */}
              {agentChip && (
                <div
                  onClick={() => onRemoveAgent?.()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 0,
                    height: 32,
                    padding: "0 12px",
                    borderRadius: 20,
                    backgroundColor: "#dcf3fa",
                    cursor: onRemoveAgent ? "pointer" : "default",
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    fontSize: 14,
                    fontWeight: 500,
                    lineHeight: "22px",
                    color: "rgba(0,0,0,0.9)",
                    whiteSpace: "nowrap",
                  }}>
                    {agentChip.title}
                  </span>
                  <span style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 14,
                    height: 14,
                    flexShrink: 0,
                    color: "rgba(0,0,0,0.5)",
                    marginLeft: 8,
                  }}>
                    <X style={{ width: 10, height: 10 }} />
                  </span>
                </div>
              )}
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <div
                    key={skill.id}
                    onClick={() => onRemoveSkill?.(skill.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 0,
                      height: 32,
                      padding: "0 12px",
                      borderRadius: 20,
                      backgroundColor: "#dcf3fa",
                      cursor: onRemoveSkill ? "pointer" : "default",
                      flexShrink: 0,
                    }}
                  >
                    {skill.icon && (
                      <span style={{ display: "flex", flexShrink: 0, marginRight: 4 }}>
                        {skill.icon}
                      </span>
                    )}
                    <span style={{
                      fontSize: 14,
                      fontWeight: 500,
                      lineHeight: "22px",
                      color: "rgba(0,0,0,0.9)",
                      whiteSpace: "nowrap",
                    }}>
                      {skill.label}
                    </span>
                    {onRemoveSkill && (
                      <span style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 14,
                        height: 14,
                        flexShrink: 0,
                        color: "rgba(0,0,0,0.5)",
                        marginLeft: 8,
                      }}>
                        <X style={{ width: 10, height: 10 }} />
                      </span>
                    )}
                  </div>
                ))
              ) : (
                // 激活但无 skill 时占位，保持布局稳定
                <div style={{ height: 32 }} />
              )}
            </div>

            {/* 右侧按钮组 */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {/* + 按钮：无背景，纯图标 */}
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  border: "none",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(0,0,0,0.85)",
                  flexShrink: 0,
                  padding: 0,
                }}
                type="button"
                aria-label="添加附件"
              >
                <Plus style={{ width: 20, height: 20, strokeWidth: 1.5 }} />
              </button>

              {/* 发送按钮：灰色圆底 + 白色纸飞机 */}
              <button
                onClick={handleSend}
                disabled={!hasContent}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  border: "none",
                  background: hasContent ? "#1D2129" : "#E8EAED",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: hasContent ? "pointer" : "default",
                  color: "#FFFFFF",
                  transition: "background 0.2s ease",
                  flexShrink: 0,
                  padding: 0,
                }}
                type="button"
                aria-label="发送"
              >
                <SendIcon size={16} color="#FFFFFF" />
              </button>
            </div>
          </div>

          {/* 拖拽遮罩 */}
          {isDragging && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(22, 100, 255, 0.04)",
                border: "2px dashed #1664FF",
                borderRadius: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 50,
              }}
            >
              <span style={{ fontSize: 14, color: "#1664FF", fontWeight: 500 }}>
                拖拽文件到此处上传
              </span>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes border-rotate {
          to { --angle: 360deg; }
        }

        @keyframes glow-breathe {
          0%, 100% {
            --glow-inset: -8px;
            filter: blur(26px);
          }
          50% {
            --glow-inset: -14px;
            filter: blur(32px);
          }
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* 隐藏文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
});

export default ClaudeChatInput;
