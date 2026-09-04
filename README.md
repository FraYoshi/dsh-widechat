# @furayoshi/dsh-widechat

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin that widens the conversation column past the shipped 748px cap, right-aligns the session stats strip, and caps the composer card so long inputs do not hide the conversation above. Adds a settings row to the General page so all of these can be tuned without restarting DSH.

**NOTE**: as at the current state, this packages has been heavily vibecoded, including most of this README. I might rewrite it at the later date, but you have been warned :)

![widechat ui](media/widechat-ui.webp)

![widechat settings](media/widechat-settings.webp)

## What it does

The shipped DSH web UI caps the chat content at `--dsh-chat-content-width: 748px` and centers the column with `margin: 0 auto`. On any monitor wider than ~1024px this leaves large empty gutters on both sides and a narrow reading area. This plugin widens that cap to leave only the configured gutter, right-aligns the user-message bubble (the shipped default is narrow on wide viewports), and caps the composer card to a percentage of the viewport so long inputs do not eat the conversation above.

A small row in the **General** settings page lets you tune four values:

- **Chat column gutter** — a slider, 0–10% of the cell on each side. The shipped default is `1 %`. The column is sized to leave this much whitespace on each side.
- **Session-stats alignment** — a three-way toggle (left / center / right). The shipped default is `right`. The session-stats line under the composer (token counts, duration, etc.) lines up accordingly.
- **Your message bubble width** — a slider, 30–100% of the chat column. The shipped default is `75 %`. Your outgoing messages are right-aligned at this width; the assistant's messages fill the rest of the column.
- **Composer max height** — a slider, 20–80% of the viewport. The shipped default is `50 %`. The composer card and its inner textarea are both capped at this height, so long inputs do not push the conversation off-screen.

If a saved value is out of range or of the wrong type, the plugin falls back to the default and logs a `console.warn` with the offending field. The page never refuses to render.

## Install

DSH's `plugin` subcommand forwards pnpm commands into the profile directory and reconciles the profile's `dsh.profile.bundles` array against the installed packages. So `dsh plugin --profile web add <spec>` is the canonical install path: it runs `pnpm add <spec>`, then automatically appends the package to `bundles` if (and only if) the installed `package.json` declares a `dsh.bundle.patch` — which this package does.

### From npmjs

```sh
dsh plugin --profile web add @furayoshi/dsh-widechat
```

The `dsh plugin add` command runs `pnpm add` to install the package into `~/.dsh/profiles/web/node_modules/`, then reconciles the `dsh.profile.bundles` array in `~/.dsh/profiles/web/package.json` to include the new bundle. The user does not need to edit `package.json` manually.

### From a GitHub URL

```sh
dsh plugin --profile web add @furayoshi/dsh-widechat@github:FraYoshi/dsh-widechat
```

The `github:<owner>/<repo>` spec is pnpm's shorthand for `https://github.com/<owner>/<repo>.git`. To pin a specific version:

```sh
# A specific tag
dsh plugin --profile web add @furayoshi/dsh-widechat@github:FraYoshi/dsh-widechat#v0.7.0

# A branch (e.g. main)
dsh plugin --profile web add @furayoshi/dsh-widechat@github:FraYoshi/dsh-widechat#main

# A specific commit SHA (for reproducible installs)
dsh plugin --profile web add @furayoshi/dsh-widechat@github:FraYoshi/dsh-widechat#a1b2c3d4
```

pnpm clones the repo, runs `npm pack` from the cloned `package.json` to build the tarball (so the `files: ["lib", "cordis.patch.yml", ...]` list matters), and installs it. As long as `cordis.patch.yml` is in `files`, DSH's bundle loader finds it on the next boot.

### From a local path or clone

If you have the source locally (or want to hack on it), install it directly:

```sh
dsh plugin --profile web add @furayoshi/dsh-widechat@file:/home/<you>/work/dsh-widechat
```

The `file:` spec is pnpm's way to install from a local path. pnpm links the package's `files` into the profile's `node_modules/@furayoshi/dsh-widechat/`. The profile's `pnpm-workspace.yaml` sets `nodeLinker: hoisted`, so the linked files are **copies**, not symlinks — this means a rebuild of the source does **not** automatically reflect in the installed copy. After editing `src/` and running `npm run build:client`, re-link the package:

```sh
# From inside the profile directory:
rm -rf node_modules/@furayoshi && pnpm install
```

Then restart DSH to pick up the new bundle. (A future version of this plugin could provide a dev script that watches and rebuilds; for now the manual `rm` is the workflow.)

### Updating, removing, verifying

Because `dsh plugin` is just a pnpm forwarder, you can use any pnpm subcommand. From inside the profile directory:

```sh
# Update to the latest version
pnpm update @furayoshi/dsh-widechat

# Re-link after editing the source
rm -rf node_modules/@furayoshi && pnpm install

# Remove the plugin (also strips the entry from dsh.profile.bundles)
dsh plugin --profile web remove @furayoshi/dsh-widechat
```

### Verifying the install

Open the Web UI, click the settings cog, go to **General** — you should see a "Wide chat" row with the four controls. Drag the sliders, and the chat column / user bubble / composer update without a reload.

To verify DSH actually loaded the bundle, from inside the profile directory:

```sh
dsh web --dump-config | grep -i "widechat\|furayoshi"
```

You should see the host row registered under the new package name.

If you want to edit the source, the build is `npm run build` (which calls `tsc` for the host lib and `tsx scripts/build-client.ts` for the browser bundle). The `lib/` directory is shipped; the `src/` directory is the source.

## How it works

The plugin is two halves:

- **Host** (`lib/index.js`) registers a settings namespace `dsh-widechat` with a `z.object` schema (`chatGutterPct`, `statsAlign`, `userBubblePct`, `composerMaxHeightPct`). The schema's bounds match the slider ranges exactly.
- **Client** (`lib/client/index.js`) binds a `SettingsScope` to that namespace, re-injects a small CSS override on every scope change, and registers a row in the `settings.general.item` slot.

The CSS override is intentionally minimal — it touches four things, one per setting:

```css
:root, .wSkVaW_root, [data-phase] {
  --dsh-chat-content-width:        calc(100% - 2 × <chatGutterPct>%) !important;
  --dsh-composer-card-max-width:   calc(100% - 2 × <chatGutterPct>%) !important;
}
.gdEzaW_userStack { max-width: <userBubblePct>% !important; }
.uV2eYG_card     { max-height: <composerMaxHeightPct>vh !important; overflow: hidden !important; }
.uV2eYG_scroll   { max-height: calc(<composerMaxHeightPct>vh - 64px) !important; }
.FJxK0a_root     { text-align: <statsAlign> !important; }
```

`chatGutterPct` and `userBubblePct` are **percentages of the cell**; `composerMaxHeightPct` is a **percentage of the viewport**. The cell grows when the sidebar collapses to the rail (56px from 280px), so the column and the bubble grow with it — and the gutter stays at the same percentage. The composer cap, in contrast, is absolute to the viewport so the conversation above is always visible regardless of the sidebar state.

The reason there are two rules for the composer (`uV2eYG_card` and `uV2eYG_scroll`) is that the shipped card has *no* max-height and the shipped inner scroll has `max-height: var(--dsh-composer-text-max-height)` (336px by default). Without overriding the inner scroll too, the user's `composerMaxHeightPct` slider would only take effect at values that allow the inner 336px cap to grow, which is values ≥ 19% on a 1914px viewport — the slider would feel broken above 20% on smaller viewports. The inner override (`- 64px` leaves room for the card's padding and accessory row) makes the slider's effect span the full 20–80 range.

DSH's shipped rules are left untouched. The column is still `width: 100%`, `max-width: var(--dsh-chat-content-width)`, `margin: 0 auto`. Toggle, scroll, resize — all the DSH default behavior. The plugin only changes the values of variables (and a few hard caps on the composer) that DSH's CSS already reads.

## Configuration

The four settings live in the `dsh-widechat` settings namespace. They can also be edited directly in the user's settings document if the npm install flow is bypassed (the file-backed settings doc lives at `~/.dsh/settings.yaml`; see the host-side schema in `src/index.ts` for the canonical field names and bounds).

| Field | Type | Default | Range / values | Reference |
|---|---|---|---|---|
| `chatGutterPct` | number | `1` | 0–10 (clamped; integers) | cell width |
| `statsAlign` | string | `"right"` | `"left"`, `"center"`, `"right"` | — |
| `userBubblePct` | number | `75` | 30–100 (clamped; integers) | chat column |
| `composerMaxHeightPct` | number | `50` | 20–80 (clamped; integers) | viewport |

The slider value is the percentage applied to the reference for that row. A value of `0` is allowed for `chatGutterPct` (no gutter at all), and `100` for `userBubblePct` (your bubble fills the column). `composerMaxHeightPct` at `0` would clip the composer entirely; the slider starts at `20` to keep it usable.

Invalid values are dropped to the defaults and a `console.warn` is logged with the offending field name.

## Caveats

### This plugin overrides internal CSS-module class hashes

`.wSkVaW_root`, `.Md3f7G_column`, `.uV2eYG_card`, `.uV2eYG_scroll`, `.gdEzaW_userStack`, `.FJxK0a_root` are CSS-Modules-generated class names from `@deepseek-ai/dsh-client-ui-conversation`. Their hashes (the part after the underscore) are recomputed every time that package is rebuilt. Any release of `dsh-client-ui-conversation` can therefore silently break this plugin — specifically, if the shipped rule that reads the variable or has the matching class name changes shape, our override no longer reaches it.

After upgrading `@deepseek-ai/dsh-client-ui-conversation`, check whether the chat column widens, the user bubble stays right-aligned at the configured width, the composer is capped at the configured height, and the stats line still aligns. If any of those regress, the upstream CSS-module hashes changed; see "Updating" below.

### The `chatGutterPct` is interpreted against the cell, not the viewport

DSH's chat column is `width: 100%` of its cell. The plugin's cap is `100% - 2 × chatGutterPct%`, where the percentage is of the cell. So `chatGutterPct: 1` means "leave 1% of the cell on each side as a gutter", not 1% of the viewport. With the sidebar open the cell is small, so the gutter is small in absolute pixels. With the sidebar closed the cell is wider, so the gutter is wider in pixels but still the same percentage. This is the DSH default behavior — preserved on purpose so the column reflows smoothly when the sidebar toggles.

### The `composerMaxHeightPct` is interpreted against the viewport, not the cell

Unlike the other two percentages, the composer cap is `composerMaxHeightPct × 1vh`. The viewport is constant regardless of the sidebar state, so the cap doesn't change when the sidebar toggles. This is intentional: the cap exists to keep the conversation visible, which is a viewport-relative concern.

### What `cordis.patch.yml` is for

The package ships a `cordis.patch.yml` (in `files: ["lib", "cordis.patch.yml", "README.md", "LICENSE"]`) that inserts a single host row into DSH's host composition. The row's `apply()` is the function in `src/index.ts` that registers the `dsh-widechat` settings namespace. Without the patch, the host has no idea the plugin exists, the namespace is never registered, and the client side's `bind()` call would resolve a read-only scope. If you fork this plugin and rename the namespace, update the `id` in the patch to match.

## Updating

When the upstream hashes change, the fix is mechanical but unavoidable until DSH exposes a stable public API for layout overrides. The plugin targets six CSS-module class hashes:

- `.wSkVaW_root` — the conversation root (defines the chat-content-width variable)
- `.Md3f7G_column` — the chat column (reads the variable as max-width)
- `.uV2eYG_card` — the composer card (we cap its max-height)
- `.uV2eYG_scroll` — the composer's inner textarea scroll (we cap its max-height)
- `.gdEzaW_userStack` — the user-message bubble stack (we set its max-width)
- `.FJxK0a_root` — the session-stats line (we set its text-align)

All six appear in `dsh-client-ui-conversation/lib/client.js`. A regex search for `_module_css_default\s*=\s*{` will land you near the manifests. To update:

1. Open the new `dsh-client-ui-conversation/lib/client.js` in your editor and search for each of the six names above. If a name has changed (the part after the underscore), update the corresponding name in `src/client/css.ts`. If a name has been removed (e.g. DSH restructured the composer), comment out the matching rule and the matching slider in `src/client/WideChatRow.tsx`, and update the README's Caveats and "How it works" sections to match.
2. `npm run build` to rebuild the host and client bundles.
3. Bump the version in `package.json` (the user-facing change is a patch for a single-hash fix, minor for a class-set change, major for an API change).

## License

MIT — see [LICENSE](./LICENSE).
