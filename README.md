# @furayoshi/dsh-widechat

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin that widens the conversation column past the shipped 748px cap, with a configurable gutter on each side and a right-aligned session stats strip. Adds a settings row to the General page so the user can tune both without restarting DSH.

## What it does

The shipped DSH web UI caps the chat content at `--dsh-chat-content-width: 748px` and centers the column with `margin: 0 auto`. On any monitor wider than ~1024px this leaves large empty gutters on both sides and a narrow reading area. This plugin replaces the cap with `100% − 2 × chatGutterPct%` of the conversation root — so the column is sized to leave the configured gutter on each side — and right-aligns the session stats strip (token counts, duration, etc.) that ships centered under the composer.

A small row in the **General** settings page lets the user tune four values:

- **Chat column gutter** — a slider, 0–10% of the cell on each side. The shipped default is `1 %`.
- **Session-stats alignment** — a three-way toggle (left / center / right). The shipped default is `right`.
- **Your message bubble width** — a slider, 30–100% of the chat column. The shipped default is `75 %`. The user bubble is right-aligned; the rest of the conversation fills the column.
- **Composer max height** — a slider, 20–80% of the viewport. The shipped default is `50 %`. Caps the input card so long messages do not hide the conversation above.

Invalid values are soft-failed to the defaults with a `console.warn`; the page never breaks.

## Install

```sh
# Inside the profile directory (where cordis.patch.yml lives):
pnpm add @furayoshi/dsh-widechat
```

DSH picks the package up automatically on the next `dsh` start because `dsh.client` is declared in the `package.json`. No preset row or `cordis.patch.yml` edit is required.

The plugin's source lives in `src/`. The shipped `lib/client/index.js` is built by `npm run build`; if you change the source, run the build before publishing.

## How it works

The override is intentionally minimal. It changes ONE custom property:

```css
:root, .wSkVaW_root, [data-phase] {
  --dsh-chat-content-width: calc(100% - 2%) !important;        /* gutterPct × 2 */
  --dsh-composer-card-max-width: calc(100% - 2%) !important;
}
.FJxK0a_root { text-align: right !important; }                  /* or left/center */
```

DSH's shipped `.Md3f7G_column` rule is left untouched: `width: 100%`, `max-width: var(--dsh-chat-content-width)`, `margin: 0 auto`. That means the column is **the DSH default** — it reflows on sidebar toggle, it scales with the window, it scrolls the same way. The only change is the cap.

The plugin is two halves:

- **Host** (`lib/index.js`) registers a settings namespace `dsh-widechat` with a `z.object` schema (`chatGutterPct`, `statsAlign`, `userBubblePct`, `composerMaxHeightPct`).
- **Client** (`lib/client/index.js`) binds a `SettingsScope` to that namespace, re-injects the CSS override on every change, and registers a row into the `settings.general.item` slot.

### Why this is so small

Earlier iterations of this plugin tried to keep the column at a fixed pixel width so toggling the sidebar would not reflow the words. That turned out to be unworkable: the column was either too narrow on small viewports, or it overflowed the cell, or it reflowed anyway because the cell width changes with the sidebar. Trying to out-clever the layout made reading worse.

DSH's shipped chat column is already well-designed — it just caps at 748px. This plugin widens that cap, and nothing else. Toggle, scroll, resize — all the DSH default behavior you already know.

## Configuration

The four settings live in the `dsh-widechat` settings namespace. They can also be edited directly in the user's settings document if the npm install flow is bypassed (see the package's `cordis.patch.yml` and the host-side schema in `src/index.ts` for the canonical field names and bounds).

| Field | Type | Default | Range / values |
|---|---|---|---|
| `chatGutterPct` | number | `1` | 0–10 (clamped; integers) |
| `statsAlign` | string | `"right"` | `"left"`, `"center"`, `"right"` |
| `userBubblePct` | number | `75` | 30–100 (clamped; integers) |
| `composerMaxHeightPct` | number | `50` | 20–80 (clamped; integers) |

Invalid values are dropped to the defaults and a `console.warn` is logged with the offending field name. The page never refuses to render.

## Caveats

### This plugin overrides internal CSS-module class hashes

`.wSkVaW_root`, `.Md3f7G_column`, `.uV2eYG_card`, `.FJxK0a_root`, etc. are CSS-Modules-generated class names from `@deepseek-ai/dsh-client-ui-conversation`. Their hashes (the part after the underscore) are recomputed every time that package is rebuilt. Any release of `dsh-client-ui-conversation` can therefore silently break this plugin — in particular, if the shipped `max-width: var(--dsh-chat-content-width)` rule on `.Md3f7G_column` changes shape, our override no longer reaches it.

After upgrading `@deepseek-ai/dsh-client-ui-conversation`, check whether the chat column widens and the stats line still aligns. If either regresses, the upstream CSS-module hashes changed; see "Updating" below.

### The `chatGutterPct` is interpreted against the cell, not the viewport

DSH's chat column is `width: 100%` of its cell. The plugin's cap is `100% - 2 × chatGutterPct%`, where the percentage is of the cell. So `chatGutterPct: 1` means "leave 1% of the cell on each side as a gutter", not 1% of the viewport. With the sidebar open the cell is small, so the gutter is small in absolute pixels. With the sidebar closed the cell is wider, so the gutter is wider in pixels but still the same percentage. This is the DSH default behavior — preserved on purpose so the column reflows smoothly when the sidebar toggles.

### Updating

When the upstream hashes change, the fix is mechanical but unavoidable until DSH exposes a stable public API for layout overrides. To update:

1. From `~/.dsh/profiles/web/node_modules/@deepseek-ai/dsh-client-ui-conversation`, find the current CSS-module prefixes. They appear in lines like `var ConversationRoot_module_css_default = { "root": "wSkVaW_root", ... }` and `var StatsLine_module_css_default = { "root": "FJxK0a_root", ... }` in `lib/client.js`.
2. Replace `wSkVaW_*`, `Md3f7G_*`, `uV2eYG_*`, `FJxK0a_*` in `src/client/css.ts` (and `src/client/WideChatRow.tsx` for the row's own self-drawn CSS, which uses the `dswc-` prefix and is unaffected).
3. `npm run build` and bump the version in `package.json`.

A regex search in `dsh-client-ui-conversation/lib/client.js` for `_module_css_default\s*=\s*{` and the surrounding CSS strings is usually enough.

## License

MIT — see [LICENSE](./LICENSE).
