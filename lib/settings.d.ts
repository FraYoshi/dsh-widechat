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
export declare const WIDE_CHAT_SETTINGS_NAMESPACE = "dsh-wide-chat";
/** Field key for the chat column horizontal gutter, in percent of viewport. */
export declare const CHAT_GUTTER_PCT_FIELD = "chatGutterPct";
/** Field key for the session-stats alignment. */
export declare const STATS_ALIGN_FIELD = "statsAlign";
/** Allowed values for `statsAlign`. */
export declare const STATS_ALIGN_VALUES: readonly ["left", "center", "right"];
export type StatsAlign = (typeof STATS_ALIGN_VALUES)[number];
/** Hard limits for the gutter percentage. */
export declare const CHAT_GUTTER_PCT_MIN = 0;
export declare const CHAT_GUTTER_PCT_MAX = 10;
/** Defaults applied when a field is unset. */
export declare const DEFAULTS: {
    readonly chatGutterPct: 1;
    readonly statsAlign: "right";
};
