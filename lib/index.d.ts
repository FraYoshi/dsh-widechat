import z from "@deepseek-ai/schemastery";
/**
 * Durable settings schema. The browser half binds a scope to this same
 * namespace, reads these fields, and writes them through `scope.set` /
 * `scope.unset`. Defaults live in `./settings.ts`; the schema declares
 * shape and bounds, not defaults.
 */
export declare const WideChatSettingsSchema: z<Schemastery.ObjectS<{
    chatGutterPct: z<number, number>;
    statsAlign: z<string, string>;
    preserveGutterWhenSidebarCollapsed: z<boolean, boolean>;
}>, Schemastery.ObjectT<{
    chatGutterPct: z<number, number>;
    statsAlign: z<string, string>;
    preserveGutterWhenSidebarCollapsed: z<boolean, boolean>;
}>>;
/** Host plugin body. Registers the namespace with the host settings service. */
export declare function apply(ctx: any): void;
export { WIDE_CHAT_SETTINGS_NAMESPACE, CHAT_GUTTER_PCT_FIELD, STATS_ALIGN_FIELD, PRESERVE_GUTTER_WHEN_SIDEBAR_COLLAPSED_FIELD, STATS_ALIGN_VALUES, CHAT_GUTTER_PCT_MIN, CHAT_GUTTER_PCT_MAX, DEFAULTS, } from "./settings.js";
