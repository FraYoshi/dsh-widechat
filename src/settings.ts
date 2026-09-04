/**
 * Settings-namespace constants, defaults, and pure utilities shared by both
 * the host and client halves. This file deliberately imports nothing from
 * `@deepseek-ai/dsh-settings` or `@deepseek-ai/schemastery` — those are
 * host-side concerns, and the client half bundles to a closure where
 * runtime `require()` of any package not in the loader's table fails the
 * whole Web UI.
 *
 * @module dsh-widechat/settings
 */

/** Settings namespace owned by this plugin. */
export const WIDE_CHAT_SETTINGS_NAMESPACE = "dsh-widechat";

/** Field key for the chat column horizontal gutter, in percent of the cell. */
export const CHAT_GUTTER_PCT_FIELD = "chatGutterPct";
/** Field key for the session-stats alignment. */
export const STATS_ALIGN_FIELD = "statsAlign";
/** Field key for the user-bubble width, in percent of the chat column. */
export const USER_BUBBLE_PCT_FIELD = "userBubblePct";
/** Field key for the composer-card max height, in percent of the viewport. */
export const COMPOSER_MAX_HEIGHT_PCT_FIELD = "composerMaxHeightPct";

/** Allowed values for `statsAlign`. */
export const STATS_ALIGN_VALUES = ["left", "center", "right"] as const;
export type StatsAlign = (typeof STATS_ALIGN_VALUES)[number];

/** Hard limits for the gutter percentage. */
export const CHAT_GUTTER_PCT_MIN = 0;
export const CHAT_GUTTER_PCT_MAX = 10;

/** Hard limits for the user-bubble percentage. */
export const USER_BUBBLE_PCT_MIN = 30;
export const USER_BUBBLE_PCT_MAX = 100;

/** Hard limits for the composer-card max-height percentage.
 * The shipped composer caps out at roughly 43vh on typical layouts (the
 * conversation area keeps a sticky composer with internal scroll, and
 * the parent has its own ceiling). The slider's effective range is
 * 20–43 to match the hard cap; values above 43 are silently clamped by
 * the layout, so capping the slider prevents the user from thinking
 * they can go higher when they can't. */
export const COMPOSER_MAX_HEIGHT_PCT_MIN = 20;
export const COMPOSER_MAX_HEIGHT_PCT_MAX = 43;

/** Defaults applied when a field is unset. */
export const DEFAULTS = {
  [CHAT_GUTTER_PCT_FIELD]: 1,
  [STATS_ALIGN_FIELD]: "right",
  [USER_BUBBLE_PCT_FIELD]: 75,
  [COMPOSER_MAX_HEIGHT_PCT_FIELD]: 50,
} as const;
