const API_BASE_URL = "https://localhost:7011";
const { useEffect, useMemo, useState } = React;
const USE_MOCK_AUTH = false;
const MOCK_USERS_KEY = "mockAuthUsers";
const SOCIAL_AUTH_KEY = "socialAuthAccounts";
const HOME_PAGE_URL = "../pages/home/index.html";
const PROFILE_PAGE_URL = "../pages/profile/index.html?v=20260516-2";
const TIMUR_FACEBOOK_AVATAR = "/auth/assets/timur-yamchuk-avatar.png";
const ANDRII_GOOGLE_AVATAR = "/auth/assets/andrii-rotar-avatar.png";

function isUsableAvatarUrl(raw) {
  const value = String(raw || "").trim();
  if (!value || value.includes('"') || value.includes("'")) return false;
  return value.startsWith("data:image/") || /^https?:\/\//i.test(value) || value.startsWith("/");
}

function readUiLang() {
  return typeof window.getUiLang === "function" ? window.getUiLang() : "ru";
}

function t(key, lang) {
  const l = lang || readUiLang();
  if (typeof window.uiTForLang === "function") return window.uiTForLang(key, l);
  return typeof window.uiT === "function" ? window.uiT(key) : key;
}

function tmpl(key, vars, lang) {
  let out = t(key, lang);
  if (!vars) return out;
  Object.keys(vars).forEach((k) => {
    out = out.split(`{{${k}}}`).join(String(vars[k]));
  });
  return out;
}

function readApiError(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.message === "string") return data.message;
  if (typeof data.error === "string") return data.error;
  if (Array.isArray(data.errors) && data.errors.length > 0) return String(data.errors[0]);
  return fallback;
}

function isEmail(value) {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

function readStoredAvatarUrl() {
  try {
    const account = JSON.parse(localStorage.getItem("registeredAccount") || "{}");
    const session = JSON.parse(localStorage.getItem("authSession") || "{}");
    const raw = String(account.avatarDataUrl || session.avatarDataUrl || "").trim();
    if (isUsableAvatarUrl(raw)) return raw;
  } catch {
    /* ignore */
  }
  return "";
}

function readMockUsers() {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    const users = raw ? JSON.parse(raw) : [];
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function writeMockUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function readSocialAccounts() {
  try {
    const raw = localStorage.getItem(SOCIAL_AUTH_KEY);
    const rows = raw ? JSON.parse(raw) : [];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function writeSocialAccounts(rows) {
  localStorage.setItem(SOCIAL_AUTH_KEY, JSON.stringify(rows));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function buildSocialAccount(provider) {
  return {
    id: Date.now(),
    provider,
    ...getSocialProfileTemplate(provider),
  };
}

function persistAuthSession(account, extras) {
  localStorage.setItem(
    "registeredAccount",
    JSON.stringify({
      id: account.id,
      email: account.email,
      userName: account.userName,
      firstName: account.firstName,
      lastName: account.lastName,
      avatarDataUrl: account.avatarDataUrl || "",
      authProvider: account.provider || extras?.authProvider || null,
    }),
  );
  localStorage.setItem(
    "authSession",
    JSON.stringify({
      email: account.email,
      userName: account.userName,
      firstName: account.firstName,
      lastName: account.lastName,
      avatarDataUrl: account.avatarDataUrl || "",
      authProvider: account.provider || extras?.authProvider || null,
      accessToken: extras?.accessToken ?? null,
      refreshToken: extras?.refreshToken ?? null,
    }),
  );
}

async function postMockAuth(path, payload) {
  await delay(300);
  const users = readMockUsers();

  if (path === "/api/auth/register") {
    const email = String(payload?.email ?? "").trim().toLowerCase();
    const userName = String(payload?.userName ?? "").trim();
    const firstName = String(payload?.firstName ?? "").trim();
    const lastName = String(payload?.lastName ?? "").trim();
    const password = String(payload?.password ?? "");

    if (!email || !userName || !firstName || !lastName || !password) {
      return { ok: false, status: 400, data: { message: t("reg.errFillAll") } };
    }
    if (users.some((user) => user.email === email)) {
      return { ok: false, status: 400, data: { message: t("reg.errUserExists") } };
    }

    users.push({ id: Date.now(), email, userName, firstName, lastName, password });
    writeMockUsers(users);
    return { ok: true, status: 200, data: { success: true } };
  }

  if (path === "/api/auth/login") {
    const email = String(payload?.email ?? "").trim().toLowerCase();
    const password = String(payload?.password ?? "");
    const user = users.find((item) => item.email === email && item.password === password);
    if (!user) {
      return { ok: false, status: 401, data: { message: t("reg.errLogin") } };
    }

    return {
      ok: true,
      status: 200,
      data: {
        success: true,
        data: {
          account: { email: user.email, userName: user.userName },
          tokens: {
            accessToken: `mock-access-${user.id}`,
            refreshToken: `mock-refresh-${user.id}`,
          },
        },
      },
    };
  }

  return { ok: false, status: 404, data: { message: "Mock endpoint not found." } };
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
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.08 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.23 2.68.23v2.96h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.08 24 12.07z"
      />
    </svg>
  );
}

function SocialAuthOverlay({ overlay, uiLang, onExitComplete }) {
  const { provider, phase, account, exiting } = overlay;
  const providerLabel = t(provider === "google" ? "reg.providerGoogle" : "reg.providerFacebook", uiLang);
  const displayName = account ? [account.firstName, account.lastName].filter(Boolean).join(" ") : "";

  const steps = [
    { id: "connecting", label: t("reg.socialLabelConnect", uiLang), full: tmpl("reg.socialStepConnect", { provider: providerLabel }, uiLang) },
    { id: "securing", label: t("reg.socialLabelSecure", uiLang), full: t("reg.socialStepSecure", uiLang) },
    { id: "success", label: t("reg.socialLabelDone", uiLang), full: t("reg.socialStepDone", uiLang) },
  ];

  const phaseOrder = { connecting: 0, securing: 1, success: 2 };
  const activeIndex = phaseOrder[phase] ?? 0;
  const progress = phase === "success" ? 100 : phase === "securing" ? 62 : 28;

  const title =
    phase === "success"
      ? tmpl("reg.socialWelcome", { name: displayName }, uiLang)
      : steps[activeIndex]?.full || providerLabel;

  const subtitle =
    phase === "success"
      ? t("reg.socialRedirect", uiLang)
      : providerLabel;

  useEffect(() => {
    if (!exiting) return undefined;
    const timer = window.setTimeout(onExitComplete, 380);
    return () => window.clearTimeout(timer);
  }, [exiting, onExitComplete]);

  const particles = phase === "success"
    ? Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        const dist = 50 + (i % 3) * 18;
        return {
          id: i,
          left: `${50 + Math.cos(angle) * 12}%`,
          top: `${38 + Math.sin(angle) * 8}%`,
          color: provider === "google"
            ? ["#EA4335", "#FBBC05", "#34A853", "#4285F4"][i % 4]
            : ["#1877F2", "#42A5F5", "#1565C0"][i % 3],
          delay: `${i * 0.04}s`,
          tx: `${Math.cos(angle) * dist}px`,
          ty: `${Math.sin(angle) * dist - 20}px`,
        };
      })
    : [];

  return (
    <div
      className={`social-overlay social-overlay--${provider}${exiting ? " social-overlay--exit" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-label={title}
    >
      <div className="social-overlay__backdrop" aria-hidden="true" />
      <div className="social-overlay__card">
        <div className="social-overlay__glow" aria-hidden="true" />
        {particles.length > 0 ? (
          <div className="social-overlay__particles" aria-hidden="true">
            {particles.map((p) => (
              <span
                key={p.id}
                className="social-overlay__particle"
                style={{
                  left: p.left,
                  top: p.top,
                  background: p.color,
                  animationDelay: p.delay,
                  "--tx": p.tx,
                  "--ty": p.ty,
                }}
              />
            ))}
          </div>
        ) : null}
        <div className="social-overlay__stage">
          {phase === "success" ? (
            <>
              {account?.avatarDataUrl ? (
                <img className="social-overlay__avatar" src={account.avatarDataUrl} width="72" height="72" alt="" />
              ) : (
                <div className="social-overlay__success-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </>
          ) : (
            <div className="social-overlay__icon-wrap">
              <span className="social-overlay__ring" aria-hidden="true" />
              <span className="social-overlay__ring social-overlay__ring--delay" aria-hidden="true" />
              <div className="social-overlay__icon-badge">
                {provider === "google" ? <GoogleIcon /> : <FacebookIcon />}
              </div>
            </div>
          )}

          <h2 className="social-overlay__title">{title}</h2>
          <p className="social-overlay__subtitle">{subtitle}</p>

          <div className="social-overlay__progress" aria-hidden="true">
            <div className="social-overlay__progress-bar" style={{ width: `${progress}%` }} />
          </div>

          <div className="social-overlay__steps">
            {steps.map((step, index) => {
              const done = index < activeIndex || phase === "success";
              const active = index === activeIndex && phase !== "success";
              const classes = [
                "social-overlay__step",
                done ? "social-overlay__step--done" : "",
                active ? "social-overlay__step--active" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <div key={step.id} className={classes}>
                  <span className="social-overlay__step-dot" />
                  <span className="social-overlay__step-label">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("register");
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState({ type: "", text: "" });
  const [uiLang, setUiLang] = useState(readUiLang);
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
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

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

  const loginReady = useMemo(() => {
    return loginForm.email.trim() && loginForm.password;
  }, [loginForm]);
  const headerAvatar = readStoredAvatarUrl();

  useEffect(() => {
    const onLang = (event) => {
      const next = event?.detail?.lang;
      if (next === "en" || next === "uk" || next === "ru") setUiLang(next);
    };
    window.addEventListener("uilangchange", onLang);
    document.addEventListener("uilangchange", onLang);
    return () => {
      window.removeEventListener("uilangchange", onLang);
      document.removeEventListener("uilangchange", onLang);
    };
  }, []);

  useEffect(() => {
    if (typeof window.syncThemeToggleI18n === "function") window.syncThemeToggleI18n();
  }, [uiLang]);

  useEffect(() => {
    if (!socialOverlay) {
      document.body.style.overflow = "";
      return undefined;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [socialOverlay]);

  const setRegisterField = (event) => {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const setLoginField = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const postJson = async (path, payload) => {
    if (USE_MOCK_AUTH) {
      return postMockAuth(path, payload);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  };

  const onSocialAuth = async (provider) => {
    setBanner({ type: "", text: "" });
    setLoading(true);
    setSocialOverlay({ provider, phase: "connecting", account: null, exiting: false });

    const redirectTo = activeTab === "register" ? PROFILE_PAGE_URL : HOME_PAGE_URL;

    try {
      await delay(900);
      setSocialOverlay((prev) => (prev ? { ...prev, phase: "securing" } : prev));

      await delay(750);
      const accounts = readSocialAccounts();
      const template = getSocialProfileTemplate(provider);
      let account = accounts.find((row) => row.provider === provider);
      if (!account) {
        account = buildSocialAccount(provider);
        accounts.push(account);
      } else {
        account = { ...account, ...template, provider };
        const index = accounts.findIndex((row) => row.provider === provider);
        if (index >= 0) accounts[index] = account;
      }
      writeSocialAccounts(accounts);

      persistAuthSession(account, {
        authProvider: provider,
        accessToken: `social-${provider}-${account.id}`,
        refreshToken: null,
      });

      setSocialOverlay({ provider, phase: "success", account, exiting: false });
      await delay(1100);

      setSocialOverlay((prev) => (prev ? { ...prev, exiting: true } : prev));
      setPendingRedirect(redirectTo);
    } catch {
      setSocialOverlay(null);
      setBanner({ type: "error", text: t("reg.socialError", uiLang) });
      setLoading(false);
    }
  };

  const handleOverlayExitComplete = () => {
    if (pendingRedirect) {
      window.location.href = pendingRedirect;
      return;
    }
    setSocialOverlay(null);
    setLoading(false);
  };

  const onRegisterSubmit = async (event) => {
    event.preventDefault();
    setBanner({ type: "", text: "" });

    if (!isEmail(registerForm.email)) {
      setBanner({ type: "error", text: t("reg.errEmail", uiLang) });
      return;
    }
    if (registerForm.password.length < 6) {
      setBanner({ type: "error", text: t("reg.errPassShort", uiLang) });
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setBanner({ type: "error", text: t("reg.errPassMismatch", uiLang) });
      return;
    }

    setLoading(true);
    try {
      const response = await postJson("/api/auth/register", {
        email: registerForm.email.trim(),
        userName: registerForm.userName.trim(),
        firstName: registerForm.firstName.trim(),
        lastName: registerForm.lastName.trim(),
        password: registerForm.password,
      });

      if (!response.ok) {
        setBanner({
          type: "error",
          text: readApiError(response.data, t("reg.errRegister", uiLang)),
        });
        return;
      }
      const accountDraft = {
        id: Date.now(),
        email: registerForm.email.trim(),
        userName: registerForm.userName.trim(),
        firstName: registerForm.firstName.trim(),
        lastName: registerForm.lastName.trim(),
      };
      persistAuthSession(accountDraft, {
        accessToken: response.data?.token?.accessToken ?? null,
        refreshToken: response.data?.token?.refreshToken ?? null,
      });
      window.location.href = PROFILE_PAGE_URL;
    } catch {
      setBanner({ type: "error", text: t("reg.errServer", uiLang) });
    } finally {
      setLoading(false);
    }
  };

  const onLoginSubmit = async (event) => {
    event.preventDefault();
    setBanner({ type: "", text: "" });

    if (!isEmail(loginForm.email)) {
      setBanner({ type: "error", text: t("reg.errEmail", uiLang) });
      return;
    }

    setLoading(true);
    try {
      const response = await postJson("/api/auth/login", {
        email: loginForm.email.trim(),
        password: loginForm.password,
      });

      if (!response.ok) {
        setBanner({
          type: "error",
          text: readApiError(response.data, t("reg.errLogin", uiLang)),
        });
        return;
      }
      const payload = {
        email: loginForm.email.trim(),
        accessToken: response.data?.token?.accessToken ?? null,
        refreshToken: response.data?.token?.refreshToken ?? null,
      };
      localStorage.setItem("authSession", JSON.stringify(payload));
      window.location.href = HOME_PAGE_URL;
    } catch {
      setBanner({ type: "error", text: t("reg.errServer", uiLang) });
    } finally {
      setLoading(false);
    }
  };

  const onContinueAsGuest = () => {
    localStorage.setItem(
      "authSession",
      JSON.stringify({ guest: true, email: "guest@linkup.local", userName: "guest" }),
    );
    window.location.replace(`${HOME_PAGE_URL}?guest=1&t=${Date.now()}`);
  };

  const socialAuthBlock = (
    <div className="social-auth">
      <div className="social-auth__divider">
        <span>{t("reg.socialOr", uiLang)}</span>
      </div>
      <div className="social-auth__buttons">
        <button
          type="button"
          className="social-btn social-btn--google"
          disabled={loading}
          onClick={() => onSocialAuth("google")}
        >
          <GoogleIcon />
          {t("reg.continueGoogle", uiLang)}
        </button>
        <button
          type="button"
          className="social-btn social-btn--facebook"
          disabled={loading}
          onClick={() => onSocialAuth("facebook")}
        >
          <FacebookIcon />
          {t("reg.continueFacebook", uiLang)}
        </button>
      </div>
    </div>
  );

  return (
    <main className="page">
      {socialOverlay ? (
        <SocialAuthOverlay overlay={socialOverlay} uiLang={uiLang} onExitComplete={handleOverlayExitComplete} />
      ) : null}
      <div className="bg-orb bg-orb-a" aria-hidden="true"></div>
      <div className="bg-orb bg-orb-b" aria-hidden="true"></div>

      <header className="hero-strip">
        <div className="header-left">
          <span className="mini-logo">in</span>
          <input className="header-search" placeholder={t("nav.search", uiLang)} />
        </div>
        <nav className="header-nav">
          <a href="../pages/home/index.html">{t("nav.home", uiLang)}</a>
          <a href="../pages/network/index.html">{t("nav.network", uiLang)}</a>
          <a href="../pages/vacancies/index.html">{t("nav.vacancies", uiLang)}</a>
          <a href="../pages/chat/index.html">{t("nav.messages", uiLang)}</a>
          <a href="../pages/home/index.html">{t("nav.notifications", uiLang)}</a>
        </nav>
        <a className="header-user" href="../pages/profile/index.html?v=20260516-2">
          {headerAvatar ? <img className="header-user-dot" src={headerAvatar} alt="" /> : <span className="header-user-dot"></span>}
          <span>{t("user.myProfile", uiLang)}</span>
        </a>
        <button type="button" className="theme-toggle" data-theme-toggle aria-pressed="false">
          <svg className="theme-toggle__icon theme-toggle__icon--moon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
          <svg className="theme-toggle__icon theme-toggle__icon--sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        </button>
      </header>

      <section className="app-shell">
        <aside className="promo">
          <div className="logo-mark">in</div>
          <h1>{t("reg.title", uiLang)}</h1>
          <p>{t("reg.subtitle", uiLang)}</p>
          <div className="flow-points">
            <span className={activeTab === "register" ? "on" : ""}>{t("reg.stepRegister", uiLang)}</span>
            <span className={activeTab === "login" ? "on" : ""}>{t("reg.stepLogin", uiLang)}</span>
            <span>{t("reg.stepHome", uiLang)}</span>
          </div>
        </aside>

        <article className="auth-card">
          <div className="tabs">
            <button
              type="button"
              className={activeTab === "register" ? "tab active" : "tab"}
              onClick={() => setActiveTab("register")}
            >
              {t("reg.tabRegister", uiLang)}
            </button>
            <button
              type="button"
              className={activeTab === "login" ? "tab active" : "tab"}
              onClick={() => setActiveTab("login")}
            >
              {t("reg.tabLogin", uiLang)}
            </button>
          </div>

          {banner.text ? (
            <div className={banner.type === "error" ? "banner error" : "banner success"}>{banner.text}</div>
          ) : null}

          {activeTab === "register" ? (
            <form className="form" onSubmit={onRegisterSubmit}>
              <label>
                {t("reg.emailShort", uiLang)}
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={registerForm.email}
                  onChange={setRegisterField}
                  required
                />
              </label>
              <label>
                {t("reg.usernameShort", uiLang)}
                <input
                  name="userName"
                  type="text"
                  placeholder="timur"
                  value={registerForm.userName}
                  onChange={setRegisterField}
                  required
                />
              </label>
              <label>
                {t("reg.firstName", uiLang)}
                <input
                  name="firstName"
                  type="text"
                  placeholder={t("reg.phFirst", uiLang)}
                  value={registerForm.firstName}
                  onChange={setRegisterField}
                  required
                />
              </label>
              <label>
                {t("reg.lastName", uiLang)}
                <input
                  name="lastName"
                  type="text"
                  placeholder={t("reg.phLast", uiLang)}
                  value={registerForm.lastName}
                  onChange={setRegisterField}
                  required
                />
              </label>
              <label>
                {t("reg.password", uiLang)}
                <input
                  name="password"
                  type="password"
                  placeholder={t("reg.phPass", uiLang)}
                  value={registerForm.password}
                  onChange={setRegisterField}
                  required
                />
              </label>
              <label>
                {t("reg.confirmPassword", uiLang)}
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder={t("reg.phConfirm", uiLang)}
                  value={registerForm.confirmPassword}
                  onChange={setRegisterField}
                  required
                />
              </label>
              <button className="primary" disabled={loading || !registerReady} type="submit">
                {loading ? t("reg.creating", uiLang) : t("reg.submit", uiLang)}
              </button>
            </form>
          ) : (
            <form className="form" onSubmit={onLoginSubmit}>
              <label>
                {t("reg.emailShort", uiLang)}
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginForm.email}
                  onChange={setLoginField}
                  required
                />
              </label>
              <label>
                {t("reg.password", uiLang)}
                <input
                  name="password"
                  type="password"
                  placeholder={t("reg.phLoginPass", uiLang)}
                  value={loginForm.password}
                  onChange={setLoginField}
                  required
                />
              </label>
              <button className="primary" disabled={loading || !loginReady} type="submit">
                {loading ? t("reg.loggingIn", uiLang) : t("reg.login", uiLang)}
              </button>
            </form>
          )}

          {socialAuthBlock}

          <button type="button" className="secondary-action" onClick={onContinueAsGuest} disabled={loading}>
            {t("reg.skip", uiLang)}
          </button>
        </article>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
