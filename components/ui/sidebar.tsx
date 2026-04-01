"use client";

import React from "react";
import {
  IconDataClaw,
  IconIngestData,
  IconCatalog,
  IconStudio,
  IconPin,
  IconWorkflow,
  IconOps,
  IconSQL,
  IconDashboard,
  IconChatBI,
  IconMLExp,
  IconFeature,
  IconModelReg,
  IconModelSvc,
  IconAgents,
  IconApps,
  IconPlatform,
  IconDataSource,
  IconCompute,
  IconGovernance,
  IconWorkspace,
  IconSidebarToggle,
} from "@/components/ui/wedata-icons";

// ── Figma 资产 URL（来自 kdPqSMMrMcX9qBC4h2BdxQ node 2029-60827）
const LOGO_OTTER_URL   = "https://www.figma.com/api/mcp/asset/170fe2d2-8b83-4cf6-b9aa-fa034fc37ed3";
const LOGO_TEXT_URL    = "https://www.figma.com/api/mcp/asset/7be31ded-83fe-4cf5-a010-2af1de962319";
const SIDEBAR_ICON_URL = "https://www.figma.com/api/mcp/asset/a23c7904-55b9-4993-8ded-e75299ef8f3a";


const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const C = {
  sidebarBg:    "#F5F6F8",
  activeItemBg: "#E1E5ED",
  hoverItemBg:  "#ECEEF2",
  textPrimary:  "rgba(0,0,0,0.9)",
  textTertiary: "rgba(0,0,0,0.5)",
  iconDefault:  "rgba(0,0,0,0.7)",
  logoBg:       "linear-gradient(134.68deg, #8AFFF5 12.79%, #3AC3FF 90.59%)",
  border:       "rgba(0,0,0,0.06)",
} as const;

// ── Menu data ──────────────────────────────────────────────────
interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface MenuGroup {
  label?: string;
  items: MenuItem[];
}

const ic = (color = C.iconDefault) => ({ color });

const MENU_GROUPS: MenuGroup[] = [
  {
    items: [
      { id: "dataclaw", label: "DataClaw",  icon: <IconDataClaw  size={16} {...ic()} /> },
      { id: "ingest",   label: "接入数据",   icon: <IconIngestData size={16} {...ic()} /> },
      { id: "catalog",  label: "数据目录",   icon: <IconCatalog    size={16} {...ic()} /> },
      { id: "studio",   label: "Studio",    icon: <IconStudio     size={16} {...ic()} /> },
    ],
  },
  {
    label: "快捷方式",
    items: [
      { id: "workflow-pin", label: "工作流",   icon: <IconPin size={16} {...ic()} /> },
      { id: "mlexp-pin",    label: "模型实验", icon: <IconPin size={16} {...ic()} /> },
    ],
  },
  {
    label: "开发/运维",
    items: [
      { id: "workflow", label: "工作流",   icon: <IconWorkflow size={16} {...ic()} /> },
      { id: "ops",      label: "运维监控", icon: <IconOps      size={16} {...ic()} /> },
    ],
  },
  {
    label: "分析/洞察",
    items: [
      { id: "sql",    label: "SQL 探索", icon: <IconSQL       size={16} {...ic()} /> },
      { id: "dash",   label: "仪表盘",   icon: <IconDashboard size={16} {...ic()} /> },
      { id: "chatbi", label: "ChatBI",   icon: <IconChatBI    size={16} {...ic()} /> },
    ],
  },
  {
    label: "ML",
    items: [
      { id: "mlexp",    label: "模型实验", icon: <IconMLExp    size={16} {...ic()} /> },
      { id: "feature",  label: "特征管理", icon: <IconFeature  size={16} {...ic()} /> },
      { id: "modelreg", label: "模型管理", icon: <IconModelReg size={16} {...ic()} /> },
      { id: "modelsvc", label: "模型服务", icon: <IconModelSvc size={16} {...ic()} /> },
    ],
  },
  {
    label: "AI 应用",
    items: [
      { id: "agents", label: "AI Agents", icon: <IconAgents size={16} {...ic()} /> },
      { id: "apps",   label: "Apps",      icon: <IconApps   size={16} {...ic()} /> },
    ],
  },
  {
    label: "管理",
    items: [
      { id: "platform", label: "平台管理", icon: <IconPlatform   size={16} {...ic()} /> },
      { id: "datasrc",  label: "数据源",   icon: <IconDataSource size={16} {...ic()} /> },
      { id: "compute",  label: "计算资源", icon: <IconCompute    size={16} {...ic()} /> },
      { id: "govern",   label: "数据治理", icon: <IconGovernance size={16} {...ic()} /> },
    ],
  },
];

// ── Sidebar Props ──────────────────────────────────────────────
interface SidebarProps {
  activeId?: string;
  onMenuClick?: (id: string) => void;
}

// ── Sidebar ────────────────────────────────────────────────────
export default function Sidebar({ activeId = "dataclaw", onMenuClick }: SidebarProps) {
  return (
    <div style={{
      width: 224,
      minWidth: 224,
      height: "100vh",
      backgroundColor: C.sidebarBg,
      display: "flex",
      flexDirection: "column",
      fontFamily: FONT,
      userSelect: "none",
      flexShrink: 0,
    }}>

      {/* ── Logo — 1:1 还原 Figma node 2029-60827 ── */}
      <div style={{
        height: 84,
        flexShrink: 0,
        overflow: "hidden",
        position: "relative",
        borderRadius: 14,
      }}>
        {/* 品牌区 */}
        <div style={{
          display: "flex",
          height: 84,
          alignItems: "center",
          overflow: "hidden",
          position: "relative",
        }}>
          {/* 左侧：logo图标 + 文字 + 收起按钮 */}
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: 20,
            paddingRight: 8,
            minWidth: 0,
          }}>
            {/* logo1：海獭 + 文字 */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              {/* 海獭图标容器 32×32 圆角8 渐变背景 */}
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundImage: "linear-gradient(134.675deg, rgb(138,255,245) 12.793%, rgb(58,195,255) 90.59%)",
                flexShrink: 0,
                overflow: "hidden",
                position: "relative",
              }}>
                {/* 海獭图片：宽43.5 高37.6 偏移 left-13.57 top3.95 */}
                <div style={{
                  position: "absolute",
                  width: 43.502,
                  height: 37.633,
                  left: -13.57,
                  top: 3.95,
                }}>
                  <img
                    alt=""
                    src={LOGO_OTTER_URL}
                    style={{
                      display: "block",
                      width: "101.52%",
                      height: "100.33%",
                      maxWidth: "none",
                      position: "absolute",
                      top: "-0.33%",
                      left: "-1.52%",
                    }}
                  />
                </div>
              </div>
              {/* weData 文字 94×16 */}
              <div style={{ width: 94, height: 16, position: "relative", flexShrink: 0 }}>
                <img
                  alt="weData"
                  src={LOGO_TEXT_URL}
                  style={{
                    position: "absolute",
                    display: "block",
                    width: "100%",
                    height: "100%",
                    maxWidth: "none",
                  }}
                />
              </div>
            </div>

            {/* 侧边栏收起按钮 p-12 rounded-20 */}
            <button style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: 12,
              borderRadius: 20,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              flexShrink: 0,
            }}>
              {/* side-bar 图标 16×16 */}
              <div style={{ width: 16, height: 16, overflow: "hidden", position: "relative", flexShrink: 0 }}>
                <div style={{
                  position: "absolute",
                  top: "12.5%",
                  left: "6.25%",
                  right: "6.25%",
                  bottom: "12.5%",
                }}>
                  <div style={{
                    position: "absolute",
                    top: "-5.54%",
                    left: "-4.75%",
                    right: "-4.75%",
                    bottom: "-5.54%",
                  }}>
                    <img
                      alt=""
                      src={SIDEBAR_ICON_URL}
                      style={{ display: "block", width: "100%", height: "100%", maxWidth: "none" }}
                    />
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Menu list ── */}
      <div style={{
        flex: 1, overflowY: "auto", overflowX: "hidden",
        padding: "0 12px", scrollbarWidth: "none",
      }}>
        {MENU_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <div style={{
                padding: "24px 16px 8px",
                fontSize: 12, fontWeight: 400,
                lineHeight: "20px", color: C.textTertiary,
              }}>
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = activeId === item.id;
              return (
              <button
                key={item.id}
                onClick={() => onMenuClick?.(item.id)}
                style={{
                  width: "100%", height: 36,
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "0 16px", borderRadius: 20,
                  border: "none",
                  background: isActive ? C.activeItemBg : "transparent",
                  cursor: "pointer", textAlign: "left",
                  transition: "background 100ms", flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLButtonElement).style.background = C.hoverItemBg;
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <span style={{ display: "flex", flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span style={{
                  flex: 1, fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  lineHeight: "22px", color: C.textPrimary,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {item.label}
                </span>
              </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── Account ── */}
      <div style={{
        padding: 12, flexShrink: 0,
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "8px", borderRadius: 32, cursor: "pointer",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 30,
            backgroundColor: "#FFFFFF", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${C.border}`,
          }}>
            <IconWorkspace size={16} color={C.textTertiary} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 500, lineHeight: "22px",
              color: C.textPrimary,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              测试工作空间
            </div>
            <div style={{
              fontSize: 12, fontWeight: 400, lineHeight: "20px",
              color: C.textTertiary,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              Joseph@tencent.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
