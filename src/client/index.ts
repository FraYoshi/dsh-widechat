/**
 * Browser half: registers the `dsh-widechat` row into the General settings
 * page (`settings.general.item`) and keeps the CSS override sheet in sync
 * with the user's settings on the bound scope.
 *
 * The row reads through a SettingsScope bound to the same namespace the host
 * half registered under (`WIDE_CHAT_SETTINGS_NAMESPACE`); writes go through
 * `scope.set` / `scope.unset`. The CSS apply subscribes to the same scope
 * via `scope.subscribe(...)` and re-injects the stylesheet on every change.
 *
 * On every config read the values go through `resolveConfig`, which clamps
 * to bounds and substitutes defaults on any out-of-range or wrong-typed
 * field. A soft `console.warn` is logged when any fallback fires so the
 * user can see what their input was rejected for without the page refusing
 * to render.
 */
import {
  CHAT_GUTTER_PCT_FIELD,
  COMPOSER_MAX_HEIGHT_PCT_FIELD,
  DEFAULTS,
  STATS_ALIGN_FIELD,
  USER_BUBBLE_PCT_FIELD,
  WIDE_CHAT_SETTINGS_NAMESPACE,
} from "../settings.js";
import { WideChatRow } from "./WideChatRow";
import { dictionaries, WIDE_CHAT_LOCALE_NS } from "./locales";
import { buildStylesheet, injectStylesheet, resolveConfig } from "./css";
import { STYLES } from "./styles";

/** Plugin id we tag our `<style>` tags with. */
const PLUGIN_ID = "dsh-widechat";

/**
 * Required client services. `settingsScope` provides the per-namespace scope
 * we bind to; `slots` / `locale` declare the row and the dictionaries.
 * `connection` is required by SettingsScope to write through the wire.
 */
export const inject = [
  "slots",
  "locale",
  "connection",
  "settingsScope",
];

/** Owning row slot id (drives the order in the General section). */
const ROW_ID = "wide-chat";
/** Position in the General section. Lower numbers render first. */
const ROW_ORDER = 50;

/**
 * Install the row's own self-drawn CSS once. The row's class names match
 * nothing until this lands; without it the row still renders, just with
 * browser defaults, which reads as a broken UI.
 */
function installRowStyles(): () => void {
  if (typeof document === "undefined") return () => {};
  const tag = document.createElement("style");
  tag.dataset.plugin = PLUGIN_ID;
  tag.dataset.pluginCss = `${PLUGIN_ID}/row.css`;
  tag.textContent = STYLES;
  document.head.appendChild(tag);
  return () => {
    tag.remove();
  };
}

/**
 * Compute the stylesheet for the current scope value (or the defaults if the
 * scope has no value yet) and inject it. Returns the disposer the caller
 * hands to `ctx.effect` so the tag is removed on plugin unload.
 */
function applyForScope(scopeValue: unknown): () => void {
  const resolved = resolveConfig(scopeValue, {
    chatGutterPct: DEFAULTS[CHAT_GUTTER_PCT_FIELD],
    statsAlign: DEFAULTS[STATS_ALIGN_FIELD],
    userBubblePct: DEFAULTS[USER_BUBBLE_PCT_FIELD],
    composerMaxHeightPct: DEFAULTS[COMPOSER_MAX_HEIGHT_PCT_FIELD],
  });
  if (resolved.fellBack) {
    // Soft warning — never block render. The user sees a console line that
    // points at the offending field; the page still uses the fallback.
    console.warn(
      `[${PLUGIN_ID}] config fell back to defaults for: ${resolved.fallbacks.join(", ")}`,
    );
  }
  return injectStylesheet(buildStylesheet(resolved), PLUGIN_ID);
}

/** Read the current section value out of a scope snapshot. */
function readSection(snapshot: any): unknown {
  if (snapshot === null || snapshot === undefined) return undefined;
  return snapshot.value;
}

/**
 * Client plugin body: register dictionaries, install the row's own styles,
 * bind the settings scope, and keep the override sheet synced on changes.
 *
 * The CSS sheet is re-injected (old tag removed, new tag appended) on every
 * scope change. That keeps the override simple — a single `<style>` tag
 * whose text is the current resolved stylesheet — at the cost of one
 * document mutation per change. The user changes these settings rarely
 * (slider drag, align toggle, gutter toggle) so the cost is negligible.
 *
 * @param ctx - client cordis context.
 */
export function apply(ctx: any): void {
  // Row styles — must land before the row mounts or the first paint is
  // unstyled and flashes.
  ctx.effect(() => installRowStyles(), "dsh-widechat: row styles");

  // Dictionaries.
  ctx.effect(
    () => ctx.locale.register(WIDE_CHAT_LOCALE_NS, dictionaries),
    "dsh-widechat: dictionaries",
  );

  // Bind the scope and re-inject on changes. If the host-side settings
  // service is missing or the namespace was never registered, the bind
  // returns a scope that reads undefined; applyForScope falls back to
  // the bundled defaults in that case so the chat column is still
  // widened even when the user has never opened the settings panel.
  let scope: ReturnType<typeof ctx.settingsScope.bind> | null = null;
  try {
    scope = ctx.settingsScope.bind({ namespace: WIDE_CHAT_SETTINGS_NAMESPACE });
  } catch (error) {
    console.warn(`[${PLUGIN_ID}] settingsScope.bind failed:`, error);
  }
  if (scope !== null) {
    ctx.effect(() => {
      let disposeSheet: () => void = () => {};
      try {
        // The scope's `subscribe` listener fires on every change, and
        // may also fire once with the current snapshot on subscription.
        // We need to dispose the old stylesheet AND inject a fresh one
        // on every change, not just dispose (otherwise the stylesheet
        // disappears the moment the scope fires).
        const reapply = () => {
          disposeSheet();
          try {
            disposeSheet = applyForScope(readSection(scope!.getSnapshot()));
          } catch (error) {
            console.warn(`[${PLUGIN_ID}] reapply failed:`, error);
            disposeSheet = () => {};
          }
        };
        reapply();
        const unsubscribe = scope!.subscribe(reapply);
        return () => {
          unsubscribe();
          disposeSheet();
        };
      } catch (error) {
        // The scope may be in a transient state on first activation
        // (host registration not yet loaded). Return a no-op cleanup;
        // the next scope change will trigger reapply via subscribe.
        console.warn(`[${PLUGIN_ID}] initial stylesheet inject failed:`, error);
        return () => {};
      }
    }, "dsh-widechat: settings-driven stylesheet");
  } else {
    // No scope available — inject the override with bundled defaults so
    // the chat column is still widened.
    ctx.effect(() => {
      const disposeSheet = applyForScope(undefined);
      return () => disposeSheet();
    }, "dsh-widechat: settings-driven stylesheet (no scope)");
  }

  // The settings row.
  const injected = () => ({ scope });
  ctx.slots.inject("settings.general.item", function* () {
    yield ctx.slots.register(
      {
        name: "settings.general.item",
        id: ROW_ID,
        order: ROW_ORDER,
        locale: WIDE_CHAT_LOCALE_NS,
        inject: injected,
      },
      WideChatRow,
    );
  });
}
