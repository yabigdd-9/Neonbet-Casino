import type { AccountUser, Profile } from "../types/account";
// Profile + account data service.
import { requireSupabase, hasSupabaseConfig } from "./supabaseClient";
import { PROFILE_COLUMNS } from "./auth.service";
import { readStoredValue, writeStoredValue } from "../lib/storage";

const DEMO_PROFILE_KEY = "neonbetProfile";

export async function getProfile(userId: string): Promise<Profile> {
  if (!hasSupabaseConfig) {
    const saved = readStoredValue<Profile | null>(DEMO_PROFILE_KEY, null);
    if (!saved || saved.id !== userId) throw new Error("Demo profile not found.");
    return saved;
  }
  const { data, error } = await requireSupabase()
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function getAdminProfiles(limit = 20, page = 0): Promise<Profile[]> {
  if (!hasSupabaseConfig) return [];
  const { data, error } = await requireSupabase()
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .order("created_at", { ascending: false })
    .range(page * limit, page * limit + limit - 1);
  if (error) throw error;
  return (data || []) as Profile[];
}

// Demo-mode profile factory (no Supabase).
export function buildDemoProfile(localUser: AccountUser): Profile {
  return {
    id: localUser.id || "local",
    username: localUser.username || "Demo player",
    email: localUser.email,
    phone: localUser.phone || "",
    role: "user",
    verification_status: localUser.verification_status || "not_submitted",
    bonus_balance: 100,
    rollover_required: 1000,
    rollover_progress: Number(readStoredValue(`neonbetRolloverProgress:${localUser.id}`, 0)),
  };
}

export function saveDemoProfile(profile: Profile) {
  writeStoredValue(DEMO_PROFILE_KEY, profile);
}

export default { getProfile, getAdminProfiles, buildDemoProfile, saveDemoProfile };
