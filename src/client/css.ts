/**
 * Build the CSS override string for the `dsh-wide-chat` plugin from a settings
 * snapshot. The same template the dynamic Cordis plugin used; parameterized
 * by the user's `chatGutterPct` / `statsAlign` / `preserveGutterWhenSidebarCollapsed`
 * so they re-apply on every settings change without a restart.
 *
 * Class hashes are the CSS-modules-generated ones from
 * `@deepseek-ai/dsh-client-ui-conversation` and
 * `@deepseek-ai/dsh-client-ui-layout`. They are recomputed on every upstream
 * rebuild; when they change this file is what needs updating.
 */

import {
  CHAT_GUTTER_PCT_FIELD,
  CHAT_GUTTER_PCT_MAX,
  CHAT_GUTTER_PCT_MIN,
  PRESERVE_GUTTER_WHEN_SIDEBAR_COLLAPSED_FIELD,
  STATS_ALIGN_FIELD,
} from "../settings.js";

/** Re-exported for the row's slider min/max. */
export { CHAT_GUTTER_PCT_MIN, CHAT_GUTTER_PCT_MAX };

/**
 * Pixel width of the (expanded) left sidebar.
 *
 * DSH's layout grid is `sidebar | minmax(0, 1fr) center | details`. The
 * shipped default sidebar width is 280px (`clampWidth(px, 264, 420)` and
 * the user-default in `dsh-client-ui-layout` is `panels.sidebar: 280`).
 * The chat column is sized to fit the OPEN-state cell — the smaller of
 * the two — so the configured gutter holds in that state and the column
 * stays centered with extra breathing room in the collapsed state.
 *
 * The value is a constant because DSH does not expose the live sidebar
 * width as a CSS custom property — the layout package updates the grid
 * template via inline React style. If the user has resized their sidebar
 * (drag the right edge), the column will be slightly off-center; a
 * future revision can read the live width from the grid template at
 * runtime if this becomes a problem.
 */
const SIDEBAR_EXPANDED_PX = 280;

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

function asBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

/** Resolved, fully-validated values used to build the CSS template. */
export interface ResolvedConfig {
  chatGutterPct: number;
  statsAlign: "left" | "center" | "right";
  preserveGutterWhenSidebarCollapsed: boolean;
  /** Whether any field fell back from the input. Used for soft warnings. */
  fellBack: boolean;
  /** Reasons we fell back, in stable order. */
  fallbacks: string[];
}

export function resolveConfig(raw: unknown, defaults: {
  chatGutterPct: number;
  statsAlign: "left" | "center" | "right";
  preserveGutterWhenSidebarCollapsed: boolean;
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
  const preserveGutterInput = section[PRESERVE_GUTTER_WHEN_SIDEBAR_COLLAPSED_FIELD] ?? defaults.preserveGutterWhenSidebarCollapsed;

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

  const preserveGutterRaw = asBool(preserveGutterInput, defaults.preserveGutterWhenSidebarCollapsed);
  if (preserveGutterRaw !== preserveGutterInput) {
    fallbacks.push(`${PRESERVE_GUTTER_WHEN_SIDEBAR_COLLAPSED_FIELD}=${JSON.stringify(preserveGutterInput)}`);
  }

  return {
    chatGutterPct: chatGutterPctRaw,
    statsAlign: statsAlignRaw,
    preserveGutterWhenSidebarCollapsed: preserveGutterRaw,
    fellBack: fallbacks.length > 0,
    fallbacks,
  };
}

/**
 * Build the override stylesheet for one resolved config.
 *
 * Two ways the gutter interacts with the layout:
 *
 *   • `preserveGutterWhenSidebarCollapsed = true` (default): the chat text
 *     NEVER reflows when the sidebar toggles. The shipped DSH layout uses
 *     a CSS grid `sidebar | minmax(0, 1fr) center | details`. With the
 *     sidebar open the center cell is `100vw - 280px`; when the user
 *     collapses the sidebar the rail (56px) takes the slot, so the cell
 *     grows to `100vw - 56px`. To prevent the words from being re-wrapped
 *     on every transition, the column is given a FIXED width sized to
 *     fit the open-state cell (`100vw - 280px - 2 * chatGutterPct vw`).
 *     The column is centered in the cell with `margin: 0 auto`, so when
 *     the cell grows (sidebar collapsed) the column just shifts toward
 *     the center of the new space — the words translate as a single
 *     block, no per-word reflow. This matches what the default DSH
 *     chat layout does with the 748px cap; the words don't move during
 *     the cell-resize transition because they always sit inside a
 *     fixed-width centered block.
 *
 *     The "1% gutter" the user configures is the gutter in the OPEN
 *     state. In the collapsed state, the column is still 100vw - 280 -
 *     2vw wide, so the actual visible gutter on each side becomes
 *     `(224 + 2vw) / 2 ≈ 112 + 1vw`. This is the same trade-off the
 *     default DSH layout makes: the column is sized for the smaller
 *     cell, and the larger cell gets more breathing room.
 *
 *   • `preserveGutterWhenSidebarCollapsed = false`: the chat fills the
 *     available center cell, growing when the sidebar collapses. Words
 *     WILL reflow on every transition (the column width changes). This
 *     is the original behavior; it lets the user reclaim screen real
 *     estate when minimizing the sidebar.
 */
export function buildStylesheet(config: ResolvedConfig): string {
  const rightGutterPct = config.chatGutterPct;
  const sidebarWidth = SIDEBAR_EXPANDED_PX;

  if (config.preserveGutterWhenSidebarCollapsed) {
    // Column width fits the OPEN-state cell's content area (which is the
    // smaller of the two) minus the configured gutter on each side.
    // The same width is used in both states: the column is a fixed
    // centered block, so toggling the sidebar slides it sideways but
    // never re-wraps the words. The 64px in the formula is the
    // conversation scroll's left+right padding (16px + 16px
    // `composer-side-clearance`); the 12px is the right-rail/details
    // width. Subtract those to make sure the column doesn't overflow
    // the open cell's content area, which would clip on the right
    // because the cell has `overflow: hidden`.
    const columnWidth = `calc(100vw - ${sidebarWidth}px - 64px - 12px - ${rightGutterPct * 2}vw)`;

    return `
:root,
.wSkVaW_root,
[data-phase] {
  --dsh-chat-content-width: ${columnWidth} !important;
  --dsh-composer-card-max-width: ${columnWidth} !important;
}

.Md3f7G_column {
  max-width: var(--dsh-chat-content-width) !important;
  width: var(--dsh-chat-content-width) !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

.uV2eYG_root {
  /* Keep the shipped align-items: center so the composer card stays
   * centered when it shrinks below the root's content area; do NOT
   * stretch, or the card is left-aligned and the column/composer
   * alignment we worked to achieve breaks. The shipped width: 100%
   * is not overridden here — the cell already gives the root its
   * full width as a flex child. */
  align-items: center !important;
}

.uV2eYG_card,
.uV2eYG_notice,
.wSkVaW_composerHero {
  max-width: var(--dsh-composer-card-max-width) !important;
  width: 100% !important;
}

.FJxK0a_root {
  text-align: ${config.statsAlign} !important;
}
`;
  }

  // preserveGutterWhenSidebarCollapsed = false: chat fills the cell.
  const totalReservedPct = config.chatGutterPct * 2;
  const widthValue = `${100 - totalReservedPct}%`;

  return `
:root,
.wSkVaW_root,
[data-phase] {
  --dsh-chat-content-width: ${widthValue} !important;
  --dsh-composer-card-max-width: ${widthValue} !important;
}

.Md3f7G_column {
  max-width: var(--dsh-chat-content-width) !important;
  width: var(--dsh-chat-content-width) !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

.uV2eYG_root {
  align-items: center !important;
  width: 100% !important;
  max-width: 100% !important;
}

.uV2eYG_card,
.uV2eYG_notice,
.wSkVaW_composerHero {
  max-width: var(--dsh-composer-card-max-width) !important;
  width: 100% !important;
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
