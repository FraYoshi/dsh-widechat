/**
 * Settings row dictionaries for the `dsh-wide-chat` General page entry. The
 * shell ships zh and en; a key missing from one falls back to the other, so
 * both are kept complete.
 *
 * @module dsh-wide-chat/client/locales
 */
export const WIDE_CHAT_LOCALE_NS = "settings.wide-chat";

/** Simplified Chinese dictionary (the key-set source of truth). */
const zh = {
  "row.title": "宽屏对话",
  "row.description": "调整聊天列宽度与底部统计对齐方式。",
  "gutter.label": "左右留白",
  "gutter.help": "聊天列两侧留白占视口宽度的百分比。0 为贴边，2 为适中的默认留白。",
  "align.label": "统计对齐",
  "align.left": "左",
  "align.center": "居中",
  "align.right": "右",
  "preserveGutter.label": "侧栏收起时保持留白",
  "preserveGutter.help": "开启后，左侧菜单收起时聊天文字仍按当前留白宽度排版，不会重新换行。",
};

const en = {
  "row.title": "Wide chat",
  "row.description": "Adjust the chat column width and the bottom-stats alignment.",
  "gutter.label": "Side gutter",
  "gutter.help": "Chat column gutter as a percent of viewport width. 0 = edge-to-edge, 2 = a comfortable default.",
  "align.label": "Stats alignment",
  "align.left": "Left",
  "align.center": "Center",
  "align.right": "Right",
  "preserveGutter.label": "Keep gutter when sidebar collapses",
  "preserveGutter.help": "When on, collapsing the sidebar keeps the chat text at the same width instead of reflowing.",
};

export const dictionaries = { zh, en };
