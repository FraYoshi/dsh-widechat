/**
 * Build the CSS override string for the `dsh-widechat` plugin from a
 * settings snapshot. The two configurable knobs are `chatGutterPct`
 * (a percentage of the cell width on each side) and `statsAlign`
 * (where the session-stats strip lines up under the composer).
 *
 * The override is intentionally minimal: it changes ONE custom property
 * (--dsh-chat-content-width, the column's max-width) and lets DSH's
 * shipped chat-column CSS keep doing everything else. That means the
 * column is `width: 100%; max-width: <cap>; margin: 0 auto;` exactly as
 * DSH ships it, so toggling the sidebar, resizing the window, and
 * scrolling the conversation all behave the way the user already knows.
 *
 * Class hashes are the CSS-modules-generated ones from
 * `@deepseek-ai/dsh-client-ui-conversation` and
 * `@deepseek-ai/dsh-client-ui-layout`. They are recomputed on every
 * upstream rebuild; when they change this file is what needs updating.
 */

import {
  CHAT_GUTTER_PCT_FIELD,
  CHAT_GUTTER_PCT_MAX,
  CHAT_GUTTER_PCT_MIN,
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
  /** Whether any field fell back from the input. Used for soft warnings. */
  fellBack: boolean;
  /** Reasons we fell back, in stable order. */
  fallbacks: string[];
}

export function resolveConfig(raw: unknown, defaults: {
  chatGutterPct: number;
  statsAlign: "left" | "center" | "right";
  userBubblePct: number;
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

  return {
    chatGutterPct: chatGutterPctRaw,
    statsAlign: statsAlignRaw,
    userBubblePct: userBubblePctRaw,
    fellBack: fallbacks.length > 0,
    fallbacks,
  };
}

/**
 * Build the override stylesheet for one resolved config.
 *
 * The chat column cap is widened from the shipped 748px to
 * `100% - 2*chatGutterPct%` of the conversation root. The column
 * itself keeps the shipped `width: 100%` and `margin: 0 auto`, so it
 * still reflows on sidebar toggle and window resize, exactly the way
 * the user already knows — the only change is that the column is no
 * longer capped at 748px and now leaves a configurable gutter on each
 * side.
 *
 * The composer card inherits the same cap through
 * `--dsh-composer-card-max-width`, which the shipped composer CSS
 * already reads. The stats line aligns to the user's choice via
 * `.FJxK0a_root { text-align: ... }`.
 */
export function buildStylesheet(config: ResolvedConfig): string {
  const g = config.chatGutterPct;
  const cap = `calc(100% - ${g * 2}%)`;
  const ub = `${config.userBubblePct}%`;

  return `
:root,
.wSkVaW_root,
[data-phase] {
  --dsh-chat-content-width: ${cap} !important;
  --dsh-composer-card-max-width: ${cap} !important;
}

/* User-message bubble width. The shipped cap is
 * max-width: min(525px, 82%), which keeps user bubbles narrow on wide
 * columns. We replace the cap with the configured userBubblePct of
 * the chat column, so the bubble scales with the column. The shipped
 * align-items: flex-end on .gdEzaW_userRow keeps the bubble pinned
 * to the right edge. */
.gdEzaW_userStack {
  max-width: ${ub} !important;
}

.FJxK0a_root {
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
