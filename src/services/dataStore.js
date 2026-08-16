// Unified data store for core entities (profiles, verification submissions,
// withdrawal requests). Selects between a Supabase-backed strategy and a
// localStorage-backed demo strategy based on whether Supabase env vars exist.
//
// This collapses the demo/supabase branching that used to be duplicated across
// profiles/verification/transactions/admin services into one place, and is the
// single source of truth for the Supabase client.
import { createClient } from "@supabase/supabase-js";
import {
  readStoredValue,
  readStoredArray,
  writeStoredArray,
  writeStoredValue,
} from "../lib/storage";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: "neonbet-auth",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Column selectors (kept here so every consumer shares one definition).
export const PROFILE_COLUMNS =
  "id,email,username,phone,role,verification_status,bonus_balance,rollover_required,rollover_progress,admin_notes,created_at,updated_at";
export const SUBMISSION_COLUMNS =
  "id,user_id,asset,network,tx_hash,amount_usd,status,admin_notes,created_at,updated_at";
export const WITHDRAWAL_COLUMNS =
  "id,user_id,amount_usd,payout_method,payout_address,status,admin_notes,created_at,updated_at";
export const ADMIN_SUBMISSION_COLUMNS = `${SUBMISSION_COLUMNS}, profiles(username,email)`;
export const ADMIN_WITHDRAWAL_COLUMNS = `${WITHDRAWAL_COLUMNS}, profiles(username,email)`;

const DEMO_PROFILE_KEY = "neonbetProfile";
const DEMO_SUBMISSIONS_KEY = "neonbetVerificationSubmissions";
const DEMO_WITHDRAWALS_KEY = "neonbetWithdrawalRequests";

export const dataStore = {
  // ---- Profiles ----
  async getProfile(userId) {
    if (!hasSupabaseConfig) return readStoredValue(DEMO_PROFILE_KEY, null);
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data;
  },

  async getAdminProfiles(limit = 200) {
    if (!hasSupabaseConfig) return [];
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async upsertProfile(profile) {
    if (!hasSupabaseConfig) {
      writeStoredValue(DEMO_PROFILE_KEY, profile);
      return profile;
    }
    const { data, error } = await supabase
      .from("profiles")
      .upsert(profile)
      .select(PROFILE_COLUMNS)
      .single();
    if (error) throw error;
    return data;
  },

  // ---- Verification submissions ----
  async getSubmissions({ userId, isAdmin, limit = 20 }) {
    if (!hasSupabaseConfig) return readStoredArray(DEMO_SUBMISSIONS_KEY);
    let query = supabase
      .from("verification_submissions")
      .select(isAdmin ? ADMIN_SUBMISSION_COLUMNS : SUBMISSION_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(isAdmin ? 200 : limit);
    if (!isAdmin && userId) query = query.eq("user_id", userId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async insertSubmission({ userId, asset, network, txHash, amountUsd }) {
    if (!hasSupabaseConfig) {
      const localSubmission = {
        id: `local-submission-${Date.now()}`,
        user_id: userId,
        asset,
        network,
        tx_hash: txHash,
        amount_usd: amountUsd,
        status: "pending",
        created_at: new Date().toISOString(),
      };
      const next = [localSubmission, ...readStoredArray(DEMO_SUBMISSIONS_KEY)];
      writeStoredArray(DEMO_SUBMISSIONS_KEY, next);
      return { localSubmission };
    }
    const { error } = await supabase.from("verification_submissions").insert({
      user_id: userId,
      asset,
      network,
      tx_hash: txHash,
      amount_usd: amountUsd,
    });
    if (error) throw error;
    return { error: null };
  },

  async reviewSubmission(submissionId, status, adminNotes = "") {
    const { error } = await supabase.rpc("review_verification_submission", {
      p_submission_id: submissionId,
      p_status: status,
      p_admin_notes: adminNotes.trim(),
    });
    if (error) throw error;
  },

  // ---- Withdrawals ----
  async getWithdrawals({ userId, isAdmin, limit = 20 }) {
    if (!hasSupabaseConfig) return readStoredArray(DEMO_WITHDRAWALS_KEY);
    let query = supabase
      .from("withdrawal_requests")
      .select(isAdmin ? ADMIN_WITHDRAWAL_COLUMNS : WITHDRAWAL_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(isAdmin ? 200 : limit);
    if (!isAdmin && userId) query = query.eq("user_id", userId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async insertWithdrawal({ userId, request }) {
    if (!hasSupabaseConfig) {
      const local = {
        id: `local-withdrawal-${Date.now()}`,
        user_id: userId,
        ...request,
        status: "pending",
        created_at: new Date().toISOString(),
      };
      const next = [local, ...readStoredArray(DEMO_WITHDRAWALS_KEY)];
      writeStoredArray(DEMO_WITHDRAWALS_KEY, next);
      return { local };
    }
    const { error } = await supabase
      .from("withdrawal_requests")
      .insert({ user_id: userId, ...request });
    if (error) throw error;
    return { error: null };
  },

  async reviewWithdrawal(withdrawalId, status, adminNotes = "") {
    const { error } = await supabase.rpc("review_withdrawal_request", {
      p_withdrawal_id: withdrawalId,
      p_status: status,
      p_admin_notes: adminNotes.trim(),
    });
    if (error) throw error;
  },
};

export default dataStore;
