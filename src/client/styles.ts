/**
 * Self-drawn styles for the `dsh-widechat` settings row. The shipped
 * `settings.general.item` outlet does not project a `className`; the row
 * owns its internals. Class names are scoped with the `dswc-` prefix to
 * avoid collisions with any other plugin that ships its own row CSS.
 *
 * Color tokens come from the DSH theme (`--dsw-alias-*`), so the row
 * automatically tracks light and dark mode without per-theme overrides.
 */
export const STYLES = `
.dswc-row { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.dswc-row__head { display: flex; flex-direction: column; gap: 2px; }
.dswc-row__title { font-size: 14px; font-weight: 600; line-height: 20px; color: var(--dsw-alias-label-primary); }
.dswc-row__desc { font-size: 12px; line-height: 16px; color: var(--dsw-alias-label-secondary); }
.dswc-row__field { display: flex; flex-direction: column; gap: 4px; }
.dswc-row__field > label { font-size: 12px; line-height: 16px; color: var(--dsw-alias-label-secondary); }
.dswc-row__field > .dswc-help { font-size: 11px; line-height: 14px; color: var(--dsw-alias-label-tertiary); }
.dswc-row__slider { display: flex; align-items: center; gap: 8px; }
.dswc-row__slider > input[type="range"] { flex: 1; min-width: 0; }
.dswc-row__slider > .dswc-row__number {
  width: 56px;
  flex: none;
  font-variant-numeric: tabular-nums;
  text-align: right;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-input-bg, transparent);
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  line-height: 18px;
  appearance: textfield;
  -moz-appearance: textfield;
}
.dswc-row__slider > .dswc-row__number::-webkit-outer-spin-button,
.dswc-row__slider > .dswc-row__number::-webkit-inner-spin-button {
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
}
.dswc-row__slider > .dswc-row__unit { color: var(--dsw-alias-label-secondary); font-size: 12px; }
.dswc-row__seg { display: inline-flex; border: 1px solid var(--dsw-alias-border-l2); border-radius: 6px; overflow: hidden; }
.dswc-row__seg button { appearance: none; background: transparent; border: 0; padding: 4px 12px; font-size: 12px; cursor: pointer; color: var(--dsw-alias-label-secondary); border-right: 1px solid var(--dsw-alias-border-l2); }
.dswc-row__seg button:last-child { border-right: 0; }
.dswc-row__seg button[aria-pressed="true"] { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); font-weight: 600; }
.dswc-row__toggle { display: flex; align-items: center; gap: 8px; }
.dswc-row__toggle > input[type="checkbox"] { width: 16px; height: 16px; }
`;
