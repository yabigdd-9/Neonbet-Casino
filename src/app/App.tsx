import React, { useCallback, useEffect, useState } from "react";
import { ToastProvider, useToast } from "../components/feedback/ToastProvider";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import MobileNav from "../components/layout/MobileNav";
import Footer from "../components/layout/Footer";
import Modal from "../components/ui/Modal";

import Hero from "../features/casino/Hero";
import FeaturedGames from "../features/casino/FeaturedGames";
import ArcadeGamesSection from "../features/casino/ArcadeGamesSection";
import SlotProviderLibrary from "../features/casino/SlotProviderLibrary";
import GameLaunchModal from "../features/casino/GameLaunchModal";
import SlotGameModal from "../features/casino/SlotGameModal";
import ArcadeGameModal from "../features/casino/ArcadeGameModal";

import AuthModal from "../features/auth/AuthModal";
import AccountStatusPanel from "../features/account/AccountStatusPanel";
import VerificationPanel from "../features/verification/VerificationPanel";
import WithdrawalRequestPanel from "../features/transactions/WithdrawalRequestPanel";
import AdminDashboard from "../features/admin/AdminDashboard";
import AdminReviewModal from "../features/admin/AdminReviewModal";
import AdminProfileModal from "../features/admin/AdminProfileModal";
import { PromotionsSection, TermsSection, PolicyModalContent } from "../features/promotions";

import {
  getSession,
  onAuthChange,
  signIn,
  signUp,
  signOut,
  resetPassword,
} from "../services/auth.service";
import { IS_SUPABASE, IS_DEMO } from "../config/appMode";
import { getProfile, getAdminProfiles, buildDemoProfile } from "../services/profiles.service";
import {
  getSubmissions,
  submitSubmission,
  reviewSubmission,
  validateTxHash,
} from "../services/verification.service";
import {
  getWithdrawals,
  submitWithdrawal,
  reviewWithdrawal,
  validateWithdrawal,
} from "../services/transactions.service";
import { updateProfileAdmin } from "../services/admin.service";

import { useFavorites, useRecentGames } from "../hooks/useGameHistory";
import { readStoredValue, writeStoredValue } from "../lib/storage";
import { features } from "../config/features";
import type {
  Profile,
  SlotGame,
  VerificationSubmission,
  WithdrawalRequest,
  ArcadeGameDef,
} from "../types";
import type { PolicyPage } from "../features/promotions";

interface ReviewModalState {
  item: VerificationSubmission | WithdrawalRequest;
  status: string;
  type: "verification" | "withdrawal";
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function AppContent() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(100);
  const [activeGame, setActiveGame] = useState<SlotGame | null>(null);
  const [activeArcadeGame, setActiveArcadeGame] = useState<ArcadeGameDef | null>(null);
  const [launchGame, setLaunchGame] = useState<SlotGame | null>(null);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { recentGames, recordGame } = useRecentGames();

  const [authMode, setAuthMode] = useState<"login" | "register" | "reset">("login");
  const [authOpen, setAuthOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [submissions, setSubmissions] = useState<VerificationSubmission[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [verificationSaving, setVerificationSaving] = useState(false);
  const [withdrawalSaving, setWithdrawalSaving] = useState(false);
  const [adminSaving, setAdminSaving] = useState(false);
  const [policyPage, setPolicyPage] = useState<PolicyPage | null>(null);
  const [reviewModal, setReviewModal] = useState<ReviewModalState | null>(null);
  const [profileModal, setProfileModal] = useState<Profile | null>(null);

  const [user, setUser] = useState<Profile | null>(() => {
    if (IS_SUPABASE) return null;
    return readStoredValue("neonbetUser", null) as Profile | null;
  });

  const latestSubmission = submissions[0] ?? null;
  const latestWithdrawal = withdrawals[0] ?? null;

  const loadAccount = useCallback(
    async (nextUser: Profile | null = user) => {
      if (!nextUser) {
        setProfile(null);
        setProfiles([]);
        setSubmissions([]);
        setWithdrawals([]);
        return;
      }
      if (IS_DEMO) {
        const demo = buildDemoProfile(nextUser);
        setProfile(demo);
        setProfiles([]);
        setSubmissions(readStoredValue("neonbetVerificationSubmissions", []) as VerificationSubmission[]);
        setWithdrawals(readStoredValue("neonbetWithdrawalRequests", []) as WithdrawalRequest[]);
        return;
      }
      try {
        const profileData = await getProfile(nextUser.id);
        if (!profileData) return;
        setProfile(profileData);
        const isAdmin = profileData.role === "admin";
        const [adminRows, submissionRows, withdrawalRows] = await Promise.all([
          getAdminProfiles(),
          getSubmissions({ userId: nextUser.id, isAdmin }),
          getWithdrawals({ userId: nextUser.id, isAdmin }),
        ]);
        setProfiles(isAdmin ? adminRows : []);
        setSubmissions(submissionRows as VerificationSubmission[]);
        setWithdrawals(withdrawalRows as WithdrawalRequest[]);
      } catch (error: unknown) {
        setAuthError((error as { message?: string }).message || "Account data failed to load.");
      }
    },
    [user],
  );

  useEffect(() => {
    if (!IS_SUPABASE) return undefined;
    getSession().then((session) => {
      const s = session as unknown as { user?: Profile };
      if (s?.user) {
        setUser(s.user);
        loadAccount(s.user);
      }
    });
    let unsub: (() => void) | undefined;
    onAuthChange((nextUser: Profile | null) => {
      setUser(nextUser);
      if (nextUser) loadAccount(nextUser);
      else {
        setProfile(null);
        setProfiles([]);
        setSubmissions([]);
        setWithdrawals([]);
      }
    }).then((fn) => {
      unsub = fn;
    });
    return () => {
      unsub?.();
    };
  }, [loadAccount]);

  function openAuth(mode: "login" | "register" | "reset") {
    setAuthError("");
    setAuthMode(mode);
    setAuthOpen(true);
  }

  async function handleAuthSubmit(payload: {
    mode: "login" | "register" | "reset";
    email: string;
    password: string;
    username: string;
    phone: string;
    contactMethod: string;
  }) {
    setAuthLoading(true);
    setAuthError("");
    try {
      if (IS_DEMO) {
        const localUser: Profile = {
          id: `local-${Date.now()}`,
          username: payload.username,
          phone: payload.phone,
          contactMethod: payload.contactMethod,
          verification_status: "not_submitted",
        } as Profile;
        setUser(localUser);
        writeStoredValue("neonbetUser", localUser);
        await loadAccount(localUser);
        setAuthOpen(false);
        toast.success("Local account created");
        return;
      }
      if (payload.mode === "register") {
        const data = await signUp({
          email: payload.email,
          password: payload.password,
          username: payload.username,
          phone: payload.phone,
          contactMethod: payload.contactMethod,
        });
        if (!data.session) {
          setAuthError(
            "Account created. Check your email if Supabase email confirmation is enabled, then log in.",
          );
          return;
        }
        setUser(data.user as unknown as Profile);
        await loadAccount(data.user as unknown as Profile);
        setAuthOpen(false);
        toast.success("Account created");
        return;
      }
      const data = await signIn({ email: payload.email, password: payload.password });
      setUser(data.user as unknown as Profile);
      await loadAccount(data.user as unknown as Profile);
      setAuthOpen(false);
      toast.success("Signed in");
    } catch (error: unknown) {
      setAuthError((error as { message?: string }).message || "Account action failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleResetPassword(email: string) {
    if (!IS_SUPABASE || !email.includes("@")) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      await resetPassword(email, window.location.origin + window.location.pathname);
      setAuthError("Password reset email sent. Check your inbox.");
      toast.info("Reset email sent");
    } catch (error: unknown) {
      setAuthError((error as { message?: string }).message || "Password reset failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    if (IS_SUPABASE) await signOut();
    setUser(null);
    setProfile(null);
    setProfiles([]);
    setSubmissions([]);
    setWithdrawals([]);
    writeStoredValue("neonbetUser", null);
    toast.info("Signed out");
  }

  async function handleSubmitVerification(
    method: { name: string; network: string },
    txHash: string,
  ) {
    if (!user) {
      openAuth("register");
      return;
    }
    if (!validateTxHash(txHash)) {
      setAuthError("Enter a valid transaction hash before submitting.");
      return;
    }
    setVerificationSaving(true);
    try {
      const result = await submitSubmission({ userId: user.id, method, txHash });
      if (result.localSubmission) {
        setSubmissions([result.localSubmission, ...submissions]);
        setProfile(
          (current) => ({ ...(current as Profile), verification_status: "pending" }) as Profile,
        );
        toast.success("Verification submitted");
      } else {
        await loadAccount(user);
        toast.success("Verification submitted");
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      const hasPending =
        err.code === "23505" ||
        (err.message || "").includes("verification_submissions_user_pending_idx");
      setAuthError(
        hasPending
          ? "You already have a pending verification submission."
          : err.message || "Verification submission failed.",
      );
    } finally {
      setVerificationSaving(false);
    }
  }

  async function handleSubmitWithdrawal(request: {
    amount_usd: number;
    payout_method: string;
    payout_address: string;
  }) {
    if (!user) {
      openAuth("login");
      return;
    }
    if (!validateWithdrawal(request)) {
      setAuthError("Enter a valid withdrawal amount and payout address.");
      return;
    }
    setWithdrawalSaving(true);
    try {
      const result = await submitWithdrawal({ userId: user.id, request });
      if (result.local) {
        setWithdrawals([result.local, ...withdrawals]);
        toast.success("Withdrawal requested");
      } else {
        await loadAccount(user);
        toast.success("Withdrawal requested");
      }
    } catch (error: unknown) {
      setAuthError((error as { message?: string }).message || "Withdrawal request failed.");
    } finally {
      setWithdrawalSaving(false);
    }
  }

  async function handleReviewSubmission(
    submission: { id?: string } | null,
    status: string,
    adminNotes = (submission as { admin_notes?: string })?.admin_notes || "",
  ) {
    if (!IS_SUPABASE || profile?.role !== "admin") return;
    setAdminSaving(true);
    try {
      await reviewSubmission(submission?.id, status, adminNotes);
      await loadAccount(user);
      setReviewModal(null);
      toast.success(`Submission ${status}`);
    } catch (error: unknown) {
      setAuthError((error as { message?: string }).message || "Admin review failed.");
    } finally {
      setAdminSaving(false);
    }
  }

  async function handleReviewWithdrawal(
    withdrawal: { id?: string } | null,
    status: string,
    adminNotes = (withdrawal as { admin_notes?: string })?.admin_notes || "",
  ) {
    if (!IS_SUPABASE || profile?.role !== "admin") return;
    setAdminSaving(true);
    try {
      await reviewWithdrawal(withdrawal?.id, status, adminNotes);
      await loadAccount(user);
      setReviewModal(null);
      toast.success(`Withdrawal ${status}`);
    } catch (error: unknown) {
      setAuthError((error as { message?: string }).message || "Withdrawal review failed.");
    } finally {
      setAdminSaving(false);
    }
  }

  async function handleUpdateProfile(userProfile: Profile, updates?: Record<string, unknown>) {
    if (!IS_SUPABASE || profile?.role !== "admin") return;
    setAdminSaving(true);
    try {
      await updateProfileAdmin(userProfile.id, updates || {});
      await loadAccount(user);
      setProfileModal(null);
      toast.success("Profile updated");
    } catch (error: unknown) {
      setAuthError((error as { message?: string }).message || "Profile update failed.");
    } finally {
      setAdminSaving(false);
    }
  }

  function handleOpenGame(game: SlotGame) {
    setLaunchGame(game);
  }

  function handleLaunchGame() {
    if (!launchGame) return;
    recordGame(launchGame);
    setActiveGame(launchGame);
    setLaunchGame(null);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-2xl focus:bg-cyan-400 focus:px-4 focus:py-3 focus:font-black focus:text-slate-950"
      >
        Skip to content
      </a>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.15),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.14),transparent_35%)]" />
      <Sidebar open={open} setOpen={setOpen} />
      <Header
        setOpen={setOpen}
        balance={balance}
        user={user}
        onOpenAuth={openAuth}
        onLogout={handleLogout}
      />

      <main id="main-content" className="relative space-y-8 px-4 py-8 md:px-8 lg:ml-72">
        <Hero
          onClaim={() => scrollToSection("verification")}
          onOpenGame={(g: ArcadeGameDef) => setActiveArcadeGame(g)}
        />

        {features.account && (
          <AccountStatusPanel user={user} profile={profile} latestSubmission={latestSubmission} />
        )}

        <FeaturedGames
          onPlay={handleOpenGame}
          _favorites={favorites as string[]}
          isFavorite={isFavorite}
        />

        <ArcadeGamesSection onPlay={(g: ArcadeGameDef) => setActiveArcadeGame(g)} />

        <SlotProviderLibrary
          onPlay={handleOpenGame}
          favorites={favorites as string[]}
          isFavorite={isFavorite}
          _onToggleFavorite={toggleFavorite}
          recentGames={recentGames as SlotGame[]}
        />

        {features.verification && (
          <VerificationPanel
            user={user}
            latestSubmission={latestSubmission}
            onSubmitVerification={handleSubmitVerification}
            verificationSaving={verificationSaving}
            onNeedAuth={() => openAuth("register")}
          />
        )}

        {features.withdrawals && user && (
          <WithdrawalRequestPanel
            user={user}
            profile={profile}
            latestWithdrawal={latestWithdrawal}
            withdrawalSaving={withdrawalSaving}
            onSubmitWithdrawal={handleSubmitWithdrawal}
          />
        )}

        {features.admin && (
          <AdminDashboard
            profile={profile}
            profiles={profiles}
            submissions={submissions as never}
            withdrawals={withdrawals as never}
            onReview={(item, status) => setReviewModal({ item, status, type: "verification" })}
            onReviewWithdrawal={(item, status) =>
              setReviewModal({ item, status, type: "withdrawal" })
            }
            onUpdateProfile={setProfileModal}
            adminSaving={adminSaving}
          />
        )}

        {features.promotions && <PromotionsSection />}

        <VIPSection />

        <TermsSection onOpenPolicy={(page) => setPolicyPage(page)} />

        <Footer onOpenPolicy={(page) => setPolicyPage(page)} />
      </main>

      <MobileNav onOpenAuth={openAuth} />

      {policyPage && (
        <Modal
          title={(policyPage as { title?: string }).title}
          eyebrow={(policyPage as { eyebrow?: string }).eyebrow}
          onClose={() => setPolicyPage(null)}
        >
          <PolicyModalContent page={policyPage as never} />
        </Modal>
      )}
      {reviewModal && (
        <AdminReviewModal
          item={reviewModal.item}
          type={reviewModal.type}
          status={reviewModal.status}
          onClose={() => setReviewModal(null)}
          onSubmit={
            reviewModal.type === "withdrawal" ? handleReviewWithdrawal : handleReviewSubmission
          }
          saving={adminSaving}
        />
      )}
      {profileModal && (
        <AdminProfileModal
          item={profileModal}
          type="verification"
          status="verified"
          onClose={() => setProfileModal(null)}
          onSubmit={handleUpdateProfile}
          saving={adminSaving}
        />
      )}
      {launchGame && (
        <GameLaunchModal
          game={launchGame}
          isFavorite={isFavorite(launchGame)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setLaunchGame(null)}
          onLaunch={handleLaunchGame}
        />
      )}
      {activeGame && (
        <SlotGameModal
          game={activeGame}
          balance={balance}
          setBalance={setBalance}
          onClose={() => setActiveGame(null)}
        />
      )}
      {activeArcadeGame && (
        <ArcadeGameModal
          game={activeArcadeGame}
          balance={balance}
          setBalance={setBalance}
          onClose={() => setActiveArcadeGame(null)}
        />
      )}
      {authOpen && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setAuthOpen(false)}
          onSubmit={handleAuthSubmit}
          onResetPassword={handleResetPassword}
          authLoading={authLoading}
          authError={authError}
        />
      )}
    </div>
  );
}

// VIP / leaderboard section (static demo content).
function VIPSection() {
  return (
    <section id="vip" className="scroll-mt-24 grid gap-5 xl:grid-cols-3">
      <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/[0.06] p-6">
        <h2 className="mb-5 text-2xl font-black">Leaderboard</h2>
        {["LuckyDion", "NeonWolf", "KiwiJackpot", "SpinQueen"].map((name, i) => (
          <div
            key={name}
            className="flex items-center gap-4 border-b border-white/10 py-4 last:border-none"
          >
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 font-black">
              #{i + 1}
            </div>
            <div className="flex-1 font-bold">{name}</div>
            <div className="font-black text-cyan-300">
              {(98000 - i * 13750).toLocaleString()} pts
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-300/15 to-orange-500/10 p-6">
        <div className="flex items-center gap-2 font-black text-amber-200">
          <span>★</span> VIP Progress
        </div>
        <h2 className="mt-5 text-4xl font-black">Gold II</h2>
        <p className="mt-2 text-slate-300">
          Complete missions to unlock rewards and account perks.
        </p>
        <div className="mt-6 h-4 overflow-hidden rounded-full bg-black/30">
          <div className="h-full w-[62%] bg-amber-300" />
        </div>
        <p className="mt-3 text-sm text-slate-400">62% to Gold III</p>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
