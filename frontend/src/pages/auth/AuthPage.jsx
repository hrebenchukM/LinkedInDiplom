import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { useUiSettings } from "../../app/providers/AppProviders";
import { ENABLE_GUEST, USE_MOCK_AUTH } from "../../shared/config/features";
import { markPendingAiWelcome } from "../../shared/lib/aiWelcomeNotification";
import "./auth-legacy.css";

const SOCIAL_AUTH_KEY = "socialAuthAccounts";
const TIMUR_FACEBOOK_AVATAR = "/auth/assets/timur-yamchuk-avatar.png";
const ANDRII_GOOGLE_AVATAR = "/auth/assets/andrii-rotar-avatar.png";

function isEmail(value) {
  return /^\S+@\S+\.\S+$/.test(String(value || "").trim());
}

function readSocialAccounts() {
  try {
    const users = JSON.parse(window.localStorage.getItem(SOCIAL_AUTH_KEY) || "[]");
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function writeSocialAccounts(rows) {
  try {
    window.localStorage.setItem(SOCIAL_AUTH_KEY, JSON.stringify(rows));
  } catch {
    // ignore storage errors
  }
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getSocialProfileTemplate(provider) {
  if (provider === "google") {
    return {
      email: "andrii.rotar@gmail.com",
      userName: "andrii.rotar",
      firstName: "Andrii",
      lastName: "Rotar",
      avatarDataUrl: ANDRII_GOOGLE_AVATAR,
    };
  }
  return {
    email: "timur.yamchuk@facebook.com",
    userName: "timur.yamchuk",
    firstName: "Timur",
    lastName: "Yamchuk",
    avatarDataUrl: TIMUR_FACEBOOK_AVATAR,
  };
}

function GoogleIcon() {
  return (
    <svg className="social-btn__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.5-5.1 3.5-3.1 0-5.6-2.5-5.6-5.6S8.9 6.1 12 6.1c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.4 3.9 14.4 3 12 3 7.6 3 4 6.6 4 11s3.6 8 8 8c4.6 0 7.6-3.2 7.6-7.8 0-.5-.1-.9-.2-1.2H12z" />
      <path fill="#34A853" d="M5.3 14.1 4 15.5A8 8 0 0 0 12 19c2.4 0 4.5-.8 6-2.2l-3-2.2c-.8.5-1.8.9-3 .9-2.3 0-4.2-1.5-4.9-3.6z" />
      <path fill="#4A90E2" d="M7.1 8.9 5.3 7.1A7.96 7.96 0 0 0 4 11c0 1.3.3 2.5.9 3.6l2.2-1.7z" />
      <path fill="#FBBC05" d="M12 6.1c1.3 0 2.5.4 3.4 1.3l2.6-2.6C16.9 3.6 14.6 2.7 12 2.7 8.8 2.7 6 4.7 4.7 7.5l2.4 1.9C7.8 7.6 9.7 6.1 12 6.1z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="social-btn__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#1877F2" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.08 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.23 2.68.23v2.96h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.08 24 12.07z" />
    </svg>
  );
}

function SocialOverlay({ provider, phase, account, exiting, onExitDone, t }) {
  useEffect(() => {
    if (!exiting) return undefined;
    const timer = window.setTimeout(onExitDone, 360);
    return () => window.clearTimeout(timer);
  }, [exiting, onExitDone]);

  const phaseOrder = { connecting: 0, securing: 1, success: 2 };
  const activeIndex = phaseOrder[phase] ?? 0;
  const progress = phase === "success" ? 100 : phase === "securing" ? 62 : 28;

  return (
    <div className={`social-overlay social-overlay--${provider}${exiting ? " social-overlay--exit" : ""}`} role="dialog" aria-modal="true">
      <div className="social-overlay__backdrop" />
      <div className="social-overlay__card">
        <div className="social-overlay__glow" />
        <div className="social-overlay__stage">
          {phase === "success" ? (
            account?.avatarDataUrl ? (
              <img className="social-overlay__avatar" src={account.avatarDataUrl} width="72" height="72" alt="" />
            ) : (
              <div className="social-overlay__success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )
          ) : (
            <div className="social-overlay__icon-wrap">
              <span className="social-overlay__ring" />
              <span className="social-overlay__ring social-overlay__ring--delay" />
              <div className="social-overlay__icon-badge">{provider === "google" ? <GoogleIcon /> : <FacebookIcon />}</div>
            </div>
          )}

          <h2 className="social-overlay__title">
            {phase === "success"
              ? `${t("auth.social.welcome", "Welcome")}, ${[account?.firstName, account?.lastName].filter(Boolean).join(" ")}`
              : provider === "google"
                ? "Google"
                : "Facebook"}
          </h2>
          <p className="social-overlay__subtitle">
            {phase === "success"
              ? t("auth.social.redirecting", "Redirecting...")
              : phase === "securing"
                ? t("auth.social.securing", "Securing session...")
                : t("auth.social.connecting", "Connecting...")}
          </p>

          <div className="social-overlay__progress">
            <div className="social-overlay__progress-bar" style={{ width: `${progress}%` }} />
          </div>

          <div className="social-overlay__steps">
            {[t("auth.social.step.connect", "Connect"), t("auth.social.step.secure", "Secure"), t("auth.social.step.done", "Done")].map((step, index) => (
              <div
                key={step}
                className={[
                  "social-overlay__step",
                  index < activeIndex || phase === "success" ? "social-overlay__step--done" : "",
                  index === activeIndex && phase !== "success" ? "social-overlay__step--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="social-overlay__step-dot" />
                <span className="social-overlay__step-label">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthPage() {
  const { session, isReady, registerAndLogin, loginWithPassword, loginAsGuest, login } = useAuth();
  const { t } = useUiSettings();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("register");
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState({ type: "", text: "" });
  const [socialOverlay, setSocialOverlay] = useState(null);
  const [pendingRedirect, setPendingRedirect] = useState("");

  const [registerForm, setRegisterForm] = useState({
    email: "",
    userName: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (!isReady) return;
    if (session.isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isReady, session.isAuthenticated, navigate]);

  useEffect(() => {
    if (!socialOverlay) return undefined;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [socialOverlay]);

  const registerReady = useMemo(() => {
    return (
      registerForm.email.trim() &&
      registerForm.userName.trim() &&
      registerForm.firstName.trim() &&
      registerForm.lastName.trim() &&
      registerForm.password &&
      registerForm.confirmPassword
    );
  }, [registerForm]);

  const loginReady = useMemo(() => loginForm.email.trim() && loginForm.password, [loginForm]);

  async function onSocialAuth(provider) {
    setBanner({ type: "", text: "" });
    setLoading(true);
    setSocialOverlay({ provider, phase: "connecting", account: null, exiting: false });
    try {
      await wait(850);
      setSocialOverlay((prev) => (prev ? { ...prev, phase: "securing" } : prev));
      await wait(700);
      const template = getSocialProfileTemplate(provider);
      const rows = readSocialAccounts();
      let account = rows.find((row) => row.provider === provider);
      if (!account) {
        account = { id: Date.now(), provider, ...template };
        rows.push(account);
      } else {
        account = { ...account, ...template, provider };
        const index = rows.findIndex((row) => row.provider === provider);
        if (index >= 0) rows[index] = account;
      }
      writeSocialAccounts(rows);
      login({
        ...account,
        authProvider: provider,
        accessToken: `mock-access-${account.id}`,
        refreshToken: `mock-refresh-${account.id}`,
      });
      markPendingAiWelcome();
      setSocialOverlay({ provider, phase: "success", account, exiting: false });
      await wait(1100);
      setSocialOverlay((prev) => (prev ? { ...prev, exiting: true } : prev));
      setPendingRedirect("/home");
    } catch {
      setLoading(false);
      setSocialOverlay(null);
      setBanner({ type: "error", text: t("auth.error.social", "Social sign-in failed.") });
    }
  }

  function handleOverlayExitComplete() {
    if (pendingRedirect) {
      navigate(pendingRedirect);
      return;
    }
    setSocialOverlay(null);
    setLoading(false);
  }

  async function onRegisterSubmit(event) {
    event.preventDefault();
    setBanner({ type: "", text: "" });
    if (!isEmail(registerForm.email)) {
      setBanner({ type: "error", text: t("auth.error.email", "Enter a valid email.") });
      return;
    }
    if (registerForm.password.length < 6) {
      setBanner({ type: "error", text: t("auth.error.passwordMin", "Password must be at least 6 characters.") });
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setBanner({ type: "error", text: t("auth.error.passwordMatch", "Passwords do not match.") });
      return;
    }

    setLoading(true);
    try {
      const email = registerForm.email.trim();
      const password = registerForm.password;
      const profileFallback = {
        email,
        userName: registerForm.userName.trim(),
        firstName: registerForm.firstName.trim(),
        lastName: registerForm.lastName.trim(),
      };

      const result = await registerAndLogin({ email, password, profileFallback });
      if (!result.ok) {
        setBanner({ type: "error", text: result.error });
        return;
      }

      markPendingAiWelcome();
      navigate(USE_MOCK_AUTH ? "/home" : "/profile");
    } catch {
      setBanner({ type: "error", text: t("auth.error.server", "Server error.") });
    } finally {
      setLoading(false);
    }
  }

  async function onLoginSubmit(event) {
    event.preventDefault();
    setBanner({ type: "", text: "" });
    if (!isEmail(loginForm.email)) {
      setBanner({ type: "error", text: t("auth.error.email", "Enter a valid email.") });
      return;
    }
    setLoading(true);
    try {
      const result = await loginWithPassword({
        email: loginForm.email.trim(),
        password: loginForm.password,
        profileFallback: {
          email: loginForm.email.trim(),
          userName: loginForm.email.split("@")[0],
        },
      });
      if (!result.ok) {
        setBanner({ type: "error", text: result.error });
        return;
      }
      navigate("/home");
    } catch {
      setBanner({ type: "error", text: t("auth.error.server", "Server error.") });
    } finally {
      setLoading(false);
    }
  }

  function onContinueAsGuest() {
    loginAsGuest();
    navigate("/home");
  }

  if (!isReady) {
    return (
      <main className="page auth-page-legacy">
        <div className="app-bootstrap" role="status">
          {t("common.loading", "Loading…")}
        </div>
      </main>
    );
  }

  return (
    <main className="page auth-page-legacy">
      {socialOverlay ? (
        <SocialOverlay
          provider={socialOverlay.provider}
          phase={socialOverlay.phase}
          account={socialOverlay.account}
          exiting={socialOverlay.exiting}
          onExitDone={handleOverlayExitComplete}
          t={t}
        />
      ) : null}
      <div className="bg-orb bg-orb-a" aria-hidden="true" />
      <div className="bg-orb bg-orb-b" aria-hidden="true" />

      <section className="auth-shell">
        <aside className="promo">
          <div className="logo-mark">in</div>
          <h1>{t("auth.title", "LinkUp Auth")}</h1>
          <p>{t("auth.subtitle", "Sign in with your API account (email + password).")}</p>
          <div className="flow-points">
            <span className={activeTab === "register" ? "on" : ""}>{t("auth.step.register", "1. Registration")}</span>
            <span className={activeTab === "login" ? "on" : ""}>{t("auth.step.login", "2. Login")}</span>
            <span>{t("auth.step.done", "3. Done")}</span>
          </div>
        </aside>

        <div className="auth-right">
          <article className="auth-card legacy-auth-card">
            <div className="tabs">
              <button type="button" className={activeTab === "register" ? "tab active" : "tab"} onClick={() => setActiveTab("register")}>
                {t("auth.tab.register", "Registration")}
              </button>
              <button type="button" className={activeTab === "login" ? "tab active" : "tab"} onClick={() => setActiveTab("login")}>
                {t("auth.tab.login", "Login")}
              </button>
            </div>

            {banner.text ? <div className={banner.type === "error" ? "banner error" : "banner success"}>{banner.text}</div> : null}

            {activeTab === "register" ? (
              <form className="form" onSubmit={onRegisterSubmit}>
                <label>
                  {t("auth.field.email", "Email")}
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  {t("auth.field.username", "Username")}
                  <input
                    name="userName"
                    type="text"
                    placeholder="username"
                    value={registerForm.userName}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, userName: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  {t("auth.field.firstName", "First name")}
                  <input
                    name="firstName"
                    type="text"
                    placeholder={t("auth.placeholder.firstName", "First name")}
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  {t("auth.field.lastName", "Last name")}
                  <input
                    name="lastName"
                    type="text"
                    placeholder={t("auth.placeholder.lastName", "Last name")}
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  {t("auth.field.password", "Password")}
                  <input
                    name="password"
                    type="password"
                    placeholder={t("auth.placeholder.password", "minimum 6 symbols")}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  {t("auth.field.confirmPassword", "Confirm password")}
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder={t("auth.placeholder.confirmPassword", "repeat password")}
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </label>
                <button className="primary" disabled={loading || !registerReady} type="submit">
                  {loading ? t("auth.btn.creating", "Creating...") : t("auth.btn.create", "Create account")}
                </button>
              </form>
            ) : (
              <form className="form" onSubmit={onLoginSubmit}>
                <label>
                  {t("auth.field.email", "Email")}
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  {t("auth.field.password", "Password")}
                  <input
                    name="password"
                    type="password"
                    placeholder={t("auth.field.password", "Password")}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </label>
                <button className="primary" disabled={loading || !loginReady} type="submit">
                  {loading ? t("auth.btn.loggingIn", "Signing in...") : t("auth.btn.login", "Sign in")}
                </button>
              </form>
            )}
          </article>

          <div className="social-auth auth-social-block">
            <div className="social-auth__divider">
              <span>{t("auth.or", "or")}</span>
            </div>
            {USE_MOCK_AUTH ? (
              <p className="auth-demo-note">{t("auth.demo.only", "Demo only (mock auth, no backend)")}</p>
            ) : null}
            <div className="social-auth__buttons">
              <button type="button" className="social-btn social-btn--google" disabled={loading} onClick={() => onSocialAuth("google")}>
                <GoogleIcon />
                {t("auth.social.google", "Continue with Google")}
              </button>
              <button type="button" className="social-btn social-btn--facebook" disabled={loading} onClick={() => onSocialAuth("facebook")}>
                <FacebookIcon />
                {t("auth.social.facebook", "Continue with Facebook")}
              </button>
              {ENABLE_GUEST ? (
                <button type="button" className="secondary-action" onClick={onContinueAsGuest} disabled={loading}>
                  {t("auth.btn.guest", "Continue as guest")}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
