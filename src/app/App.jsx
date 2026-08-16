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

import { hasSupabaseConfig, getSession, onAuthChange, signIn, signUp, signOut, resetPassword } from "../services/auth.service";
import { getProfile, getAdminProfiles, buildDemoProfile, saveDemoProfile } from "../services/profiles.service";
import { getSubmissions, submitSubmission, reviewSubmission, validateTxHash } from "../services/verification.service";
import { getWithdrawals, submitWithdrawal, reviewWithdrawal, validateWithdrawal } from "../services/transactions.service";
import { updateProfileAdmin } from "../services/admin.service";

import { useFavorites, useRecentGames } from "../hooks/useGameHistory";
import { getGameId } from "../lib/gameEngine";
import { readStoredValue, writeStoredValue } from "../lib/storage";
import { features } from "../config/features";
import { IS_SUPABASE } from "../config/appMode";

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function AppContent() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(100);
  const [activeGame, setActiveGame] = useState(null);
  const [activeArcadeGame, setActiveArcadeGame] = useState(null);
  const [launchGame, setLaunchGame] = useState(null);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { recentGames, recordGame } = useRecentGames();

  const [authMode, setAuthMode] = useState("login");
  const [authOpen, setAuthOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [verificationSaving, setVerificationSaving] = useState(false);
  const [withdrawalSaving, setWithdrawalSaving] = useState(false);
  const [adminSaving, setAdminSaving] = useState(false);
  const [policyPage, setPolicyPage] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [profileModal, setProfileModal] = useState(null);

  const [user, setUser] = useState(() => {
    if (hasSupabaseConfig) return null;
    return readStoredValue("neonbetUser", null);
  });

  const latestSubmission = submissions[0] || null;
  const latestWithdrawal = withdrawals[0] || null;

  const loadAccount = useCallback(
    async (nextUser = user) => {
      if (!nextUser) {
        setProfile(null);
        setProfiles([]);
        setSubmissions([]);
        setWithdrawals([]);
        return;
      }
      if (!hasSupabaseConfig) {
        const demo = buildDemoProfile(nextUser);
        setProfile(demo);
        setProfiles([]);
        setSubmissions(readStoredValue("neonbetVerificationSubmissions", []));
        setWithdrawals(readStoredValue("neonbetWithdrawalRequests", []));
        return;
      }
      try {
        const profileData = await getProfile(nextUser.id);
        setProfile(profileData);
        const isAdmin = profileData.role === "admin";
        const [adminRows, submissionRows, withdrawalRows] = await Promise.all([
          getAdminProfiles(),
          getSubmissions({ userId: nextUser.id, isAdmin }),
          getWithdrawals({ userId: nextUser.id, isAdmin }),
        ]);
        setProfiles(isAdmin ? adminRows : []);
        setSubmissions(submissionRows);
        setWithdrawals(withdrawalRows);
      } catch (error) {
        setAuthError(error.message || "Account data failed to load.");
      }
    },
    [user]
  );

  useEffect(() => {
    if (!hasSupabaseConfig) return undefined;
    let active = true;
    getSession().then((session) => {
      if (session?.user && active) {
        setUser(session.user);
        loadAccount(session.user);
      }
    });
    const unsub = onAuthChange((nextUser) => {
      setUser(nextUser);
      if (nextUser) loadAccount(nextUser);
      else {
        setProfile(null);
        setProfiles([]);
        setSubmissions([]);
        setWithdrawals([]);
      }
    });
    return () => {
      active = false;
      unsub();
    };
  }, [loadAccount]);

  function openAuth(mode) {
    setAuthError("");
    setAuthMode(mode);
    setAuthOpen(true);
  }

  async function handleAuthSubmit(payload) {
    setAuthLoading(true);
    setAuthError("");
    try {
      if (!hasSupabaseConfig) {
        const localUser = { id: `local-${Date.now()}`, username: payload.username, phone: payload.phone, contactMethod: payload.contactMethod, verification_status: "not_submitted" };
        setUser(localUser);
        writeStoredValue("neonbetUser", localUser);
        await loadAccount(localUser);
        setAuthOpen(false);
        toast.success("Local account created");
        return;
      }
      if (payload.mode === "register") {
        const { data, error } = await signUp({ email: payload.email, password: payload.password, username: payload.username, phone: payload.phone, contactMethod: payload.contactMethod });
        if (error) throw error;
        if (!data.session) {
          setAuthError("Account created. Check your email if Supabase email confirmation is enabled, then log in.");
          return;
        }
        setUser(data.user);
        await loadAccount(data.user);
        setAuthOpen(false);
        toast.success("Account created");
        return;
      }
      const { data, error } = await signIn({ email: payload.email, password: payload.password });
      if (error) throw error;
      setUser(data.user);
      await loadAccount(data.user);
      setAuthOpen(false);
      toast.success("Signed in");
    } catch (error) {
      setAuthError(error.message || "Account action failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleResetPassword(email) {
    if (!hasSupabaseConfig || !email.includes("@")) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      await resetPassword(email, window.location.origin + window.location.pathname);
      setAuthError("Password reset email sent. Check your inbox.");
      toast.info("Reset email sent");
    } catch (error) {
      setAuthError(error.message || "Password reset failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    if (hasSupabaseConfig) await signOut();
    setUser(null);
    setProfile(null);
    setProfiles([]);
    setSubmissions([]);
    setWithdrawals([]);
    writeStoredValue("neonbetUser", null);
    toast.info("Signed out");
  }

  async function handleSubmitVerification(method, txHash) {
    if (!user) { openAuth("register"); return; }
    if (!validateTxHash(txHash)) { setAuthError("Enter a valid transaction hash before submitting."); return; }
    setVerificationSaving(true);
    try {
      const result = await submitSubmission({ userId: user.id, method, txHash });
      if (result.localSubmission) {
        setSubmissions([result.localSubmission, ...submissions]);
        setProfile((current) => ({ ...current, verification_status: "pending" }));
        toast.success("Verification submitted");
      } else {
        await loadAccount(user);
        toast.success("Verification submitted");
      }
    } catch (error) {
      const hasPending = error.code === "23505" || (error.message || "").includes("verification_submissions_user_pending_idx");
      setAuthError(
        hasPending
          ? "You already have a pending verification submission."
          : error.message || "Verification submission failed."
      );
    } finally {
      setVerificationSaving(false);
    }
  }

  async function handleSubmitWithdrawal(request) {
    if (!user) { openAuth("login"); return; }
    if (!validateWithdrawal(request)) { setAuthError("Enter a valid withdrawal amount and payout address."); return; }
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
    } catch (error) {
      setAuthError(error.message || "Withdrawal request failed.");
    } finally {
      setWithdrawalSaving(false);
    }
  }

  async function handleReviewSubmission(submission, status, adminNotes = submission.admin_notes || "") {
    if (!hasSupabaseConfig || profile?.role !== "admin") return;
    setAdminSaving(true);
    try {
      await reviewSubmission(submission.id, status, adminNotes);
      await loadAccount(user);
      setReviewModal(null);
      toast.success(`Submission ${status}`);
    } catch (error) {
      setAuthError(error.message || "Admin review failed.");
    } finally {
      setAdminSaving(false);
    }
  }

  async function handleReviewWithdrawal(withdrawal, status, adminNotes = withdrawal.admin_notes || "") {
    if (!hasSupabaseConfig || profile?.role !== "admin") return;
    setAdminSaving(true);
    try {
      await reviewWithdrawal(withdrawal.id, status, adminNotes);
      await loadAccount(user);
      setReviewModal(null);
      toast.success(`Withdrawal ${status}`);
    } catch (error) {
      setAuthError(error.message || "Withdrawal review failed.");
    } finally {
      setAdminSaving(false);
    }
  }

  async function handleUpdateProfile(userProfile, updates) {
    if (!hasSupabaseConfig || profile?.role !== "admin") return;
    setAdminSaving(true);
    try {
      await updateProfileAdmin(userProfile.id, updates);
      await loadAccount(user);
      setProfileModal(null);
      toast.success("Profile updated");
    } catch (error) {
      setAuthError(error.message || "Profile update failed.");
    } finally {
      setAdminSaving(false);
    }
  }

  function handleOpenGame(game) {
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
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.15),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.14),transparent_35%)]" />
      <Sidebar open={open} setOpen={setOpen} />
      <Header setOpen={setOpen} balance={balance} user={user} onOpenAuth={openAuth} onLogout={handleLogout} />

      <main className="relative space-y-8 px-4 py-8 md:px-8 lg:ml-72">
        <Hero onClaim={() => scrollToSection("verification")} onOpenGame={setActiveArcadeGame} />

        {features.account && (
          <AccountStatusPanel user={user} profile={profile} latestSubmission={latestSubmission} />
        )}

        <FeaturedGames onPlay={handleOpenGame} favorites={favorites} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />

        <ArcadeGamesSection onPlay={setActiveArcadeGame} />

        <SlotProviderLibrary
          onPlay={handleOpenGame}
          favorites={favorites}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          recentGames={recentGames}
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
            submissions={submissions}
            withdrawals={withdrawals}
            onReview={(item, status) => setReviewModal({ item, status, type: "verification" })}
            onReviewWithdrawal={(item, status) => setReviewModal({ item, status, type: "withdrawal" })}
            onUpdateProfile={setProfileModal}
            adminSaving={adminSaving}
          />
        )}

        {features.promotions && <PromotionsSection />}

        <VIPSection />

        <TermsSection onOpenPolicy={setPolicyPage} />

        <Footer onOpenPolicy={setPolicyPage} />
      </main>

      <MobileNav onOpenAuth={openAuth} />

      {policyPage && (
        <Modal title={policyPage.title} eyebrow={policyPage.eyebrow} onClose={() => setPolicyPage(null)}>
          <PolicyModalContent page={policyPage} />
        </Modal>
      )}
      {reviewModal && (
        <AdminReviewModal
          item={reviewModal.item}
          type={reviewModal.type}
          status={reviewModal.status}
          onClose={() => setReviewModal(null)}
          onSubmit={reviewModal.type === "withdrawal" ? handleReviewWithdrawal : handleReviewSubmission}
          saving={adminSaving}
        />
      )}
      {profileModal && (
        <AdminProfileModal userProfile={profileModal} onClose={() => setProfileModal(null)} onSubmit={handleUpdateProfile} saving={adminSaving} />
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
      {activeGame && <SlotGameModal game={activeGame} balance={balance} setBalance={setBalance} onClose={() => setActiveGame(null)} />}
      {activeArcadeGame && <ArcadeGameModal game={activeArcadeGame} balance={balance} setBalance={setBalance} onClose={() => setActiveArcadeGame(null)} />}
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
          <div key={name} className="flex items-center gap-4 border-b border-white/10 py-4 last:border-none">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 font-black">#{i + 1}</div>
            <div className="flex-1 font-bold">{name}</div>
            <div className="font-black text-cyan-300">{(98000 - i * 13750).toLocaleString()} pts</div>
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-300/15 to-orange-500/10 p-6">
        <div className="flex items-center gap-2 font-black text-amber-200"><span>★</span> VIP Progress</div>
        <h2 className="mt-5 text-4xl font-black">Gold II</h2>
        <p className="mt-2 text-slate-300">Complete missions to unlock rewards and account perks.</p>
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
