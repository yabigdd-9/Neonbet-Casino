// Runtime mode resolution — the SINGLE authority for demo vs supabase behaviour.
// demo     -> no Supabase; local simulated balance + localStorage persistence
// supabase -> real auth + database (fails clearly if required env vars are missing)
//
// Rules (see execution plan P1 acceptance tests):
//   no env + no mode            -> demo
//   VITE_APP_MODE=demo          -> demo (regardless of env)
//   VITE_APP_MODE=demo + env    -> demo
//   VITE_APP_MODE=supabase + env -> supabase
//   VITE_APP_MODE=supabase + NO env -> THROW (do not silently downgrade)
//
// `hasSupabaseConfig` answers only "are credentials physically present?" and must
// NEVER be used to decide the operator-selected mode.

import type { AppMode } from "../types";

const hasSupabaseConfig = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const configuredMode = import.meta.env.VITE_APP_MODE;

/**
 * Pure, testable mode resolver. Extracted from the module bootstrap so the P1
 * acceptance scenarios can be unit-tested without spinning up the real bundler env.
 */
export function resolveAppMode(
  configuredMode: string | undefined,
  hasSupabaseConfig: boolean,
): AppMode {
  if (configuredMode === "supabase") {
    if (!hasSupabaseConfig) {
      // Explicit production/Supabase mode must not silently fall back to demo.
      throw new Error(
        "VITE_APP_MODE is set to 'supabase' but VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY " +
          "are missing. Set both Supabase env vars, or set VITE_APP_MODE=demo for the " +
          "local demo. Refusing to silently start in demo mode.",
      );
    }
    return "supabase";
  }
  if (configuredMode === "demo") {
    return "demo";
  }
  // No explicit mode: infer from credentials (credentials => supabase, else demo).
  return hasSupabaseConfig ? "supabase" : "demo";
}

let resolvedMode: AppMode;
try {
  resolvedMode = resolveAppMode(configuredMode, hasSupabaseConfig);
} catch (error) {
  // Surface the misconfiguration loudly instead of booting into the wrong mode.
  console.error((error as Error).message);
  throw error;
}

export const APP_MODE: AppMode = resolvedMode;
export const IS_SUPABASE: boolean = resolvedMode === "supabase";
export const IS_DEMO: boolean = resolvedMode === "demo";

export { hasSupabaseConfig };
export default APP_MODE;
