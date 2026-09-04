# AGENTS.md

> Quick orientation for a future agent (human or LLM) who lands in this repo.
> This document is the first thing to read; the README is the second.
> The README is user-facing. **This file is maintainer-facing.**

---

## 1. What this is, in one paragraph

`@furayoshi/dsh-widechat` is a DSH (DeepSeek Harness) web profile plugin. It does four things and four things only: widens the chat column, right-aligns the session-stats strip, caps the user-message bubble's width, and caps the composer card's height. It is two halves (a host Cordis plugin + a client Cordis plugin) coordinated by a settings namespace. It is intentionally minimal — every CSS rule it injects is one per setting, with `!important`, and survives DSH layout changes until DSH renames one of the six CSS-module class hashes the plugin targets.

## 2. The big picture

DSH plugins are dual-face npm packages: the **host** half runs in the Node.js DSH process, the **client** half runs in the browser. A package declares both in `package.json` under `dsh.bundle.patch` and `dsh.client`. DSH's `client-modules` service scans the host loader's entries, looks at each entry's `package.json`, picks up any package declaring `dsh.client` with a matching `exports["./client"]`, and serves the bundled `lib/client/index.js` at `/plugins/<id>/client.js`. The browser's module loader fetches that URL and registers the plugin with the client-side Cordis runtime.

The host-side registration (the `cordis.patch.yml` row + the `apply` in `src/index.ts`) and the client-side registration (`src/client/index.ts`) **must both succeed** for the plugin to be useful. Either one failing is silent: the row might not appear in settings, or the CSS override might not be injected, with no console error visible to the user.

## 3. The brittle parts (the things that will break)

DSH is at version 0.1. The shipped chat-column CSS lives in CSS-Modules-generated class names. **The plugin overrides class-name selectors, not stable IDs.** When `@deepseek-ai/dsh-client-ui-conversation` is rebuilt, the hashes after the underscore are recomputed. The plugin targets six of them:

| CSS-module hash | What it is | What the plugin does to it |
|---|---|---|
| `wSkVaW_root` | Conversation root (defines `--dsh-chat-content-width` as 748px) | Override to `calc(100% - 2 × chatGutterPct%)` |
| `Md3f7G_column` | The chat column itself | Nothing — left at shipped `width: 100%; max-width: var(...)` |
| `uV2eYG_card` | The composer card (the rounded pill) | Cap `max-height` to `composerMaxHeightPct vh`; `overflow: hidden` |
| `uV2eYG_scroll` | The composer's inner textarea scroll | Cap `max-height` to `calc(composerMaxHeightPct vh - 64px)` so the user's cap takes effect |
| `gdEzaW_userStack` | The user-message bubble's stack | Cap `max-width` to `userBubblePct%` |
| `FJxK0a_root` | The session-stats line under the composer | Set `text-align` |

When DSH changes any of these class names, the override silently stops applying. The plugin's `apply()` doesn't know. The user sees the column at 748px, the bubble at 525px, the composer at the natural ~43vh, and wonders why their sliders don't do anything.

**To find the current hashes:** `~/.dsh/profiles/web/node_modules/@deepseek-ai/dsh-client-ui-conversation/lib/client.js`. Search for `_module_css_default\s*=\s*{` and follow the `key: "wSkVaW_root"`, `key: "Md3f7G_column"`, etc. lines. The keys are the new class names.

Other brittle surfaces:

- The `--dsh-chat-content-width` variable is read by `.Md3f7G_column` as `max-width: var(--dsh-chat-content-width)`. If DSH renames the variable, the override stops reaching the column. The shipped value is `748px` on `.wSkVaW_root`; the variable name has been stable for at least 0.1.0-rc.2 through 0.1.1-rc.2.
- The `--dsh-composer-text-max-height` variable is the shipped inner-scroll cap (336px). The plugin overrides `uV2eYG_scroll`'s `max-height` directly rather than setting this variable — the variable is set by the conversation package and a future refactor could remove the override path.
- The SettingsScope API (the `ctx.settingsScope.bind({ namespace })` call) is a Cordis service. DSH might rename the service or change the signature. The plugin uses a local `ScopeLike` interface so the type dependency is only structural, not nominal.

## 4. How to test safely without restarting DSH

Restarting DSH is the slowest feedback loop and, on a real install, requires the user to re-load the Web UI. A faster path exists: a **dynamic Cordis test plugin** can be loaded without DSH restart.

The pattern (used during the v0.4.0 → v0.5.0 development cycle):

1. From a `cordis_define` call (in this development environment, via the `cordis_define` tool), submit a package with both `host` and `client` source. The client source uses `styles.insert(css)` (only available in the dynamic runner path, not in the static `injectStylesheet` path). Submit a candidate CSS template plus a measurement script that selects the relevant DOM nodes and prints their `getBoundingClientRect()`.
2. The user approves the card in the UI.
3. The plugin's `client.apply()` runs in the browser, injecting the test CSS and measuring.
4. The agent reads the measurements and iterates.

The current dev environment has a dynamic plugin `wcfg-2` that was used during the v0.4.0 → v0.5.0 testing. Its definitions are kept (not deleted) so the workflow is reproducible. To run the dev cycle: write the candidate CSS into the plugin source, call `cordis_define` to update, `cordis_run` to install, read the measurements from the browser console, iterate.

## 5. The local install workflow

The plugin lives at `~/workspaces/dsh-widechat/` (this repo). The DSH profile lives at `~/.dsh/profiles/web/`. The plugin is installed into the profile's `node_modules/` and listed in the profile's `package.json` `dependencies` + `dsh.profile.bundles`.

**First-time install (or re-link after editing the source):**

```sh
# Add the bundle to the profile (registers it in dsh.profile.bundles):
dsh plugin --profile web add @furayoshi/dsh-widechat@file:/home/<you>/work/dsh-widechat
```

`dsh plugin add` runs `pnpm add <spec>` in the profile directory, then reconciles `dsh.profile.bundles`. The user does **not** edit `package.json` manually.

**Important gotcha: hoisted linker does not auto-sync on rebuild.** The profile's `pnpm-workspace.yaml` sets `nodeLinker: hoisted`. pnpm copies the package's `files` into `node_modules/@furayoshi/dsh-widechat/` as **regular file copies** (not symlinks, not hard links). When `src/` is edited and `npm run build` is run, the installed copy is **not** automatically updated. To pick up the new build:

```sh
# From inside the profile directory:
rm -rf node_modules/@furayoshi && pnpm install
```

This is the workflow that has worked in practice. The `dsh plugin add` command does **not** do this for you (it only does the first link).

**After install, restart DSH** to load the new bundle. If the profile is managed by systemd: `sudo systemctl restart dsh.service`. The DSH process loads the bundle list at boot; the new plugin only appears in the Web UI after a restart.

## 6. The development cycle

```sh
# 1. Edit src/...
# 2. Rebuild:
cd ~/workspaces/dsh-widechat
npm run build
# 3. Re-link to the profile (because hoisted linker):
cd ~/.dsh/profiles/web
rm -rf node_modules/@furayoshi && pnpm install
# 4. Restart DSH so the bundle loader picks up the new file:
sudo systemctl restart dsh.service
# 5. Reload the Web UI (Ctrl+Shift+R) so the browser fetches the new /plugins/.../client.js.
# 6. Verify with the dump:
dsh web --dump-config | grep -i "widechat\|furayoshi"
# Should show the host row registered.
```

`npm run build` does two things:

- `tsc -p tsconfig.json` — emits `lib/index.js`, `lib/index.d.ts`, `lib/settings.js`, `lib/settings.d.ts` (the host half).
- `tsx scripts/build-client.ts` — bundles the client half into `lib/client/index.js`, wraps it in `window.__ModuleLoader__.load({...})`, and asserts that all `require()` calls in the bundle are in the loader's seed table. The assertion is the searxng plugin's pattern and the only thing standing between a typo'd import and an unusable Web UI.

## 7. Common gotchas

These have all bitten this codebase at least once.

- **`cordis.patch.yml` must be in `package.json`'s `files` array.** pnpm does not copy files outside the `files` list. If `cordis.patch.yml` is missing from `node_modules/<pkg>/`, DSH crashes on profile boot with `ENOENT: failed to read overlay`. The fix is `files: ["lib", "cordis.patch.yml", "README.md", "LICENSE"]` (or similar). This bit us in v0.4.0.
- **The `id` in `cordis.patch.yml` must match the package name exactly.** DSH's bundle loader looks up bundles by name; a mismatch makes the bundle invisible. The convention: `id: '@furayoshi/dsh-widechat'`, `name: '@furayoshi/dsh-widechat'`. If the namespace is renamed in `src/settings.ts`, the patch's `id` must follow.
- **Trailing garbage on `package.json`.** When the profile's `package.json` is hand-edited, a stray `n` (or any other character) at the end makes the file invalid JSON. DSH's loader throws on the next boot. Always parse the file with `python3 -c "import json; json.load(open('...'))"` after editing.
- **The dynamic Cordis test runner's `setTimeout` is unavailable.** Use `ctx.setTimeout` after declaring `inject: ['timer']`. The browser's `setTimeout` is trapped.
- **SettingsScope is read-only in some modes.** If the host's `settings` service isn't available (e.g., a profile that doesn't ship a settings-file plugin), the host's `apply()` inject callback never resolves and the namespace is never registered. The client's `bind()` then returns a scope that reads `undefined` and writes silently fail. Symptom: the row appears in the General page but the sliders don't change the CSS. The current profile ships `@deepseek-ai/dsh-settings-file`; if the user removes it, the plugin breaks.
- **The dynamic test plugin's `apply()` runs synchronously inside `ctx.effect`.** If `applyForScope` throws, the error is caught by Cordis and logged to the fiber's internal diagnostics — **not** to the browser console. Add `console.log(...)` at the start of `apply()` and inside each branch to see what's actually executing.
- **`overflow-anchor: auto` is a CSS-modules thing.** The `style[data-plugin-css*="..."]` selector on injected styles is the convention for attributing which plugin owns which style tag. The conversation package uses this to claim styles. Follow the same pattern in the plugin's `injectStylesheet`.

## 8. How to extend

### Add a new setting

1. Add the field constant + bounds to `src/settings.ts`:
   ```ts
   export const NEW_FIELD = "newField";
   export const NEW_MIN = 0;
   export const NEW_MAX = 100;
   export const DEFAULTS = { ..., [NEW_FIELD]: 50 } as const;
   ```
2. Add the field to the host schema in `src/index.ts` (export the constants and the schema, add a zod entry).
3. Add the field to `ResolvedConfig` and `resolveConfig` in `src/client/css.ts` (clamp to bounds, log fallback).
4. Add the field to `ResolvedValues` and `readValues` in `src/client/WideChatRow.tsx` (read from scope, clamp to bounds, default).
5. Add the slider/input to the row's render output. Match the pattern of the existing sliders.
6. Add a CSS rule in `buildStylesheet` in `src/client/css.ts` that references the new field.
7. Add the field + bounds to the configuration table in `README.md`.
8. Build, re-link, restart, verify.

### Change a CSS rule

1. Edit `src/client/css.ts`. The `buildStylesheet` function returns a single template literal — one rule per setting. Add `!important` to anything that needs to win over a DSH rule.
2. The build script's `require` assertion (`scripts/build-client.ts`) checks that every `require()` call resolves to a value in the `CLIENT_EXTERNALS` table. The plugin currently uses `react` and `react/jsx-runtime`. If a new value import is needed, add it to `CLIENT_EXTERNALS` (and to `devDependencies` in `package.json`).
3. The browser's class-name hashes are checked at runtime by `claimStyles` (in `@deepseek-ai/dsh-client-modules`). If a hash is wrong, the Web UI fails to load with a `data-plugin-css=...` not-found error in the console.

### Debug a live problem

1. Open the Web UI's dev console (F12 or Cmd+Opt+I).
2. Run `document.querySelectorAll('style[data-plugin="dsh-widechat"]')` — should be 2 (one from `installRowStyles`, one from the per-scope CSS injection).
3. Run `document.querySelectorAll('style[data-plugin-css*="dsh-widechat"]')` — the `dswc-row` styles should be there.
4. Run `getComputedStyle(document.querySelector('.Md3f7G_column')).width` — should match the configured `chatGutterPct`.
5. Run `getComputedStyle(document.querySelector('.uV2eYG_card')).maxHeight` — should match `composerMaxHeightPct vh`.
6. If the values are wrong, the CSS isn't reaching. Check the bundle rev: `document.querySelector('script[src*="furayoshi/dsh-widechat/client.js"]').src` and compare to `dsh web --dump-config | grep furayoshi`.

## 9. Where to look in the DSH source

When you need to find what DSH actually does, the canonical source lives in `~/.npm-global/lib/node_modules/@deepseek-ai/dsh/node_modules/`. Useful entry points:

- `dsh-client-ui-conversation/lib/client.js` — the chat column, the composer, the stats line, the user message. Almost every CSS rule the plugin overrides is in here.
- `dsh-client-ui-layout/lib/client.js` — the page-level grid, the sidebar/center/details columns.
- `dsh-client-modules/lib/index.js` — the client plugin discovery and `/plugins/:id/client.js` route. Read this to understand why a plugin might not be loading.
- `dsh-client-runtime/lib/client.js` — the client-side Cordis runtime, the SettingsScope and `ctx.settingsScope.bind` implementation.
- `dsh-client-ui-settings-general/lib/client.js` — the General settings page where the row renders.
- `dsh-settings-file/lib/index.js` — the file-backed settings provider (`~/.dsh/settings.yaml`).

For the host side: `~/.npm-global/lib/node_modules/@deepseek-ai/dsh/lib/`. Useful:

- `bin.js` — the CLI, including the `dsh plugin` subcommand.
- `plugin-9h8shc4d.js` — the plugin subcommand implementation (pnpm forwarder + reconciliation).
- `profile-boot-*.js` — the profile boot sequence.

The `dsh web --dump-config` and `dsh web --dump-default-config` commands print the composed profile tree, which is the best way to see whether a bundle is registered and what its `apply()` looks like.

## 10. When in doubt

- If a CSS rule isn't reaching the page, the class name probably changed. The shipped CSS lives in `node_modules/@deepseek-ai/dsh-client-ui-conversation/lib/client.js`. Search for the rule you're trying to override and look at the class hash.
- If the host's `apply()` isn't running, the host-side registration in `cordis.patch.yml` is probably wrong, or the host's `settings` service isn't available.
- If the client's `apply()` isn't running, the inject deps in the `cordis_define` call didn't resolve. Add `console.log` at the start of `apply()` and inside each branch.
- If the slider doesn't change the CSS, the SettingsScope is read-only or the namespace isn't registered. Add `console.log(scope.getSnapshot())` to the row's render and check the value.
- If a rebuild doesn't take effect, `rm -rf node_modules/@furayoshi && pnpm install` in the profile directory, then restart DSH.

## 11. Living document

This file is meant to be updated as the plugin evolves. When you add a new setting, a new gotcha, a new extension pattern, update the relevant section. When DSH changes in a way the plugin has to adapt to, document it. The README is the user-facing surface; this file is the maintainer-facing one — keep them in sync where they overlap.
