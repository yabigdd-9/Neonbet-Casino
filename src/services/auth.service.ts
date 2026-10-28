import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
// Authentication + account session service.
import { requireSupabase, hasSupabaseConfig } from "./supabaseClient";

export { hasSupabaseConfig };
export { initialAuthRedirect } from "./supabaseClient";

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
  const { data, error } = await requireSupabase().auth.getSession();
  if (error) throw error;
  return data.session || null;
}

export function onAuthChange(callback: (value: { event: AuthChangeEvent; session: Session | null }) => void) {
  if (!hasSupabaseConfig) return () => {};
  const { data } = requireSupabase().auth.onAuthStateChange((event, session) => callback({ event, session }));
  return () => data.subscription.unsubscribe();
}

export async function signIn({ email, password }: { email: string; password: string }) {
  const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp({
  email,
  password,
  username,
  phone,
  contactMethod,
}: {
  email: string;
  password: string;
  username: string;
  phone: string;
  contactMethod: string;
}) {
  const { data, error } = await requireSupabase().auth.signUp({
    email,
    password,
    options: { data: { username, phone, contact_method: contactMethod } },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!hasSupabaseConfig) return;
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string, redirectTo: string) {
  try {
    const { error } = await requireSupabase().auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  } catch (caught) {
    const error = caught as { status?: number } | null;
    if (error?.status === 429) throw new Error("Too many reset requests. Please wait before trying again.");
    throw new Error("Password reset could not be requested. Try again later.");
  }
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

export async function updatePassword(password: string) {
  if (typeof password !== "string" || password.length < 8) throw new Error("Use at least 8 characters.");
  try {
    const { error } = await requireSupabase().auth.updateUser({ password });
    if (error) throw error;
  } catch (caught) {
    const error = caught as { code?: string; status?: number; name?: string } | null;
    if (error?.code === "weak_password")
      throw new Error("Choose a stronger password with at least 8 characters.");
    if (error?.code === "same_password") throw new Error("Choose a password you have not used before.");
    if (
      error?.status === 401 ||
      error?.status === 403 ||
      error?.code === "session_not_found" ||
      error?.name === "AuthSessionMissingError"
    )
      throw new Error("This reset session has expired. Request a new password reset email.");
    throw new Error("Password could not be updated. Try again or request a new reset email.");
  }
}
