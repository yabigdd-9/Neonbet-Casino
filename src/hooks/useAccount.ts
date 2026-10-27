import type { AccountUser, AccountState } from "../types/account";
import { useCallback, useEffect, useRef, useState } from "react";
import { hasSupabaseConfig, getSession, onAuthChange } from "../services/auth.service";
import { getProfile, getAdminProfiles, buildDemoProfile } from "../services/profiles.service";
import { getSubmissions } from "../services/verification.service";
import { getWithdrawals } from "../services/transactions.service";
import { readStoredValue, isStoredUser } from "../lib/storage";

const empty: AccountState = {
  profile: null,
  profiles: [],
  submissions: [],
  withdrawals: [],
  latestSubmission: null,
  latestWithdrawal: null,
};
export function useAccount() {
  const [user, setUserState] = useState<AccountUser | null>(() => {
    const saved = hasSupabaseConfig ? null : readStoredValue("neonbetUser", null);
    return isStoredUser(saved) ? saved : null;
  });
  const userRef = useRef(user);
  const epoch = useRef(0);
  const adminPageRef = useRef(0);
  const [adminPage, setAdminPage] = useState(0);
  const [account, setAccount] = useState<AccountState>(empty);
  const [accountError, setAccountError] = useState("");
  const [accountLoading, setAccountLoading] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const setUser = useCallback((next: AccountUser | null) => {
    epoch.current += 1;
    userRef.current = next;
    setUserState(next);
    adminPageRef.current = 0;
    setAdminPage(0);
    setAccount(empty);
    setAccountError("");
    setAccountLoading(false);
  }, []);
  const loadAccount = useCallback(async (nextUser = userRef.current, page = adminPageRef.current) => {
    if (nextUser?.id !== userRef.current?.id) return;
    adminPageRef.current = page;
    const ticket = ++epoch.current;
    if (!nextUser) {
      setAccount(empty);
      setAccountLoading(false);
      return;
    }
    setAccountLoading(true);
    setAccountError("");
    try {
      const profile = hasSupabaseConfig ? await getProfile(nextUser.id) : buildDemoProfile(nextUser);
      if (ticket !== epoch.current) return;
      const isAdmin = profile.role === "admin";
      if (!isAdmin && page !== 0) {
        page = 0;
        adminPageRef.current = 0;
      }
      const [profiles, submissions, withdrawals, ownSubmissions, ownWithdrawals] = await Promise.all([
        isAdmin ? getAdminProfiles(20, page) : Promise.resolve([]),
        getSubmissions({ userId: nextUser.id, isAdmin, page }),
        getWithdrawals({ userId: nextUser.id, isAdmin, page }),
        isAdmin ? getSubmissions({ userId: nextUser.id, isAdmin: false, limit: 1 }) : Promise.resolve(null),
        isAdmin ? getWithdrawals({ userId: nextUser.id, isAdmin: false, limit: 1 }) : Promise.resolve(null),
      ]);
      if (ticket === epoch.current) {
        if (!hasSupabaseConfig && submissions[0]) profile.verification_status = submissions[0].status;
        setAdminPage(page);
        setAccount({
          profile,
          profiles,
          submissions,
          withdrawals,
          latestSubmission: (ownSubmissions ?? submissions)[0] ?? null,
          latestWithdrawal: (ownWithdrawals ?? withdrawals)[0] ?? null,
        });
      }
    } catch (caught) {
      const error = caught instanceof Error ? caught : new Error("Account data failed to load.");
      if (ticket === epoch.current) {
        setAccount(empty);
        setAccountError(error.message || "Account data failed to load.");
      }
    } finally {
      if (ticket === epoch.current) setAccountLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!hasSupabaseConfig) {
      void loadAccount(userRef.current);
      return () => {
        epoch.current += 1;
      };
    }
    let active = true;
    let authChanged = false;
    const unsubscribe = onAuthChange(({ event, session }) => {
      if (!active) return;
      authChanged = true;
      const next = session?.user || null;
      if (!next) setRecovery(false);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      if (next?.id !== userRef.current?.id || event === "INITIAL_SESSION" || event === "USER_UPDATED") {
        setUser(next);
        // Fetch outside the synchronous Supabase auth callback.
        queueMicrotask(() => {
          if (active) void loadAccount(next);
        });
      }
    });
    getSession()
      .then((session) => {
        if (active && !authChanged) {
          setUser(session?.user || null);
          void loadAccount(session?.user || null);
        }
      })
      .catch((error) => {
        if (active && !authChanged) setAccountError(error.message || "Session could not be restored.");
      });
    return () => {
      active = false;
      epoch.current += 1;
      unsubscribe();
    };
  }, [loadAccount, setUser]);
  return {
    user,
    setUser,
    ...account,
    adminPage,
    loadAccount,
    accountError,
    accountLoading,
    recovery,
    setRecovery,
  };
}
