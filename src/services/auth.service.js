// Authentication + account session service.
import { supabase, hasSupabaseConfig } from "./dataStore";

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
  const { data } = await supabase.auth.getSession();
  return data.session || null;
}

export async function onAuthChange(callback) {
  if (!hasSupabaseConfig) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) =>
    callback(session?.user || null),
  );
  return () => data.subscription.unsubscribe();
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp({ email, password, username, phone, contactMethod }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, phone, contact_method: contactMethod } },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!hasSupabaseConfig) return;
  await supabase.auth.signOut();
}

export async function resetPassword(email, redirectTo) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

export default {
  getSession,
  onAuthChange,
  signIn,
  signUp,
  signOut,
  resetPassword,
  PROFILE_COLUMNS,
  SUBMISSION_COLUMNS,
  WITHDRAWAL_COLUMNS,
  ADMIN_SUBMISSION_COLUMNS,
  ADMIN_WITHDRAWAL_COLUMNS,
};
