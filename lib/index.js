/**
 * Host half of `dsh-wide-chat`. The package is browser-only — all visible
 * behavior lives in `./client.js`. This file exists so that the package has
 * a valid `main` entry and Node tooling (TypeScript, bundlers, lint) does not
 * complain about a missing module when it resolves the bare specifier.
 *
 * Loaded by the DSH Cordis Loader on the host; `apply` is invoked but does
 * nothing because there is no host service to register.
 */
export default {
  apply() {
    // no-op
  },
};