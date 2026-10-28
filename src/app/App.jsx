import React, { lazy, Suspense, useState } from "react";
import { ToastProvider, useToast } from "../components/feedback/ToastProvider";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import MobileNav from "../components/layout/MobileNav";
import ReferralPanel from "../features/referrals/ReferralPanel";
import Footer from "../components/layout/Footer";
import CustomerCare from "../features/support/CustomerCare";
import Modal from "../components/ui/Modal";

import Hero from "../features/casino/Hero";
import FeaturedGames from "../features/casino/FeaturedGames";
import ArcadeGamesSection from "../features/casino/ArcadeGamesSection";
import SlotProviderLibrary from "../features/casino/SlotProviderLibrary";
const GameLaunchModal = lazyPanel(() => import("../features/casino/GameLaunchModal"));
const SlotGameModal = lazyPanel(() => import("../features/casino/SlotGameModal"));
const ArcadeGameModal = lazyPanel(() => import("../features/casino/ArcadeGameModal"));

const AuthModal = lazyPanel(() => import("../features/auth/AuthModal"));
import AccountStatusPanel from "../features/account/AccountStatusPanel";
import VerificationPanel from "../features/verification/VerificationPanel";
import WithdrawalRequestPanel from "../features/transactions/WithdrawalRequestPanel";
const AdminDashboard = lazyPanel(() => import("../features/admin/AdminDashboard"));
const AdminReviewModal = lazyPanel(() => import("../features/admin/AdminReviewModal"));
const AdminProfileModal = lazyPanel(() => import("../features/admin/AdminProfileModal"));
import { PromotionsSection, TermsSection } from "../features/promotions";

import { hasSupabaseConfig, signIn, signUp, signOut, resetPassword } from "../services/auth.service";
import { initialAuthRedirect } from "../services/supabaseClient";
import { submitSubmission, reviewSubmission, validateTxHash } from "../services/verification.service";
import { submitWithdrawal, reviewWithdrawal, validateWithdrawal } from "../services/transactions.service";
import { updateProfileAdmin } from "../services/admin.service";

import { useFavorites, useRecentGames } from "../hooks/useGameHistory";
import { writeStoredValue } from "../lib/storage";
import { features } from "../config/features";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import { CONFIG_ERROR } from "../config/appMode";
import { useDemoWallet } from "../hooks/useDemoWallet";
import { useAccount } from "../hooks/useAccount";
import { scrollToSection } from "../lib/navigation";

const PolicyModalContent = lazyPanel(() => import("../features/promotions/PolicyModalContent"));

function lazyPanel(loader) {
  const Component = lazy(loader);
  return function FeaturePanel(props) {
    return (
      <ErrorBoundary
        fallback={
          <div role="alert" className="surface fixed bottom-24 right-4 z-50 max-w-xs p-4">
            <p>
              This panel could not load. Reload the lobby, then open the panel again. Your current practice
              session will restart.
            </p>
            <button type="button" className="filter-chip mt-3" onClick={() => window.location.reload()}>
              Reload lobby
            </button>
            <button
              type="button"
              className="filter-chip mt-3"
              onClick={() => window.dispatchEvent(new window.Event("luckyOrbit:open-support"))}
            >
              Report loading issue
            </button>
          </div>
        }
      >
        <Suspense
          fallback={
            <div role="status" className="fixed bottom-24 right-4 z-50 surface p-4">
              Loading panel…
            </div>
          }
        >
          <Component {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

function AppContent() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [activeGame, setActiveGame] = useState(null);
  const [activeArcadeGame, setActiveArcadeGame] = useState(null);
  const [launchGame, setLaunchGame] = useState(null);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { recentGames, recordGame } = useRecentGames();

  const [authMode, setAuthMode] = useState("login");
  const [authOpen, setAuthOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLinkError, setAuthLinkError] = useState(initialAuthRedirect.error);
  const [verificationSaving, setVerificationSaving] = useState(false);
  const [withdrawalSaving, setWithdrawalSaving] = useState(false);
  const [adminSaving, setAdminSaving] = useState(false);
  const [policyPage, setPolicyPage] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [profileModal, setProfileModal] = useState(null);

  const {
    user,
    setUser,
    profile,
    profiles,
    submissions,
    withdrawals,
    latestSubmission,
    latestWithdrawal,
    adminPage,
    loadAccount,
    accountError,
    accountLoading,
    recovery,
    setRecovery,
  } = useAccount();
  const wallet = useDemoWallet(user?.id);
  const { balance } = wallet;
  const [verificationError, setVerificationError] = useState("");
  const [withdrawalError, setWithdrawalError] = useState("");

  function openAuth(mode) {
    setAuthLinkError("");
    setAuthError("");
    setAuthMode(mode);
    setAuthOpen(true);
  }

  async function handleAuthSubmit(payload) {
    setAuthLoading(true);
    setAuthError("");
    try {
      if (!hasSupabaseConfig) {
        const localUser = {
          id: `local-${crypto.randomUUID()}`,
          username: payload.username,
          phone: payload.phone,
          contactMethod: payload.contactMethod,
          verification_status: "not_submitted",
        };
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
        setUser(data.user);
        await loadAccount(data.user);
        setAuthOpen(false);
        toast.success("Account created");
        return;
      }
      const data = await signIn({ email: payload.email, password: payload.password });
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
      setAuthError(
        "If an account uses that email, a password reset link will arrive shortly. Check your inbox and spam folder.",
      );
      toast.info("Password reset requested");
    } catch (error) {
      setAuthError(error.message || "Password reset failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
      setUser(null);
      writeStoredValue("neonbetUser", null);
      toast.info("Signed out");
    } catch (error) {
      toast.error(error.message || "Sign out failed. Try again.");
    }
  }

  async function handleSubmitVerification(method, txHash) {
    if (!user) {
      openAuth("register");
      return;
    }
    if (!validateTxHash(txHash, method)) {
      setVerificationError("Enter a valid transaction hash before submitting.");
      return;
    }
    setVerificationError("");
    setVerificationSaving(true);
    try {
      await submitSubmission({ userId: user.id, method, txHash });
      await loadAccount(user);
      toast.success("Verification submitted");
      return true;
    } catch (error) {
      const hasPending =
        error.code === "23505" || (error.message || "").includes("verification_submissions_user_pending_idx");
      setVerificationError(
        hasPending
          ? "You already have a pending verification submission."
          : error.message || "Verification submission failed.",
      );
    } finally {
      setVerificationSaving(false);
    }
  }

  async function handleSubmitWithdrawal(request) {
    if (!user) {
      openAuth("login");
      return;
    }
    if (!validateWithdrawal(request)) {
      setWithdrawalError("Enter a valid withdrawal amount and payout address.");
      return;
    }
    setWithdrawalError("");
    setWithdrawalSaving(true);
    try {
      await submitWithdrawal({ userId: user.id, request });
      await loadAccount(user);
      toast.success("Withdrawal requested");
      return true;
    } catch (error) {
      setWithdrawalError(error.message || "Withdrawal request failed.");
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
      toast.error(error.message || "Admin review failed.");
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
      toast.error(error.message || "Withdrawal review failed.");
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
      toast.error(error.message || "Profile update failed.");
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
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Sidebar open={open} setOpen={setOpen} user={user} />
      <Header
        setOpen={setOpen}
        balance={balance}
        user={user ? { ...user, username: profile?.username || user.username } : null}
        onOpenAuth={openAuth}
        onLogout={handleLogout}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative mx-auto max-w-[1680px] space-y-10 px-4 pb-28 pt-6 md:px-8 lg:ml-64 lg:pb-12"
      >
        <Hero onClaim={() => scrollToSection("featured-games")} onOpenGame={setActiveArcadeGame} />

        {accountLoading && (
          <p role="status" className="surface p-4">
            Loading account…
          </p>
        )}
        {accountError && (
          <div role="alert" className="surface p-4 text-rose-200">
            {accountError}{" "}
            <button type="button" onClick={() => loadAccount(user)}>
              Retry
            </button>
          </div>
        )}
        {authLinkError && !user && (
          <div role="alert" className="surface p-4 text-amber-200">
            <p>{authLinkError}</p>
            <button type="button" className="secondary-button mt-3" onClick={() => openAuth("login")}>
              Request another reset email
            </button>
          </div>
        )}
        {features.account && (
          <AccountStatusPanel
            user={user}
            profile={profile}
            latestSubmission={latestSubmission}
            demoWallet={wallet}
          />
        )}

        <FeaturedGames
          onPlay={handleOpenGame}
          favorites={favorites}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />

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
            error={verificationError}
            onNeedAuth={() => openAuth("register")}
          />
        )}

        {features.withdrawals && user && (
          <WithdrawalRequestPanel
            user={user}
            profile={profile}
            demoWallet={wallet}
            latestWithdrawal={latestWithdrawal}
            withdrawalSaving={withdrawalSaving}
            error={withdrawalError}
            onSubmitWithdrawal={handleSubmitWithdrawal}
          />
        )}

        {features.admin && profile?.role === "admin" && (
          <AdminDashboard
            page={adminPage}
            onPageChange={(page) => loadAccount(user, page)}
            profile={profile}
            profiles={profiles}
            submissions={submissions}
            withdrawals={withdrawals}
            onReview={(item, status) => setReviewModal({ item, status, type: "verification" })}
            onReviewWithdrawal={(item, status) => setReviewModal({ item, status, type: "withdrawal" })}
            onUpdateProfile={setProfileModal}
            adminSaving={adminSaving || accountLoading}
          />
        )}

        {features.promotions && <PromotionsSection onClaimDaily={wallet.claimDaily} />}

        <VIPSection />

        <TermsSection onOpenPolicy={setPolicyPage} />

        <ReferralPanel
          key={user?.id || "guest"}
          user={user}
          onCreditsVerified={wallet.applyReferralCredits}
        />
        <Footer onOpenPolicy={setPolicyPage} />
      </main>

      <MobileNav user={user} onOpenAuth={openAuth} />
      <CustomerCare user={user} />

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
        <AdminProfileModal
          userProfile={profileModal}
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
          onPrepare={() => {
            void import("../features/casino/SlotGameModal").catch(() => {});
          }}
        />
      )}
      {activeGame && <SlotGameModal game={activeGame} wallet={wallet} onClose={() => setActiveGame(null)} />}
      {activeArcadeGame && (
        <ArcadeGameModal game={activeArcadeGame} wallet={wallet} onClose={() => setActiveArcadeGame(null)} />
      )}
      {(authOpen || recovery) && (
        <AuthModal
          key={recovery ? `recovery:${user?.id}` : "auth"}
          mode={recovery ? "recovery" : authMode}
          setMode={setAuthMode}
          onClose={() => {
            setAuthOpen(false);
            setRecovery(false);
          }}
          onSubmit={handleAuthSubmit}
          onResetPassword={handleResetPassword}
          onRequestReset={() => {
            setRecovery(false);
            openAuth("login");
          }}
          onPasswordUpdated={() => {
            setRecovery(false);
            setAuthOpen(false);
            toast.success("Password updated");
          }}
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
        <h2 className="mb-5 text-2xl font-semibold">Practice leaderboard</h2>
        {["LuckyDion", "NeonWolf", "KiwiJackpot", "SpinQueen"].map((name, i) => (
          <div key={name} className="flex items-center gap-4 border-b border-white/10 py-4 last:border-none">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 font-semibold">
              #{i + 1}
            </div>
            <div className="flex-1 font-bold">{name}</div>
            <div className="font-semibold text-cyan-300">{(98000 - i * 13750).toLocaleString()} pts</div>
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-300/15 to-orange-500/10 p-6">
        <div className="flex items-center gap-2 font-semibold text-amber-200">
          <span>★</span> VIP Progress
        </div>
        <h2 className="mt-5 text-4xl font-semibold">Gold II</h2>
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
  if (CONFIG_ERROR)
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-bold">Account service unavailable</h1>
        <p role="alert">{CONFIG_ERROR}</p>
      </main>
    );
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
