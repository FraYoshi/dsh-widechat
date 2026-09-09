/**
 * Host half of `@furayoshi/dsh-widechat`. Registers a settings namespace
 * under `dsh-widechat` whose schema the browser half binds to via
 * `ctx.settingsScope.bind({ namespace: "dsh-widechat" })`. The browser
 * writes here, this registration makes those writes durable, and the browser
 * reads them back through the same scope on every settings change.
 *
 * Loaded by the DSH Cordis Loader on the host. The companion `cordis.patch.yml`
 * inserts this row into the host composition so the registration actually
 * runs; the npm install flow also needs the bundle-patch row for the same
 * reason (`dsh.bundle.patch`).
 *
 * The constants, defaults, and field keys live in `./settings.ts` so the
 * client half can import them without pulling `@deepseek-ai/schemastery`
 * into the browser bundle (where the loader has no module table entry for
 * it and would refuse to resolve).
 *
 * DSH >= 0.1.2-rc.1: the settings service (`ctx.settings`, a
 * `SettingsProvider` from `@deepseek-ai/dsh-settings`) registers
 * namespaces with a plain lowercase-hyphenated string:
 *
 *   ctx.settings.register("dsh-widechat", schema)
 *
 * The pre-0.1.2 `settingsNamespace()` helper export no longer exists in
 * `@deepseek-ai/dsh-settings`; a static import of it fails the whole
 * plugin tree at boot with
 * `SyntaxError: ... does not provide an export named 'settingsNamespace'`.
 */
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
    userBubblePct: z<number, number>;
    composerMaxHeightPct: z<number, number>;
}>, Schemastery.ObjectT<{
    chatGutterPct: z<number, number>;
    statsAlign: z<string, string>;
    userBubblePct: z<number, number>;
    composerMaxHeightPct: z<number, number>;
}>>;
/**
 * Host plugin body. Registers the namespace with the host settings service.
 *
 * The namespace is passed as a plain string (DSH >= 0.1.2-rc.1 API). All
 * fields are optional, so a stored section with no values resolves to an
 * empty object and the client half applies its own bundled defaults.
 */
export declare function apply(ctx: any): void;
export { WIDE_CHAT_SETTINGS_NAMESPACE, CHAT_GUTTER_PCT_FIELD, STATS_ALIGN_FIELD, STATS_ALIGN_VALUES, CHAT_GUTTER_PCT_MIN, CHAT_GUTTER_PCT_MAX, USER_BUBBLE_PCT_FIELD, USER_BUBBLE_PCT_MIN, USER_BUBBLE_PCT_MAX, COMPOSER_MAX_HEIGHT_PCT_FIELD, COMPOSER_MAX_HEIGHT_PCT_MIN, COMPOSER_MAX_HEIGHT_PCT_MAX, DEFAULTS, } from "./settings.js";
