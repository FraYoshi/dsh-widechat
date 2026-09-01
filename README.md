# dsh-wide-chat

Widens the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) conversation column to ~98% of the available center-column width and right-aligns the session stats strip. Two small CSS overrides, one plugin.

## What it does

The shipped web UI caps the chat content at `--dsh-chat-content-width: 748px` and centers the column with `margin: 0 auto`. On any monitor wider than ~1024 px, this leaves large empty gutters on both sides. This plugin overrides the cap so the column uses ~98% of whatever width the layout's center cell actually has — whether the sidebar is expanded or collapsed.

It also right-aligns the session stats line that ships centered under the composer (token counts, duration, etc.). The block keeps its outer centering margin so it still lines up with the chat column, but the text inside moves to the right edge.

## Install

```sh
# Inside the profile directory (where cordis.patch.yml lives):
pnpm add @furayoshi/dsh-wide-chat
```

DSH picks the package up automatically on the next `dsh` start because `dsh.client` is declared in the `package.json`. No preset row or `cordis.patch.yml` edit is required.

## How it works

The plugin's browser half (`lib/client.js`) injects a small CSS override during Cordis apply:

```css
:root, .wSkVaW_root, [data-phase] {
  --dsh-chat-content-width: 98% !important;
  --dsh-composer-card-max-width: 98% !important;
}
.Md3f7G_column { /* chat column */
  max-width: var(--dsh-chat-content-width) !important;
  width: 100% !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
.uV2eYG_root { align-items: stretch !important; width: 100% !important; max-width: 100% !important; }
.uV2eYG_card, .uV2eYG_notice, .wSkVaW_composerHero {
  max-width: var(--dsh-composer-card-max-width) !important;
  width: 100% !important;
}
```

The injection is registered with `ctx.effect`, so stopping the plugin or reloading DSH removes the tag and restores the original layout.

## Caveats

### This plugin overrides internal CSS-module class hashes

`.wSkVaW_root`, `.Md3f7G_column`, `.uV2eYG_card`, `.FJxK0a_root`, etc. are CSS-Modules-generated class names from `@deepseek-ai/dsh-client-ui-conversation`. Their hashes (the part after the underscore) are recomputed every time that package is rebuilt. Any release of `dsh-client-ui-conversation` can therefore silently break this plugin.

After upgrading `@deepseek-ai/dsh-client-ui-conversation`, check whether the conversation still widens and the stats line still right-aligns. If either regresses, the upstream CSS-module hashes changed; see "Updating" below.

### Updating

When the upstream hashes change, the fix is mechanical but unavoidable until DSH exposes a stable public API for layout overrides. To update:

1. From `~/.dsh/profiles/web/node_modules/@deepseek-ai/dsh-client-ui-conversation`, find the current CSS-module prefixes. They appear in lines like `var ConversationRoot_module_css_default = { "root": "wSkVaW_root", ... }` and `var StatsLine_module_css_default = { "root": "FJxK0a_root", ... }` in `lib/client.js`.
2. Replace `wSkVaW_*`, `Md3f7G_*`, `uV2eYG_*`, `FJxK0a_*` in `lib/client.js` with the new prefixes.
3. Bump the version in `package.json` and publish.

A regex search in `dsh-client-ui-conversation/lib/client.js` for `_module_css_default\s*=\s*{` and the surrounding CSS strings is usually enough.

## License

MIT — see [LICENSE](./LICENSE).