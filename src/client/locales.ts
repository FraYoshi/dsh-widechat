/**
 * Settings row dictionaries for the `dsh-widechat` General page entry.
 * The shell ships zh and en; a key missing from one falls back to the
 * other, so both are kept complete.
 *
 * @module dsh-widechat/client/locales
 */
export const WIDE_CHAT_LOCALE_NS = "settings.widechat";

/** Simplified Chinese dictionary (the key-set source of truth). */
const zh = {
  "row.title": "宽屏对话",
  "row.description": "调整聊天列宽度、用户消息气泡宽度与底部统计对齐方式。",
  "gutter.label": "左右留白",
  "gutter.help": "聊天列两侧留白占视口宽度的百分比。0 为贴边，2 为适中的默认留白。",
  "align.label": "统计对齐",
  "align.left": "左",
  "align.center": "居中",
  "align.right": "右",
  "userBubble.label": "用户消息宽度",
  "userBubble.help": "用户消息气泡占聊天列宽度的百分比。75 为默认。",
};

const en = {
  "row.title": "Wide chat",
  "row.description": "Adjust the chat column width, your message bubble width, and the bottom-stats alignment.",
  "gutter.label": "Side gutter",
  "gutter.help": "Chat column gutter as a percent of viewport width. 0 = edge-to-edge, 2 = a comfortable default.",
  "align.label": "Stats alignment",
  "align.left": "Left",
  "align.center": "Center",
  "align.right": "Right",
  "userBubble.label": "Your message width",
  "userBubble.help": "Your message bubble width as a percent of the chat column. 75 is the default.",
};

export const dictionaries = { zh, en };
