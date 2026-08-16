// Runtime mode resolution.
// demo    -> no Supabase; local simulated balance + localStorage persistence
// supabase -> real auth + database (fails clearly if required env vars are missing)

const configuredMode = import.meta.env.VITE_APP_MODE;
const hasSupabaseConfig = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

let resolvedMode = "demo";
if (configuredMode === "supabase") {
  resolvedMode = hasSupabaseConfig ? "supabase" : "demo";
} else if (configuredMode === "demo") {
  resolvedMode = "demo";
} else {
  resolvedMode = hasSupabaseConfig ? "supabase" : "demo";
}

export const APP_MODE = resolvedMode;
export const IS_SUPABASE = resolvedMode === "supabase";

export default APP_MODE;
