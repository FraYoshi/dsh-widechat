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
  "row.description": "调整聊天列宽度、用户消息气泡宽度、底部统计对齐方式以及输入框最大高度。",
  "gutter.label": "左右留白",
  "gutter.help": "聊天列两侧留白占视口宽度的百分比。0 为贴边，2 为适中的默认留白。",
  "align.label": "统计对齐",
  "align.left": "左",
  "align.center": "居中",
  "align.right": "右",
  "userBubble.label": "用户消息宽度",
  "userBubble.help": "用户消息气泡占聊天列宽度的百分比。75 为默认。",
  "composerMaxHeight.label": "输入框最大高度",
  "composerMaxHeight.help": "输入框最大高度占视口高度的百分比，避免长输入时遮挡对话。50 为默认。",
};

const en = {
  "row.title": "Wide chat",
  "row.description": "Adjust the chat column width, your message bubble width, the bottom-stats alignment, and the composer max height.",
  "gutter.label": "Side gutter",
  "gutter.help": "Chat column gutter as a percent of viewport width. 0 = edge-to-edge, 2 = a comfortable default.",
  "align.label": "Stats alignment",
  "align.left": "Left",
  "align.center": "Center",
  "align.right": "Right",
  "userBubble.label": "Your message width",
  "userBubble.help": "Your message bubble width as a percent of the chat column. 75 is the default.",
  "composerMaxHeight.label": "Composer max height",
  "composerMaxHeight.help": "Composer card max height as a percent of the viewport, so long inputs do not hide the conversation. 50 is the default.",
};

export const dictionaries = { zh, en };
