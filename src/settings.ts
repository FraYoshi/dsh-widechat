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

/** Field key for the chat column horizontal gutter, in percent of viewport. */
export const CHAT_GUTTER_PCT_FIELD = "chatGutterPct";
/** Field key for the session-stats alignment. */
export const STATS_ALIGN_FIELD = "statsAlign";

/** Allowed values for `statsAlign`. */
export const STATS_ALIGN_VALUES = ["left", "center", "right"] as const;
export type StatsAlign = (typeof STATS_ALIGN_VALUES)[number];

/** Hard limits for the gutter percentage. */
export const CHAT_GUTTER_PCT_MIN = 0;
export const CHAT_GUTTER_PCT_MAX = 10;

/** Defaults applied when a field is unset. */
export const DEFAULTS = {
  [CHAT_GUTTER_PCT_FIELD]: 1,
  [STATS_ALIGN_FIELD]: "right",
} as const;
