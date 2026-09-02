/**
 * Browser half: registers the `dsh-wide-chat` row into the General settings
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
const PLUGIN_ID = "dsh-wide-chat";

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
  ctx.effect(() => installRowStyles(), "dsh-wide-chat: row styles");

  // Dictionaries.
  ctx.effect(
    () => ctx.locale.register(WIDE_CHAT_LOCALE_NS, dictionaries),
    "dsh-wide-chat: dictionaries",
  );

  // Bind the scope and re-inject on changes.
  const scope = ctx.settingsScope.bind({ namespace: WIDE_CHAT_SETTINGS_NAMESPACE });
  ctx.effect(() => {
    const disposeSheet = applyForScope(readSection(scope.getSnapshot()));
    const unsubscribe = scope.subscribe(() => {
      // The scope only re-renders the CSS, not the row — but the row reads
      // its own values from `scope.getSnapshot()` on every render, so the
      // row will redraw on its own subscription path. The CSS sheet is the
      // half we manage here.
      disposeSheet();
    });
    return () => {
      unsubscribe();
      disposeSheet();
    };
  }, "dsh-wide-chat: settings-driven stylesheet");

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
