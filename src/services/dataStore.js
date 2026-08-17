// Unified data store for core entities (profiles, verification submissions,
// withdrawal requests). Selects between a Supabase-backed strategy and a
// localStorage-backed demo strategy based on the resolved APP_MODE.
//
// This collapses the demo/supabase branching that used to be duplicated across
// profiles/verification/transactions/admin services into one place, and is the
// single source of truth for the Supabase client. The *mode decision* itself now
// lives in src/config/appMode.ts (APP_MODE / IS_SUPABASE / IS_DEMO); this module
// only answers "are we in supabase mode?" so it can pick a storage backend.
import { createClient } from "@supabase/supabase-js";
import { IS_SUPABASE } from "../config/appMode";
import verificationConfig from "../config/verification";
import {
  readStoredValue,
  readStoredArray,
  writeStoredArray,
  writeStoredValue,
} from "../lib/storage";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// `hasSupabaseConfig` still answers "are credentials physically present?" — it is
// used by appMode.ts to resolve the mode, but must not be used anywhere else to
// decide runtime behaviour.
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
    if (!IS_SUPABASE) return readStoredValue(DEMO_PROFILE_KEY, null);
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data;
  },

  async getAdminProfiles(limit = 200) {
    if (!IS_SUPABASE) return [];
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async upsertProfile(profile) {
    if (!IS_SUPABASE) {
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
    if (!IS_SUPABASE) return readStoredArray(DEMO_SUBMISSIONS_KEY);
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

  // Server-authoritative fee. In Supabase mode the DB decides the amount; the
  // client-supplied amountUsd is ignored for storage. In demo mode we fall back
  // to the config value so the UI still shows a fee.
  async getVerificationFee() {
    if (!IS_SUPABASE) {
      return verificationConfig.feeUsd;
    }
    const { data, error } = await supabase.rpc("get_verification_fee");
    if (error) throw error;
    return typeof data === "number" ? data : Number(data);
  },

  async insertSubmission({ userId, asset, network, txHash, amountUsd }) {
    if (!IS_SUPABASE) {
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
    // The RPC sets amount_usd from operator_settings; the client cannot choose it.
    const { data, error } = await supabase.rpc("submit_verification_submission", {
      p_user_id: userId,
      p_asset: asset,
      p_network: network,
      p_tx_hash: txHash,
    });
    if (error) throw error;
    return { error: null, id: data };
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
    if (!IS_SUPABASE) return readStoredArray(DEMO_WITHDRAWALS_KEY);
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
    if (!IS_SUPABASE) {
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
