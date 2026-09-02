/**
 * The `dsh-widechat` row in the General settings page. Renders three
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
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  CHAT_GUTTER_PCT_FIELD,
  CHAT_GUTTER_PCT_MAX,
  CHAT_GUTTER_PCT_MIN,
  DEFAULTS,
  STATS_ALIGN_FIELD,
  STATS_ALIGN_VALUES,
  USER_BUBBLE_PCT_FIELD,
  USER_BUBBLE_PCT_MAX,
  USER_BUBBLE_PCT_MIN,
} from "../settings.js";

/**
 * Minimal shape we use on the scope. Keeping it local means no runtime
 * dependency on `@deepseek-ai/dsh-client-runtime/client`.
 */
interface ScopeLike {
  getSnapshot: () => { value?: unknown };
  set: (field: string, value: unknown) => Promise<void>;
  unset: (field: string) => Promise<void>;
  subscribe: (listener: () => void) => () => void;
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

function clampNumber(
  value: number,
  min: number,
  max: number,
  fallback: number,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  const rounded = Math.round(value);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
}

interface ResolvedValues {
  gutterPct: number;
  statsAlign: "left" | "center" | "right";
  userBubblePct: number;
}

function readValues(scope: ScopeLike): ResolvedValues {
  const section = scope.getSnapshot().value;
  const gutterRaw = readField<number>(section, CHAT_GUTTER_PCT_FIELD, DEFAULTS[CHAT_GUTTER_PCT_FIELD]);
  const gutterPct = clampNumber(gutterRaw, CHAT_GUTTER_PCT_MIN, CHAT_GUTTER_PCT_MAX, DEFAULTS[CHAT_GUTTER_PCT_FIELD]);
  const statsAlignRaw = readField<string>(section, STATS_ALIGN_FIELD, DEFAULTS[STATS_ALIGN_FIELD]);
  const statsAlign = (STATS_ALIGN_VALUES as readonly string[]).includes(statsAlignRaw)
    ? (statsAlignRaw as "left" | "center" | "right")
    : DEFAULTS[STATS_ALIGN_FIELD];
  const userBubbleRaw = readField<number>(section, USER_BUBBLE_PCT_FIELD, DEFAULTS[USER_BUBBLE_PCT_FIELD]);
  const userBubblePct = clampNumber(
    userBubbleRaw,
    USER_BUBBLE_PCT_MIN,
    USER_BUBBLE_PCT_MAX,
    DEFAULTS[USER_BUBBLE_PCT_FIELD],
  );
  return { gutterPct, statsAlign, userBubblePct };
}

export function WideChatRow({ scope, t }: WideChatRowProps): ReactNode {
  // The SettingsScope doesn't re-render React rows on its own. Subscribe
  // and bump a tick so the row re-renders with the current snapshot
  // every time the scope changes (including the user's own writes).
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const unsubscribe = scope.subscribe(() => {
      setTick((n) => n + 1);
    });
    return () => {
      unsubscribe();
    };
  }, [scope]);

  const { gutterPct, statsAlign, userBubblePct } = readValues(scope);

  const setGutter = useCallback(
    (next: number) => {
      const clamped = clampNumber(next, CHAT_GUTTER_PCT_MIN, CHAT_GUTTER_PCT_MAX, DEFAULTS[CHAT_GUTTER_PCT_FIELD]);
      void scope.set(CHAT_GUTTER_PCT_FIELD, clamped);
    },
    [scope],
  );
  const setAlign = useCallback(
    (next: string) => {
      if ((STATS_ALIGN_VALUES as readonly string[]).includes(next)) {
        void scope.set(STATS_ALIGN_FIELD, next);
      }
    },
    [scope],
  );
  const setUserBubble = useCallback(
    (next: number) => {
      const clamped = clampNumber(next, USER_BUBBLE_PCT_MIN, USER_BUBBLE_PCT_MAX, DEFAULTS[USER_BUBBLE_PCT_FIELD]);
      void scope.set(USER_BUBBLE_PCT_FIELD, clamped);
    },
    [scope],
  );

  return (
    <div className="dswc-row" data-plugin="dsh-widechat" data-tick={tick}>
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
          <input
            className="dswc-row__number"
            type="number"
            min={CHAT_GUTTER_PCT_MIN}
            max={CHAT_GUTTER_PCT_MAX}
            step={1}
            value={gutterPct}
            aria-label={t("gutter.label")}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isFinite(value)) setGutter(value);
            }}
          />
          <span className="dswc-row__unit">%</span>
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
        <label htmlFor="dswc-user-bubble">{t("userBubble.label")}</label>
        <div className="dswc-row__slider">
          <input
            id="dswc-user-bubble"
            type="range"
            min={USER_BUBBLE_PCT_MIN}
            max={USER_BUBBLE_PCT_MAX}
            step={1}
            value={userBubblePct}
            onChange={(event) => setUserBubble(Number(event.target.value))}
          />
          <input
            className="dswc-row__number"
            type="number"
            min={USER_BUBBLE_PCT_MIN}
            max={USER_BUBBLE_PCT_MAX}
            step={1}
            value={userBubblePct}
            aria-label={t("userBubble.label")}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isFinite(value)) setUserBubble(value);
            }}
          />
          <span className="dswc-row__unit">%</span>
        </div>
        <div className="dswc-help">{t("userBubble.help")}</div>
      </div>
    </div>
  );
}
