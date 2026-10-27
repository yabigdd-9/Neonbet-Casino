export function resolveMode(env: Record<string, string | boolean | undefined>) {
  const requested = env.VITE_APP_MODE;
  const configured = Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY);
  if (requested && !["demo", "supabase"].includes(String(requested)))
    return { mode: "error", error: "Invalid application mode." };
  if (requested === "demo") return { mode: "demo", error: "" };
  if (requested === "supabase" && !configured)
    return {
      mode: "error",
      error: "Account service configuration is incomplete. Contact the site operator.",
    };
  if (configured) {
    try {
      const url = new URL(String(env.VITE_SUPABASE_URL));
      if (!["https:", "http:"].includes(url.protocol)) throw new Error();
    } catch {
      return { mode: "error", error: "The account service URL is invalid. Contact the site operator." };
    }
  }
  return { mode: configured ? "supabase" : "demo", error: "" };
}
const resolved = resolveMode(import.meta.env);
export const APP_MODE = resolved.mode;
export const CONFIG_ERROR = resolved.error;
export const IS_SUPABASE = APP_MODE === "supabase";
export default APP_MODE;
