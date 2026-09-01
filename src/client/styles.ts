/**
 * Self-drawn styles for the `dsh-wide-chat` settings row. The shipped
 * `settings.general.item` outlet does not project a `className`; the row
 * owns its internals. Class names are scoped with the `dswc-` prefix to
 * avoid collisions with any other plugin that ships its own row CSS.
 */
export const STYLES = `
.dswc-row { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.dswc-row__head { display: flex; flex-direction: column; gap: 2px; }
.dswc-row__title { font-size: 14px; font-weight: 600; line-height: 20px; color: var(--dsh-text-primary, #1a1a1a); }
.dswc-row__desc { font-size: 12px; line-height: 16px; color: var(--dsh-text-secondary, #5a5d62); }
.dswc-row__field { display: flex; flex-direction: column; gap: 4px; }
.dswc-row__field > label { font-size: 12px; line-height: 16px; color: var(--dsh-text-secondary, #5a5d62); }
.dswc-row__field > .dswc-help { font-size: 11px; line-height: 14px; color: var(--dsh-text-tertiary, #878a8f); }
.dswc-row__slider { display: flex; align-items: center; gap: 8px; }
.dswc-row__slider > input[type="range"] { flex: 1; }
.dswc-row__slider > .dswc-row__value { font-variant-numeric: tabular-nums; min-width: 36px; text-align: right; }
.dswc-row__seg { display: inline-flex; border: 1px solid var(--dsh-border, #e3e5e8); border-radius: 6px; overflow: hidden; }
.dswc-row__seg button { appearance: none; background: transparent; border: 0; padding: 4px 12px; font-size: 12px; cursor: pointer; color: var(--dsh-text-secondary, #5a5d62); border-right: 1px solid var(--dsh-border, #e3e5e8); }
.dswc-row__seg button:last-child { border-right: 0; }
.dswc-row__seg button[aria-pressed="true"] { background: var(--dsh-bg-active, #eef2f7); color: var(--dsh-text-primary, #1a1a1a); font-weight: 600; }
.dswc-row__toggle { display: flex; align-items: center; gap: 8px; }
.dswc-row__toggle > input[type="checkbox"] { width: 16px; height: 16px; }
`;
