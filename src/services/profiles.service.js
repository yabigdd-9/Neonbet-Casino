// Profile + account data service. Delegates storage to the unified dataStore.
import { dataStore } from "./dataStore";
import { readStoredValue } from "../lib/storage";

export async function getProfile(userId) {
  return dataStore.getProfile(userId);
}

export async function getAdminProfiles(limit = 200) {
  return dataStore.getAdminProfiles(limit);
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
  dataStore.upsertProfile(profile);
}

export default { getProfile, getAdminProfiles, buildDemoProfile, saveDemoProfile };
