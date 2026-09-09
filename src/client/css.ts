/**
 * Build the CSS override string for the `dsh-widechat` plugin from a
 * settings snapshot. The configurable knobs are `chatGutterPct`
 * (a percentage of the cell width on each side), `statsAlign`
 * (where the session-stats strip lines up under the composer),
 * `userBubblePct` (a percentage of the chat column for the user-bubble
 * width), and `composerMaxHeightPct` (a percentage of the viewport for
 * the composer's max height, to keep the conversation visible).
 *
 * The override is intentionally minimal: it changes custom properties and
 * a few well-known CSS-module selectors, and lets DSH's shipped CSS keep
 * doing everything else. That means the column reflows on sidebar
 * toggle and window resize, exactly the way the user already knows.
 *
 * Class hashes are the CSS-modules-generated ones from
 * `@deepseek-ai/dsh-client-ui-conversation` (conversation root, composer
 * card/scroll) and `@deepseek-ai/dsh-client-ui-chat` (chat column,
 * user bubble, stats line). They are recomputed on every upstream
 * rebuild; when they change this file is what needs updating.
 *
 * Current targets (DSH 0.1.2-rc.1):
 *   wSkVaW_root      conversation root (dsh-client-ui-conversation)
 *   EvIC1a_column    chat column, max-width: var(--dsh-chat-content-width)
 *   uV2eYG_card      composer card
 *   uV2eYG_scroll    composer inner scroll
 *   Sixlwa_userStack user-message bubble stack (dsh-client-ui-chat)
 *   -NDN2W_root      session stats line (dsh-client-ui-chat)
 */

import {
  CHAT_GUTTER_PCT_FIELD,
  CHAT_GUTTER_PCT_MAX,
  CHAT_GUTTER_PCT_MIN,
  COMPOSER_MAX_HEIGHT_PCT_FIELD,
  COMPOSER_MAX_HEIGHT_PCT_MAX,
  COMPOSER_MAX_HEIGHT_PCT_MIN,
  STATS_ALIGN_FIELD,
  USER_BUBBLE_PCT_FIELD,
  USER_BUBBLE_PCT_MAX,
  USER_BUBBLE_PCT_MIN,
} from "../settings.js";

/** Re-exported for the row's slider min/max. */
export {
  CHAT_GUTTER_PCT_MIN,
  CHAT_GUTTER_PCT_MAX,
  USER_BUBBLE_PCT_MIN,
  USER_BUBBLE_PCT_MAX,
  COMPOSER_MAX_HEIGHT_PCT_MIN,
  COMPOSER_MAX_HEIGHT_PCT_MAX,
};

/** Validate and clamp a single field. Returns `fallback` on any deviation. */
function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  const rounded = Math.round(value);
  if (rounded < min || rounded > max) return fallback;
  return rounded;
}

function asAlign(value: unknown, fallback: "left" | "center" | "right"): "left" | "center" | "right" {
  if (value === "left" || value === "center" || value === "right") return value;
  return fallback;
}

/** Resolved, fully-validated values used to build the CSS template. */
export interface ResolvedConfig {
  chatGutterPct: number;
  statsAlign: "left" | "center" | "right";
  userBubblePct: number;
  composerMaxHeightPct: number;
  /** Whether any field fell back from the input. Used for soft warnings. */
  fellBack: boolean;
  /** Reasons we fell back, in stable order. */
  fallbacks: string[];
}

export function resolveConfig(raw: unknown, defaults: {
  chatGutterPct: number;
  statsAlign: "left" | "center" | "right";
  userBubblePct: number;
  composerMaxHeightPct: number;
}): ResolvedConfig {
  const fallbacks: string[] = [];
  let section: Record<string, unknown> = {};
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    section = raw as Record<string, unknown>;
  } else if (raw !== undefined && raw !== null) {
    fallbacks.push("section-not-object");
  }

  const chatGutterPctInput = section[CHAT_GUTTER_PCT_FIELD] ?? defaults.chatGutterPct;
  const statsAlignInput = section[STATS_ALIGN_FIELD] ?? defaults.statsAlign;
  const userBubblePctInput = section[USER_BUBBLE_PCT_FIELD] ?? defaults.userBubblePct;
  const composerMaxHeightPctInput = section[COMPOSER_MAX_HEIGHT_PCT_FIELD] ?? defaults.composerMaxHeightPct;

  const chatGutterPctRaw = clampInt(
    chatGutterPctInput,
    CHAT_GUTTER_PCT_MIN,
    CHAT_GUTTER_PCT_MAX,
    defaults.chatGutterPct,
  );
  if (chatGutterPctRaw !== chatGutterPctInput) {
    fallbacks.push(`${CHAT_GUTTER_PCT_FIELD}=${JSON.stringify(chatGutterPctInput)}`);
  }

  const statsAlignRaw = asAlign(statsAlignInput, defaults.statsAlign);
  if (statsAlignRaw !== statsAlignInput) {
    fallbacks.push(`${STATS_ALIGN_FIELD}=${JSON.stringify(statsAlignInput)}`);
  }

  const userBubblePctRaw = clampInt(
    userBubblePctInput,
    USER_BUBBLE_PCT_MIN,
    USER_BUBBLE_PCT_MAX,
    defaults.userBubblePct,
  );
  if (userBubblePctRaw !== userBubblePctInput) {
    fallbacks.push(`${USER_BUBBLE_PCT_FIELD}=${JSON.stringify(userBubblePctInput)}`);
  }

  const composerMaxHeightPctRaw = clampInt(
    composerMaxHeightPctInput,
    COMPOSER_MAX_HEIGHT_PCT_MIN,
    COMPOSER_MAX_HEIGHT_PCT_MAX,
    defaults.composerMaxHeightPct,
  );
  if (composerMaxHeightPctRaw !== composerMaxHeightPctInput) {
    fallbacks.push(`${COMPOSER_MAX_HEIGHT_PCT_FIELD}=${JSON.stringify(composerMaxHeightPctInput)}`);
  }

  return {
    chatGutterPct: chatGutterPctRaw,
    statsAlign: statsAlignRaw,
    userBubblePct: userBubblePctRaw,
    composerMaxHeightPct: composerMaxHeightPctRaw,
    fellBack: fallbacks.length > 0,
    fallbacks,
  };
}

/**
 * Build the override stylesheet for one resolved config.
 *
 * The chat column cap is pinned to `100% - 2*chatGutterPct%` of the
 * conversation root via `--dsh-chat-content-width`. DSH 0.1.2-rc.1
 * ships the variable as an adaptive clamp
 * (`clamp(680px, column*0.64, 920px)`) that its drag-to-resize handles
 * can override through `--dsh-chat-user-width` (written inline on the
 * root); our `!important` class declaration wins over that, so the
 * slider stays the source of truth. The column itself
 * (`EvIC1a_column`) keeps the shipped `width: 100%` and
 * `margin: 0 auto`, so it still reflows on sidebar toggle and window
 * resize, exactly the way the user already knows.
 *
 * The composer card inherits the same cap through
 * `--dsh-composer-card-max-width`, which the shipped composer CSS
 * already reads. The stats line aligns to the user's choice via
 * `.-NDN2W_root { text-align: ... }`.
 */
export function buildStylesheet(config: ResolvedConfig): string {
  const g = config.chatGutterPct;
  const cap = `calc(100% - ${g * 2}%)`;
  const ub = `${config.userBubblePct}%`;
  const cmh = `${config.composerMaxHeightPct}vh`;

  return `
:root,
.wSkVaW_root,
[data-phase] {
  --dsh-chat-content-width: ${cap} !important;
  --dsh-composer-card-max-width: ${cap} !important;
}

/* User-message bubble width. The shipped cap (DSH 0.1.2-rc.1) is
 * max-width: min(calc(var(--dsh-chat-content-width,748px) * .702), 82%),
 * which keeps user bubbles narrow on wide columns. We replace the cap
 * with the configured userBubblePct of the chat column, so the bubble
 * scales with the column. The shipped align-items: flex-end on
 * .Sixlwa_userRow keeps the bubble pinned to the right edge. */
.Sixlwa_userStack {
  max-width: ${ub} !important;
}

/* Composer card height. The shipped card has no max-height, so on long
 * inputs the textarea + accessory row grow until they eat most of the
 * screen and hide the conversation above. We cap the inner textarea
 * scroll at the configured percentage of the viewport (minus the card's
 * chrome — accessory row, trigger row, padding, gaps) so the textarea
 * itself stops growing. The card's natural height follows the inner
 * scroll's cap; the conversation scroll above the composer shrinks to
 * make room.
 *
 * Note: we deliberately do NOT set overflow:hidden on the card.
 * Earlier versions did, to enforce a hard cap on the card's visible
 * box, but that clipped the popover menus (model picker, permission
 * presets, …) which open upward from the trigger row inside the card.
 * The menus are absolutely positioned descendants of an element inside
 * the card, so the card's overflow clipping killed them. With the card
 * free to overflow, the menus extend above the card into the
 * conversation area and are fully visible. */
.uV2eYG_scroll {
  /* min-height mirrors the shipped hero variant's input floor
   * (.uV2eYG_hero .uV2eYG_input { min-height: 52px }), so the typing
   * area stays usable even when the cap falls below the natural
   * height of its content. Without this, on a small viewport with a
   * low cap, the scroll collapses to ~28px and the trigger row below
   * it visually sits on top of the typing area. */
  min-height: 52px !important;
  max-height: calc(${cmh} - 64px) !important;
}
.uV2eYG_hero .uV2eYG_scroll {
  min-height: 52px !important;
  max-height: calc(${cmh} - 132px) !important;
}

.-NDN2W_root {
  text-align: ${config.statsAlign} !important;
}
`;
}

/**
 * Create a `<style>` tag owned by this plugin, return a disposer that removes
 * it. Mirrors the pattern shipped by `dsh-client-ui-*` packages: each plugin
 * tags its sheets with `data-plugin` so `claimStyles()` can attribute them
 * during boot, and `data-plugin-css` for the source map.
 */
export function injectStylesheet(css: string, pluginId: string): () => void {
  const tag = document.createElement("style");
  tag.dataset.plugin = pluginId;
  tag.dataset.pluginCss = `${pluginId}/styles.css`;
  tag.textContent = css;
  document.head.appendChild(tag);
  return () => {
    tag.remove();
  };
}
