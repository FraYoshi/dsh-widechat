/**
 * Host half of `@furayoshi/dsh-wide-chat`. Registers a settings namespace
 * under `dsh-wide-chat` whose schema the browser half binds to via
 * `ctx.settingsScope.bind({ namespace: "dsh-wide-chat" })`. The browser
 * writes here, this registration makes those writes durable, and the browser
 * reads them back through the same scope on every settings change.
 *
 * Loaded by the DSH Cordis Loader on the host. The companion `cordis.patch.yml`
 * inserts this row into the host composition so the registration actually
 * runs; the npm install flow also needs the bundle-patch row for the same
 * reason (`dsh.bundle.patch`).
 *
 * The constants, defaults, and field keys live in `./settings.ts` so the
 * client half can import them without pulling `@deepseek-ai/dsh-settings`
 * and `@deepseek-ai/schemastery` into the browser bundle (where the loader
 * has no module table entry for them and would refuse to resolve).
 */
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "@deepseek-ai/schemastery";
import {
  CHAT_GUTTER_PCT_FIELD,
  CHAT_GUTTER_PCT_MAX,
  CHAT_GUTTER_PCT_MIN,
  STATS_ALIGN_FIELD,
  STATS_ALIGN_VALUES,
  WIDE_CHAT_SETTINGS_NAMESPACE,
} from "./settings.js";

/**
 * Durable settings schema. The browser half binds a scope to this same
 * namespace, reads these fields, and writes them through `scope.set` /
 * `scope.unset`. Defaults live in `./settings.ts`; the schema declares
 * shape and bounds, not defaults.
 */
export const WideChatSettingsSchema = z.object({
  [CHAT_GUTTER_PCT_FIELD]: z
    .number()
    .min(CHAT_GUTTER_PCT_MIN)
    .max(CHAT_GUTTER_PCT_MAX)
    .required(false),
  [STATS_ALIGN_FIELD]: z.union(STATS_ALIGN_VALUES as unknown as [string, ...string[]]).required(false),
});

/** Host plugin body. Registers the namespace with the host settings service. */
export function apply(ctx: any): void {
  ctx.inject(["settings"], (settingsCtx: any) => {
    settingsCtx.settings.register(
      settingsNamespace(WIDE_CHAT_SETTINGS_NAMESPACE),
      WideChatSettingsSchema,
    );
  });
}

export {
  WIDE_CHAT_SETTINGS_NAMESPACE,
  CHAT_GUTTER_PCT_FIELD,
  STATS_ALIGN_FIELD,
  STATS_ALIGN_VALUES,
  CHAT_GUTTER_PCT_MIN,
  CHAT_GUTTER_PCT_MAX,
  DEFAULTS,
} from "./settings.js";
