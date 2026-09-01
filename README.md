# @furayoshi/dsh-wide-chat

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin that widens the conversation column to a configurable gutter, right-aligns the session stats strip, and adds a settings-row UI to tune both. Built for the DSH client plugin slot `settings.general.item`.

## What it does

The shipped web UI caps the chat content at `--dsh-chat-content-width: 748px` and centers the column with `margin: 0 auto`. On any monitor wider than ~1024 px, this leaves large empty gutters on both sides and an even more cramped reading area. This plugin replaces the cap with a configurable value, and right-aligns the session stats strip (token counts, duration, etc.) that ships centered under the composer.

A small row in the **General** settings page lets the user tune three values:

- **Chat column gutter** — a slider, 0–10 % of the viewport on each side. The shipped default is `1 %`.
- **Session-stats alignment** — a three-way toggle (left / center / right). The shipped default is `right`.
- **Keep text width when sidebar collapses** — a checkbox. When on, the column is a fixed-width centered block, so toggling the sidebar slides the text sideways but never re-wraps the words. When off, the column grows into the freed space (the original behavior). The shipped default is on.

Invalid values are soft-failed to the defaults with a `console.warn`; the page never breaks.

## Install

```sh
# Inside the profile directory (where cordis.patch.yml lives):
pnpm add @furayoshi/dsh-wide-chat
```

DSH picks the package up automatically on the next `dsh` start because `dsh.client` is declared in the `package.json`. No preset row or `cordis.patch.yml` edit is required.

The plugin's source lives in `src/`. The shipped `lib/client/index.js` is built by `npm run build`; if you change the source, run the build before publishing.

## How it works

The plugin is two halves:

- **Host** (`lib/index.js`) registers a settings namespace `dsh-wide-chat` with a `z.object` schema (`chatGutterPct`, `statsAlign`, `preserveGutterWhenSidebarCollapsed`).
- **Client** (`lib/client/index.js`) binds a `SettingsScope` to that namespace, re-injects the CSS override on every change, and registers a row into the `settings.general.item` slot.

The CSS override replaces the shipped `--dsh-chat-content-width` and `--dsh-composer-card-max-width` variables with a calc that fits the open-state cell, and pins the chat column + composer card to that width. The column is centered with `margin: 0 auto`; when the layout's center cell resizes (because the sidebar toggled), the column translates smoothly instead of reflowing.

```css
:root, .wSkVaW_root, [data-phase] {
  --dsh-chat-content-width:    calc(100vw - 280px - 64px - 12px - 2vw) !important;
  --dsh-composer-card-max-width: calc(100vw - 280px - 64px - 12px - 2vw) !important;
}
.Md3f7G_column {
  max-width: var(--dsh-chat-content-width) !important;
  width:     var(--dsh-chat-content-width) !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
.uV2eYG_card, .uV2eYG_notice, .wSkVaW_composerHero {
  max-width: var(--dsh-composer-card-max-width) !important;
  width: 100% !important;
}
.uV2eYG_root { align-items: center !important; }
.FJxK0a_root { text-align: right !important; }
```

The values `64px` and `12px` in the formula are the conversation scroll's left+right padding (`16 + 16 + composer-side-clearance` and the right-rail/details width respectively). The `280px` is the shipped expanded-sidebar width. All three are constants; see "Caveats" for the impact of upstream layout changes.

### Why a fixed-width column, not `width: 100%`?

A naive `width: 100%` on the column makes it follow the center-cell width, which grows when the sidebar collapses. The user sees the text re-wrap on every toggle. A `width: var(--dsh-chat-content-width)` with `margin: 0 auto` keeps the column at the same pixel width in both states; the cell resizes around it, and the column translates sideways as a single block. The visible gutter is `(cellWidth − columnWidth) / 2` on each side, which is the configured `chatGutterPct vw` in the open state and a larger value when the sidebar is collapsed (the trade-off is described under "Caveats").

### Why a settings row in `settings.general.item`?

DSH already ships a settings UI that exposes preference rows for the locale (`Language`), the theme (`Appearance`), and the conversation composer (`Composer Enter`). The slot `settings.general.item` is the additive seat for one more preference. Registering a row there puts the plugin in the same place as every other built-in toggle, so the user does not have to learn a new place to find the controls.

## Configuration

The three settings live in the `dsh-wide-chat` settings namespace. They can also be edited directly in the user's settings document if the npm install flow is bypassed (see the package's `cordis.patch.yml` and the host-side schema in `src/index.ts` for the canonical field names and bounds).

| Field | Type | Default | Range / values |
|---|---|---|---|
| `chatGutterPct` | number | `1` | 0–10 (clamped; integers) |
| `statsAlign` | string | `"right"` | `"left"`, `"center"`, `"right"` |
| `preserveGutterWhenSidebarCollapsed` | boolean | `true` | any boolean |

Invalid values are dropped to the defaults and a `console.warn` is logged with the offending field name. The page never refuses to render.

## Caveats

### This plugin overrides internal CSS-module class hashes

`.wSkVaW_root`, `.Md3f7G_column`, `.uV2eYG_card`, `.FJxK0a_root`, etc. are CSS-Modules-generated class names from `@deepseek-ai/dsh-client-ui-conversation`. Their hashes (the part after the underscore) are recomputed every time that package is rebuilt. Any release of `dsh-client-ui-conversation` can therefore silently break this plugin.

After upgrading `@deepseek-ai/dsh-client-ui-conversation`, check whether the chat column widens, the composer card resizes, and the stats line still right-aligns. If any of those regress, the upstream CSS-module hashes changed; see "Updating" below.

### Trade-off when the sidebar collapses (default `preserveGutterWhenSidebarCollapsed: true`)

The column is sized for the **open-state** cell, which is the smaller of the two. In the collapsed state, the cell is wider, so the centered column has more whitespace on each side than the configured `chatGutterPct`. The user's reading width stays the same (no reflow); the visible right gutter is roughly:

```
gutter_collapsed ≈ (224px + 2 * chatGutterPct vw) / 2
```

For the shipped 1 % default on a 1920 px viewport, that's about 121 px on each side. Toggling `preserveGutterWhenSidebarCollapsed` to `false` keeps the column at `100 %` of the cell, so it grows when the sidebar collapses; words re-wrap on every transition. The default is `true`.

### Layout constants are hard-coded

The column-width formula `100vw − 280px − 64px − 12px − 2vw` assumes the shipped sidebar width (280 px), scroll padding (32 + 32 px), and details-rail width (12 px). If the user has resized their sidebar via the layout drag handle, the column will be slightly off-center; a future revision can read the live grid template at runtime if this becomes a problem.

### Updating

When the upstream hashes change, the fix is mechanical but unavoidable until DSH exposes a stable public API for layout overrides. To update:

1. From `~/.dsh/profiles/web/node_modules/@deepseek-ai/dsh-client-ui-conversation`, find the current CSS-module prefixes. They appear in lines like `var ConversationRoot_module_css_default = { "root": "wSkVaW_root", ... }` and `var StatsLine_module_css_default = { "root": "FJxK0a_root", ... }` in `lib/client.js`.
2. Replace `wSkVaW_*`, `Md3f7G_*`, `uV2eYG_*`, `FJxK0a_*` in `src/client/css.ts` (and `src/client/WideChatRow.tsx` for the row's own self-drawn CSS, which uses the `dswc-` prefix and is unaffected).
3. `npm run build` and bump the version in `package.json`.

A regex search in `dsh-client-ui-conversation/lib/client.js` for `_module_css_default\s*=\s*{` and the surrounding CSS strings is usually enough.

## License

MIT — see [LICENSE](./LICENSE).
