window.__ModuleLoader__.load({
	id: "@furayoshi/dsh-wide-chat",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
let react = require("react");
let react_jsx_runtime = require("react/jsx-runtime");

//#region src/settings.ts
/**
* Settings-namespace constants, defaults, and pure utilities shared by both
* the host and client halves. This file deliberately imports nothing from
* `@deepseek-ai/dsh-settings` or `@deepseek-ai/schemastery` — those are
* host-side concerns, and the client half bundles to a closure where
* runtime `require()` of any package not in the loader's table fails the
* whole Web UI.
*
* @module dsh-wide-chat/settings
*/
/** Settings namespace owned by this plugin. */
const WIDE_CHAT_SETTINGS_NAMESPACE = "dsh-wide-chat";
/** Field key for the chat column horizontal gutter, in percent of the cell. */
const CHAT_GUTTER_PCT_FIELD = "chatGutterPct";
/** Field key for the session-stats alignment. */
const STATS_ALIGN_FIELD = "statsAlign";
/** Field key for the user-bubble width, in percent of the chat column. */
const USER_BUBBLE_PCT_FIELD = "userBubblePct";
/** Allowed values for `statsAlign`. */
const STATS_ALIGN_VALUES = [
	"left",
	"center",
	"right"
];
/** Defaults applied when a field is unset. */
const DEFAULTS = {
	[CHAT_GUTTER_PCT_FIELD]: 1,
	[STATS_ALIGN_FIELD]: "right",
	[USER_BUBBLE_PCT_FIELD]: 75
};

//#endregion
//#region src/client/WideChatRow.tsx
/**
* The `dsh-wide-chat` row in the General settings page. Renders three
* controls:
*   • a slider + number input for `chatGutterPct`
*   • a 3-segment toggle for `statsAlign` (left / center / right)
*   • a slider + number input for `userBubblePct`
*
* The row subscribes to its SettingsScope so the controls reflect the
* current value on every change — without the subscription, React would
* only re-render the row when its own state changes, and the slider
* thumb would stay where it was after the user dragged it.
*
* The scope object's runtime type is `SettingsScope<any>` from
* `@deepseek-ai/dsh-client-runtime/client`; we keep this file free of
* runtime imports of that package so the bundle's external list stays
* tight (and a type-only import is erased at build time).
*/
/** Read a field from a snapshot value, falling back to the default. */
function readField(section, field, fallback) {
	if (!section || typeof section !== "object") return fallback;
	const value = section[field];
	return value === void 0 ? fallback : value;
}
function clampNumber(value, min, max, fallback) {
	if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
	const rounded = Math.round(value);
	if (rounded < min) return min;
	if (rounded > max) return max;
	return rounded;
}
function readValues(scope) {
	const section = scope.getSnapshot().value;
	const gutterPct = clampNumber(readField(section, CHAT_GUTTER_PCT_FIELD, DEFAULTS[CHAT_GUTTER_PCT_FIELD]), 0, 10, DEFAULTS[CHAT_GUTTER_PCT_FIELD]);
	const statsAlignRaw = readField(section, STATS_ALIGN_FIELD, DEFAULTS[STATS_ALIGN_FIELD]);
	return {
		gutterPct,
		statsAlign: STATS_ALIGN_VALUES.includes(statsAlignRaw) ? statsAlignRaw : DEFAULTS[STATS_ALIGN_FIELD],
		userBubblePct: clampNumber(readField(section, USER_BUBBLE_PCT_FIELD, DEFAULTS[USER_BUBBLE_PCT_FIELD]), 30, 100, DEFAULTS[USER_BUBBLE_PCT_FIELD])
	};
}
function WideChatRow({ scope, t }) {
	const [tick, setTick] = (0, react.useState)(0);
	(0, react.useEffect)(() => {
		const unsubscribe = scope.subscribe(() => {
			setTick((n) => n + 1);
		});
		return () => {
			unsubscribe();
		};
	}, [scope]);
	const { gutterPct, statsAlign, userBubblePct } = readValues(scope);
	const setGutter = (0, react.useCallback)((next) => {
		const clamped = clampNumber(next, 0, 10, DEFAULTS[CHAT_GUTTER_PCT_FIELD]);
		scope.set(CHAT_GUTTER_PCT_FIELD, clamped);
	}, [scope]);
	const setAlign = (0, react.useCallback)((next) => {
		if (STATS_ALIGN_VALUES.includes(next)) scope.set(STATS_ALIGN_FIELD, next);
	}, [scope]);
	const setUserBubble = (0, react.useCallback)((next) => {
		const clamped = clampNumber(next, 30, 100, DEFAULTS[USER_BUBBLE_PCT_FIELD]);
		scope.set(USER_BUBBLE_PCT_FIELD, clamped);
	}, [scope]);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "dswc-row",
		"data-plugin": "dsh-wide-chat",
		"data-tick": tick,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dswc-row__head",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dswc-row__title",
					children: t("row.title")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dswc-row__desc",
					children: t("row.description")
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dswc-row__field",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
						htmlFor: "dswc-gutter",
						children: t("gutter.label")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dswc-row__slider",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								id: "dswc-gutter",
								type: "range",
								min: 0,
								max: 10,
								step: 1,
								value: gutterPct,
								onChange: (event) => setGutter(Number(event.target.value))
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: "dswc-row__number",
								type: "number",
								min: 0,
								max: 10,
								step: 1,
								value: gutterPct,
								"aria-label": t("gutter.label"),
								onChange: (event) => {
									const value = Number(event.target.value);
									if (Number.isFinite(value)) setGutter(value);
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dswc-row__unit",
								children: "%"
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dswc-help",
						children: t("gutter.help")
					})
				]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dswc-row__field",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", { children: t("align.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dswc-row__seg",
					role: "group",
					children: STATS_ALIGN_VALUES.map((value) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": statsAlign === value,
						onClick: () => setAlign(value),
						children: t(`align.${value}`)
					}, value))
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dswc-row__field",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
						htmlFor: "dswc-user-bubble",
						children: t("userBubble.label")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dswc-row__slider",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								id: "dswc-user-bubble",
								type: "range",
								min: 30,
								max: 100,
								step: 1,
								value: userBubblePct,
								onChange: (event) => setUserBubble(Number(event.target.value))
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: "dswc-row__number",
								type: "number",
								min: 30,
								max: 100,
								step: 1,
								value: userBubblePct,
								"aria-label": t("userBubble.label"),
								onChange: (event) => {
									const value = Number(event.target.value);
									if (Number.isFinite(value)) setUserBubble(value);
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dswc-row__unit",
								children: "%"
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dswc-help",
						children: t("userBubble.help")
					})
				]
			})
		]
	});
}

//#endregion
//#region src/client/locales.ts
/**
* Settings row dictionaries for the `dsh-wide-chat` General page entry.
* The shell ships zh and en; a key missing from one falls back to the
* other, so both are kept complete.
*
* @module dsh-wide-chat/client/locales
*/
const WIDE_CHAT_LOCALE_NS = "settings.wide-chat";
/** Simplified Chinese dictionary (the key-set source of truth). */
const zh = {
	"row.title": "宽屏对话",
	"row.description": "调整聊天列宽度、用户消息气泡宽度与底部统计对齐方式。",
	"gutter.label": "左右留白",
	"gutter.help": "聊天列两侧留白占视口宽度的百分比。0 为贴边，2 为适中的默认留白。",
	"align.label": "统计对齐",
	"align.left": "左",
	"align.center": "居中",
	"align.right": "右",
	"userBubble.label": "用户消息宽度",
	"userBubble.help": "用户消息气泡占聊天列宽度的百分比。75 为默认。"
};
const en = {
	"row.title": "Wide chat",
	"row.description": "Adjust the chat column width, your message bubble width, and the bottom-stats alignment.",
	"gutter.label": "Side gutter",
	"gutter.help": "Chat column gutter as a percent of viewport width. 0 = edge-to-edge, 2 = a comfortable default.",
	"align.label": "Stats alignment",
	"align.left": "Left",
	"align.center": "Center",
	"align.right": "Right",
	"userBubble.label": "Your message width",
	"userBubble.help": "Your message bubble width as a percent of the chat column. 75 is the default."
};
const dictionaries = {
	zh,
	en
};

//#endregion
//#region src/client/css.ts
/**
* Build the CSS override string for the `dsh-wide-chat` plugin from a
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
/** Validate and clamp a single field. Returns `fallback` on any deviation. */
function clampInt(value, min, max, fallback) {
	if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
	const rounded = Math.round(value);
	if (rounded < min || rounded > max) return fallback;
	return rounded;
}
function asAlign(value, fallback) {
	if (value === "left" || value === "center" || value === "right") return value;
	return fallback;
}
function resolveConfig(raw, defaults) {
	const fallbacks = [];
	let section = {};
	if (raw && typeof raw === "object" && !Array.isArray(raw)) section = raw;
	else if (raw !== void 0 && raw !== null) fallbacks.push("section-not-object");
	const chatGutterPctInput = section["chatGutterPct"] ?? defaults.chatGutterPct;
	const statsAlignInput = section["statsAlign"] ?? defaults.statsAlign;
	const userBubblePctInput = section["userBubblePct"] ?? defaults.userBubblePct;
	const chatGutterPctRaw = clampInt(chatGutterPctInput, 0, 10, defaults.chatGutterPct);
	if (chatGutterPctRaw !== chatGutterPctInput) fallbacks.push(`${CHAT_GUTTER_PCT_FIELD}=${JSON.stringify(chatGutterPctInput)}`);
	const statsAlignRaw = asAlign(statsAlignInput, defaults.statsAlign);
	if (statsAlignRaw !== statsAlignInput) fallbacks.push(`${STATS_ALIGN_FIELD}=${JSON.stringify(statsAlignInput)}`);
	const userBubblePctRaw = clampInt(userBubblePctInput, 30, 100, defaults.userBubblePct);
	if (userBubblePctRaw !== userBubblePctInput) fallbacks.push(`${USER_BUBBLE_PCT_FIELD}=${JSON.stringify(userBubblePctInput)}`);
	return {
		chatGutterPct: chatGutterPctRaw,
		statsAlign: statsAlignRaw,
		userBubblePct: userBubblePctRaw,
		fellBack: fallbacks.length > 0,
		fallbacks
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
function buildStylesheet(config) {
	const cap = `calc(100% - ${config.chatGutterPct * 2}%)`;
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
  max-width: ${`${config.userBubblePct}%`} !important;
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
function injectStylesheet(css, pluginId) {
	const tag = document.createElement("style");
	tag.dataset.plugin = pluginId;
	tag.dataset.pluginCss = `${pluginId}/styles.css`;
	tag.textContent = css;
	document.head.appendChild(tag);
	return () => {
		tag.remove();
	};
}

//#endregion
//#region src/client/styles.ts
/**
* Self-drawn styles for the `dsh-wide-chat` settings row. The shipped
* `settings.general.item` outlet does not project a `className`; the row
* owns its internals. Class names are scoped with the `dswc-` prefix to
* avoid collisions with any other plugin that ships its own row CSS.
*
* Color tokens come from the DSH theme (`--dsw-alias-*`), so the row
* automatically tracks light and dark mode without per-theme overrides.
*/
const STYLES = `
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

//#endregion
//#region src/client/index.ts
/**
* Browser half: registers the `dsh-wide-chat` row into the General settings
* page (`settings.general.item`) and keeps the CSS override sheet in sync
* with the user's settings on the bound scope.
*
* The row reads through a SettingsScope bound to the same namespace the host
* half registered under (`WIDE_CHAT_SETTINGS_NAMESPACE`); writes go through
* `scope.set` / `scope.unset`. The CSS apply subscribes to the same scope
* via `scope.subscribe(...)` and re-injects the stylesheet on every change.
*
* On every config read the values go through `resolveConfig`, which clamps
* to bounds and substitutes defaults on any out-of-range or wrong-typed
* field. A soft `console.warn` is logged when any fallback fires so the
* user can see what their input was rejected for without the page refusing
* to render.
*/
/** Plugin id we tag our `<style>` tags with. */
const PLUGIN_ID = "dsh-wide-chat";
/**
* Required client services. `settingsScope` provides the per-namespace scope
* we bind to; `slots` / `locale` declare the row and the dictionaries.
* `connection` is required by SettingsScope to write through the wire.
*/
const inject = [
	"slots",
	"locale",
	"connection",
	"settingsScope"
];
/** Owning row slot id (drives the order in the General section). */
const ROW_ID = "wide-chat";
/** Position in the General section. Lower numbers render first. */
const ROW_ORDER = 50;
/**
* Install the row's own self-drawn CSS once. The row's class names match
* nothing until this lands; without it the row still renders, just with
* browser defaults, which reads as a broken UI.
*/
function installRowStyles() {
	if (typeof document === "undefined") return () => {};
	const tag = document.createElement("style");
	tag.dataset.plugin = PLUGIN_ID;
	tag.dataset.pluginCss = `${PLUGIN_ID}/row.css`;
	tag.textContent = STYLES;
	document.head.appendChild(tag);
	return () => {
		tag.remove();
	};
}
/**
* Compute the stylesheet for the current scope value (or the defaults if the
* scope has no value yet) and inject it. Returns the disposer the caller
* hands to `ctx.effect` so the tag is removed on plugin unload.
*/
function applyForScope(scopeValue) {
	const resolved = resolveConfig(scopeValue, {
		chatGutterPct: DEFAULTS[CHAT_GUTTER_PCT_FIELD],
		statsAlign: DEFAULTS[STATS_ALIGN_FIELD],
		userBubblePct: DEFAULTS[USER_BUBBLE_PCT_FIELD]
	});
	if (resolved.fellBack) console.warn(`[${PLUGIN_ID}] config fell back to defaults for: ${resolved.fallbacks.join(", ")}`);
	return injectStylesheet(buildStylesheet(resolved), PLUGIN_ID);
}
/** Read the current section value out of a scope snapshot. */
function readSection(snapshot) {
	if (snapshot === null || snapshot === void 0) return void 0;
	return snapshot.value;
}
/**
* Client plugin body: register dictionaries, install the row's own styles,
* bind the settings scope, and keep the override sheet synced on changes.
*
* The CSS sheet is re-injected (old tag removed, new tag appended) on every
* scope change. That keeps the override simple — a single `<style>` tag
* whose text is the current resolved stylesheet — at the cost of one
* document mutation per change. The user changes these settings rarely
* (slider drag, align toggle, gutter toggle) so the cost is negligible.
*
* @param ctx - client cordis context.
*/
function apply(ctx) {
	ctx.effect(() => installRowStyles(), "dsh-wide-chat: row styles");
	ctx.effect(() => ctx.locale.register(WIDE_CHAT_LOCALE_NS, dictionaries), "dsh-wide-chat: dictionaries");
	let scope = null;
	try {
		scope = ctx.settingsScope.bind({ namespace: WIDE_CHAT_SETTINGS_NAMESPACE });
	} catch (error) {
		console.warn(`[${PLUGIN_ID}] settingsScope.bind failed:`, error);
	}
	if (scope !== null) ctx.effect(() => {
		let disposeSheet = () => {};
		try {
			const reapply = () => {
				disposeSheet();
				try {
					disposeSheet = applyForScope(readSection(scope.getSnapshot()));
				} catch (error) {
					console.warn(`[${PLUGIN_ID}] reapply failed:`, error);
					disposeSheet = () => {};
				}
			};
			reapply();
			const unsubscribe = scope.subscribe(reapply);
			return () => {
				unsubscribe();
				disposeSheet();
			};
		} catch (error) {
			console.warn(`[${PLUGIN_ID}] initial stylesheet inject failed:`, error);
			return () => {};
		}
	}, "dsh-wide-chat: settings-driven stylesheet");
	else ctx.effect(() => {
		const disposeSheet = applyForScope(void 0);
		return () => disposeSheet();
	}, "dsh-wide-chat: settings-driven stylesheet (no scope)");
	const injected = () => ({ scope });
	ctx.slots.inject("settings.general.item", function* () {
		yield ctx.slots.register({
			name: "settings.general.item",
			id: ROW_ID,
			order: ROW_ORDER,
			locale: WIDE_CHAT_LOCALE_NS,
			inject: injected
		}, WideChatRow);
	});
}

//#endregion
exports.apply = apply;
exports.inject = inject;
		return module.exports;
	}
});
