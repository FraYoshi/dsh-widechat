/**
 * Settings-namespace constants, defaults, and pure utilities shared by both
 * the host and client halves. This file deliberately imports nothing from
 * `@deepseek-ai/dsh-settings` or `@deepseek-ai/schemastery` — those are
 * host-side concerns, and the client half bundles to a closure where
 * runtime `require()` of any package not in the loader's table fails the
 * whole Web UI.
 *
 * @module dsh-wide-chat/settings
 */
/** Settings namespace owned by this plugin. */
export const WIDE_CHAT_SETTINGS_NAMESPACE = "dsh-wide-chat";
/** Field key for the chat column horizontal gutter, in percent of the cell. */
export const CHAT_GUTTER_PCT_FIELD = "chatGutterPct";
/** Field key for the session-stats alignment. */
export const STATS_ALIGN_FIELD = "statsAlign";
/** Field key for the user-bubble width, in percent of the chat column. */
export const USER_BUBBLE_PCT_FIELD = "userBubblePct";
/** Allowed values for `statsAlign`. */
export const STATS_ALIGN_VALUES = ["left", "center", "right"];
/** Hard limits for the gutter percentage. */
export const CHAT_GUTTER_PCT_MIN = 0;
export const CHAT_GUTTER_PCT_MAX = 10;
/** Hard limits for the user-bubble percentage. */
export const USER_BUBBLE_PCT_MIN = 30;
export const USER_BUBBLE_PCT_MAX = 100;
/** Defaults applied when a field is unset. */
export const DEFAULTS = {
    [CHAT_GUTTER_PCT_FIELD]: 1,
    [STATS_ALIGN_FIELD]: "right",
    [USER_BUBBLE_PCT_FIELD]: 75,
};
