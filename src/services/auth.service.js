// Authentication + account session service.
import { supabase, hasSupabaseConfig } from "./supabaseClient";

export { hasSupabaseConfig };

export const PROFILE_COLUMNS =
  "id,email,username,phone,role,verification_status,bonus_balance,rollover_required,rollover_progress,admin_notes,created_at,updated_at";
export const SUBMISSION_COLUMNS =
  "id,user_id,asset,network,tx_hash,amount_usd,status,admin_notes,created_at,updated_at";
export const WITHDRAWAL_COLUMNS =
  "id,user_id,amount_usd,payout_method,payout_address,status,admin_notes,created_at,updated_at";
export const ADMIN_SUBMISSION_COLUMNS = `${SUBMISSION_COLUMNS}, profiles(username,email)`;
export const ADMIN_WITHDRAWAL_COLUMNS = `${WITHDRAWAL_COLUMNS}, profiles(username,email)`;

export async function getSession() {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session || null;
}

export function onAuthChange(callback) {
  if (!hasSupabaseConfig) return () => {};
  let active = true;
  const timers = new Set();
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    // Run account requests after the auth callback releases its session lock.
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      if (active) callback(session?.user || null, event);
    }, 0);
    timers.add(timer);
  });
  return () => {
    active = false;
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
    data.subscription.unsubscribe();
  };
}

export async function signIn({ email, password }) {
  if (!hasSupabaseConfig) throw new Error("Account service is unavailable.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { data };
}

export async function signUp({ email, password, username, phone, contactMethod }) {
  if (!hasSupabaseConfig) throw new Error("Account service is unavailable.");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, phone, contact_method: contactMethod } },
  });
  if (error) throw error;
  return { data };
}

export async function signOut() {
  if (!hasSupabaseConfig) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email, redirectTo) {
  if (!hasSupabaseConfig) throw new Error("Account service is unavailable.");
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

export async function updatePassword(password) {
  if (!hasSupabaseConfig) throw new Error("Account service is unavailable.");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export default { updatePassword, getSession, onAuthChange, signIn, signUp, signOut, resetPassword, PROFILE_COLUMNS, SUBMISSION_COLUMNS, WITHDRAWAL_COLUMNS, ADMIN_SUBMISSION_COLUMNS, ADMIN_WITHDRAWAL_COLUMNS };
