// Profile + account data service.
import { supabase, hasSupabaseConfig } from "./supabaseClient";
import { PROFILE_COLUMNS } from "./auth.service";
import { readStoredValue, writeStoredValue } from "../lib/storage";

const DEMO_PROFILE_KEY = "neonbetProfile";

export async function getProfile(userId) {
  if (!hasSupabaseConfig) {
    return readStoredValue(DEMO_PROFILE_KEY, null);
  }
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function getAdminProfiles(limit = 200) {
  if (!hasSupabaseConfig) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// Demo-mode profile factory (no Supabase).
export function buildDemoProfile(localUser) {
  return {
    id: localUser.id || "local",
    username: localUser.username,
    email: localUser.email,
    phone: localUser.phone || "",
    role: "user",
    verification_status: localUser.verification_status || "not_submitted",
    bonus_balance: 100,
    rollover_required: 1000,
    rollover_progress: Number(readStoredValue("neonbetRolloverProgress", 0)),
  };
}

export function saveDemoProfile(profile) {
  writeStoredValue(DEMO_PROFILE_KEY, profile);
}

export default { getProfile, getAdminProfiles, buildDemoProfile, saveDemoProfile };
