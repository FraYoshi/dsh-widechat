/**
 * Client bundle build: emits the closure-factory artifact the dsh web loader
 * consumes —
 *
 *   window.__ModuleLoader__.load({ id: '<package>', factory: (require) => { … } })
 *
 * Externals resolve through the loader's module table; everything else inlines.
 *
 * The table is FROZEN. A value import of any other `@deepseek-ai/*` module
 * reaches the browser as a `require(...)` the loader cannot answer, and the
 * failure is not local: the shell reports
 *
 *   "bundle … loaded without registering <id> via __ModuleLoader__.load"
 *
 * and drops EVERY plugin's client half — the user cannot open the Web UI at
 * all. Two shipped plugins have broken this exact way (`@a9i5k4/dsh-auto-memory`
 * 0.1.9–0.1.11 registering under a stale id, `dsh-llm-fallbacks` ≥ alpha.3
 * value-importing schemastery), so the assertions at the bottom are not
 * ceremony: they are the only thing standing between a typo'd import and an
 * unusable UI.
 */
import { build } from "tsdown";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ID = "@furayoshi/dsh-wide-chat";
const ENTRY = "src/client/index.ts";
const OUT_DIR = "lib/client";
const OUT_FILE = "index.js";

/**
 * What the browser loader can actually answer at runtime. This is a strict
 * subset of the loader's seed table; we only `require` what we genuinely
 * use. The browser loader also has `@deepseek-ai/cordis` available, but
 * reaching for it from a static plugin is the same fail-closed mode the
 * searxng plugin warns about, so we keep this list tight.
 */
const CLIENT_EXTERNALS: readonly string[] = [
  "react",
  "react/jsx-runtime",
  "@deepseek-ai/dsh-client-runtime/client",
];

await build({
  entry: [ENTRY],
  outDir: OUT_DIR,
  format: "cjs",
  platform: "browser",
  external: [...CLIENT_EXTERNALS],
  dts: false,
  clean: false,
  sourcemap: false,
  minify: false,
  outputOptions: { entryFileNames: OUT_FILE },
});

const outPath = resolve(OUT_DIR, OUT_FILE);
const body = readFileSync(outPath, "utf8");

const wrapped = `window.__ModuleLoader__.load({
\tid: ${JSON.stringify(ID)},
\tfactory: (require) => {
\t\tvar module = { exports: {} };
\t\tvar exports = module.exports;
${body}
\t\treturn module.exports;
\t}
});
`;
writeFileSync(outPath, wrapped);

const emitted = readFileSync(outPath, "utf8");

if (!emitted.startsWith("window.__ModuleLoader__.load({")) {
  throw new Error("client bundle: missing the loader registration preamble");
}

if (!emitted.includes(`id: ${JSON.stringify(ID)}`)) {
  throw new Error(`client bundle: must register under the package name ${ID}`);
}

const required = [...emitted.matchAll(/require\(["']([^"']+)["']\)/g)].map((match) => match[1]!);
const foreign = [...new Set(required)].filter((spec) => !CLIENT_EXTERNALS.includes(spec));
if (foreign.length > 0) {
  throw new Error(
    `client bundle: require() of module(s) outside the loader table: ${foreign.join(", ")}\n` +
      "Import them type-only, or inline them. A runtime require the loader cannot " +
      "answer takes the whole Web UI down, not just this card.",
  );
}

console.log(
  `client bundle: ${outPath} (${(emitted.length / 1024).toFixed(1)} kB), ` +
    `externals used: ${[...new Set(required)].sort().join(", ") || "(none)"}`,
);
