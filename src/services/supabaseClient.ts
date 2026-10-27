import type { SupabaseClient } from "@supabase/supabase-js";
import { IS_SUPABASE } from "../config/appMode";
export const hasSupabaseConfig = IS_SUPABASE;
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
