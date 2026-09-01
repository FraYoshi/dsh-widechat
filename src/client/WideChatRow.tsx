/**
 * The `dsh-wide-chat` row in the General settings page. Renders three
 * controls:
 *   • a slider for `chatGutterPct`
 *   • a 3-segment toggle for `statsAlign` (left / center / right)
 *   • a checkbox for `preserveGutterWhenSidebarCollapsed`
 *
 * Reads the current values from the bound SettingsScope snapshot and writes
 * back through `scope.set` / `scope.unset`. No local store mirror; the
 * scope is the only source of truth.
 *
 * The scope object's runtime type is `SettingsScope<any>` from
 * `@deepseek-ai/dsh-client-runtime/client`; we keep this file free of
 * runtime imports of that package so the bundle's external list stays
 * tight (and a type-only import is erased at build time).
 */
import { useCallback } from "react";
import type { ReactNode } from "react";
import {
  CHAT_GUTTER_PCT_FIELD,
  CHAT_GUTTER_PCT_MAX,
  CHAT_GUTTER_PCT_MIN,
  DEFAULTS,
  PRESERVE_GUTTER_WHEN_SIDEBAR_COLLAPSED_FIELD,
  STATS_ALIGN_FIELD,
  STATS_ALIGN_VALUES,
} from "../settings.js";

/**
 * Minimal shape we use on the scope. Keeping it local means no runtime
 * dependency on `@deepseek-ai/dsh-client-runtime/client`.
 */
interface ScopeLike {
  getSnapshot: () => { value?: unknown };
  set: (field: string, value: unknown) => Promise<void>;
  unset: (field: string) => Promise<void>;
}

/** Injected face handed to the row by the slot registration. */
export interface WideChatRowInjected {
  scope: ScopeLike;
}

export type WideChatRowProps = WideChatRowInjected & {
  t: (key: string) => string;
};

/** Read a field from a snapshot value, falling back to the default. */
function readField<T>(section: unknown, field: string, fallback: T): T {
  if (!section || typeof section !== "object") return fallback;
  const value = (section as Record<string, unknown>)[field];
  return value === undefined ? fallback : (value as T);
}

function clampGutter(value: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULTS[CHAT_GUTTER_PCT_FIELD];
  }
  const rounded = Math.round(value);
  if (rounded < CHAT_GUTTER_PCT_MIN) return CHAT_GUTTER_PCT_MIN;
  if (rounded > CHAT_GUTTER_PCT_MAX) return CHAT_GUTTER_PCT_MAX;
  return rounded;
}

export function WideChatRow({ scope, t }: WideChatRowProps): ReactNode {
  const snapshot = scope.getSnapshot();
  const section = snapshot.value;

  const gutterRaw = readField<number>(section, CHAT_GUTTER_PCT_FIELD, DEFAULTS[CHAT_GUTTER_PCT_FIELD]);
  const gutterPct = clampGutter(gutterRaw);
  const statsAlignRaw = readField<string>(section, STATS_ALIGN_FIELD, DEFAULTS[STATS_ALIGN_FIELD]);
  const statsAlign = (STATS_ALIGN_VALUES as readonly string[]).includes(statsAlignRaw)
    ? (statsAlignRaw as "left" | "center" | "right")
    : DEFAULTS[STATS_ALIGN_FIELD];
  const preserveGutter = readField<boolean>(
    section,
    PRESERVE_GUTTER_WHEN_SIDEBAR_COLLAPSED_FIELD,
    DEFAULTS[PRESERVE_GUTTER_WHEN_SIDEBAR_COLLAPSED_FIELD],
  );

  const setGutter = useCallback(
    (next: number) => {
      void scope.set(CHAT_GUTTER_PCT_FIELD, next);
    },
    [scope],
  );
  const setAlign = useCallback(
    (next: string) => {
      void scope.set(STATS_ALIGN_FIELD, next);
    },
    [scope],
  );
  const setPreserve = useCallback(
    (next: boolean) => {
      if (next) {
        void scope.set(PRESERVE_GUTTER_WHEN_SIDEBAR_COLLAPSED_FIELD, true);
      } else {
        void scope.unset(PRESERVE_GUTTER_WHEN_SIDEBAR_COLLAPSED_FIELD);
      }
    },
    [scope],
  );

  return (
    <div className="dswc-row" data-plugin="dsh-wide-chat">
      <div className="dswc-row__head">
        <div className="dswc-row__title">{t("row.title")}</div>
        <div className="dswc-row__desc">{t("row.description")}</div>
      </div>

      <div className="dswc-row__field">
        <label htmlFor="dswc-gutter">{t("gutter.label")}</label>
        <div className="dswc-row__slider">
          <input
            id="dswc-gutter"
            type="range"
            min={CHAT_GUTTER_PCT_MIN}
            max={CHAT_GUTTER_PCT_MAX}
            step={1}
            value={gutterPct}
            onChange={(event) => setGutter(Number(event.target.value))}
          />
          <span className="dswc-row__value">{gutterPct}%</span>
        </div>
        <div className="dswc-help">{t("gutter.help")}</div>
      </div>

      <div className="dswc-row__field">
        <label>{t("align.label")}</label>
        <div className="dswc-row__seg" role="group">
          {STATS_ALIGN_VALUES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={statsAlign === value}
              onClick={() => setAlign(value)}
            >
              {t(`align.${value}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="dswc-row__field">
        <div className="dswc-row__toggle">
          <input
            id="dswc-preserve"
            type="checkbox"
            checked={preserveGutter}
            onChange={(event) => setPreserve(event.target.checked)}
          />
          <label htmlFor="dswc-preserve">{t("preserveGutter.label")}</label>
        </div>
        <div className="dswc-help">{t("preserveGutter.help")}</div>
      </div>
    </div>
  );
}
