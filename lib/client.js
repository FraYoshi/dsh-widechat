/**
 * Client half of `dsh-wide-chat`. Loaded by the browser module system during
 * `__DSH_BOOT__` materialization, before any Cordis plugin entry runs.
 *
 * The DSH Cordis client runtime injects `ctx`, `React`, and `host` into the
 * closure that evaluates this module; the `apply` below is invoked by the
 * vendored Cordis Loader as an ordinary client-plugin entry, with the entry's
 * config and the client root Cordis context. `styles.insert` is NOT a Cordis
 * Service in the static-load path — it is only available to dynamic Cordis
 * Plugins via `cordis_run`, so this module injects the stylesheet directly
 * during module evaluation (the same point at which `@deepseek-ai/dsh-client-ui-*`
 * packages inject their CSS module bundles), and registers a teardown with
 * `ctx.effect` so the tag is removed when the plugin unloads.
 *
 * Behavior:
 *   • Widens the conversation column to ~98% of the available center-column
 *     width, eliminating the ~20% of wasted whitespace that the shipped
 *     748px chat-content-width cap introduces.
 *   • Works regardless of the sidebar's open/collapsed state because the cap
 *     is expressed as a percentage of the center cell (the layout's grid
 *     already gives the cell the remaining width after the sidebar).
 *   • Reversible: the disposer is registered with `ctx.effect`, so stopping
 *     or updating the plugin removes the injected `<style>` tag and the
 *     original layout returns.
 */
const STYLESHEET = `
:root,
.wSkVaW_root,
[data-phase] {
  --dsh-chat-content-width: 98% !important;
  --dsh-composer-card-max-width: 98% !important;
}

/* Chat message column: keep centering, drop the inner cap to follow the cell. */
.Md3f7G_column {
  max-width: var(--dsh-chat-content-width) !important;
  width: 100% !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

/* Composer row stretches; the card fills the full row width. */
.uV2eYG_root {
  align-items: stretch !important;
  width: 100% !important;
  max-width: 100% !important;
}
.uV2eYG_card,
.uV2eYG_notice,
.wSkVaW_composerHero {
  max-width: var(--dsh-composer-card-max-width) !important;
  width: 100% !important;
}
`;

/** Create and own one `<style>` tag. Returns a disposer that removes the tag. */
function injectStylesheet(css, pluginId) {
  const tag = document.createElement("style");
  tag.dataset.plugin = pluginId;
  tag.dataset.pluginCss = `${pluginId}/styles.css`;
  tag.textContent = css;
  document.head.append(tag);
  return () => {
    tag.remove();
  };
}

const PLUGIN_ID = "dsh-wide-chat";

export default {
  apply(ctx) {
    const dispose = injectStylesheet(STYLESHEET, PLUGIN_ID);
    ctx.effect(() => dispose);
  },
};