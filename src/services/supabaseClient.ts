import type { SupabaseClient } from "@supabase/supabase-js";
import { IS_SUPABASE } from "../config/appMode";
import { inspectAuthRedirect } from "../lib/authRedirect";
export const hasSupabaseConfig = IS_SUPABASE;
// Capture the redirect before the SDK consumes its fragment during initialization.
export const initialAuthRedirect =
  IS_SUPABASE && typeof window !== "undefined"
    ? inspectAuthRedirect(window.location.href)
    : { error: "", recovery: false, cleanUrl: "" };
if (initialAuthRedirect.error)
  window.history.replaceState(window.history.state, "", initialAuthRedirect.cleanUrl);
export const supabase: SupabaseClient | null = IS_SUPABASE
  ? (await import("@supabase/supabase-js")).createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      {
        auth: {
          storageKey: "neonbet-auth",
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      },
    )
  : null;
export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error("Account service is unavailable in demo mode.");
  return supabase;
}
export default supabase;
