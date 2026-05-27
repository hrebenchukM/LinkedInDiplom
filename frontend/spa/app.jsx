const { createContext, useContext, useMemo, useState, useEffect } = React;
const RouterDomLib =
  (typeof window !== "undefined" && window.ReactRouterDOM)
  || (typeof ReactRouterDOM !== "undefined" ? ReactRouterDOM : null);

if (!RouterDomLib) {
  throw new Error("ReactRouterDOM is not loaded");
}

const { HashRouter, Routes, Route, Navigate, NavLink, useNavigate, useLocation } = RouterDomLib;

const AuthContext = createContext(null);
const UiContext = createContext(null);
const DataContext = createContext(null);

function readFromStorage(key, fallback) {
  if (!window.spaStorage) return fallback;
  return window.spaStorage.readJson(key, fallback);
}

function writeToStorage(key, value) {
  if (!window.spaStorage) return;
  window.spaStorage.writeJson(key, value);
}

function asObject(value, fallback) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
}

function asArray(value, fallback) {
  return Array.isArray(value) ? value : fallback;
}

function useAuthProvider() {
  const [session, setSession] = useState(() => {
    const raw = readFromStorage("authSession", null);
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : null;
  });
  const [account, setAccount] = useState(() => asObject(readFromStorage("registeredAccount", {}), {}));

  useEffect(() => {
    writeToStorage("authSession", session);
  }, [session]);

  useEffect(() => {
    writeToStorage("registeredAccount", account || {});
  }, [account]);

  return useMemo(
    () => ({
      session,
      account,
      isAuthed: Boolean(session),
      logout: () => setSession(null),
      setSession,
      setAccount,
    }),
    [session, account]
  );
}

function useUiProvider() {
  const [notice, setNotice] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const pushNotice = (text) => {
    const message = String(text || "").trim();
    if (!message) return;
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
  };
  return useMemo(
    () => ({
      notice,
      searchOpen,
      setSearchOpen,
      pushNotice,
    }),
    [notice, searchOpen]
  );
}

function useDataProvider() {
  const [feedPosts, setFeedPosts] = useState(() => asArray(readFromStorage("homeFeedPosts", []), []));
  const [homeChats, setHomeChats] = useState(() => asArray(readFromStorage("homeChats", []), []));
  const [notifications, setNotifications] = useState(() => asArray(readFromStorage("uiNotifications", []), []));
  const [applications, setApplications] = useState(() => asObject(readFromStorage("vacancyApplications", {}), {}));
  const [savedJobs, setSavedJobs] = useState(() => asObject(readFromStorage("vacancySavedJobs", {}), {}));

  useEffect(() => writeToStorage("homeFeedPosts", feedPosts), [feedPosts]);
  useEffect(() => writeToStorage("homeChats", homeChats), [homeChats]);
  useEffect(() => writeToStorage("uiNotifications", notifications), [notifications]);
  useEffect(() => writeToStorage("vacancyApplications", applications), [applications]);
  useEffect(() => writeToStorage("vacancySavedJobs", savedJobs), [savedJobs]);

  return useMemo(
    () => ({
      feedPosts,
      setFeedPosts,
      homeChats,
      setHomeChats,
      notifications,
      setNotifications,
      applications,
      setApplications,
      savedJobs,
      setSavedJobs,
    }),
    [feedPosts, homeChats, notifications, applications, savedJobs]
  );
}

function AppProviders({ children }) {
  const auth = useAuthProvider();
  const ui = useUiProvider();
  const data = useDataProvider();
  return (
    <AuthContext.Provider value={auth}>
      <UiContext.Provider value={ui}>
        <DataContext.Provider value={data}>{children}</DataContext.Provider>
      </UiContext.Provider>
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

function useUi() {
  return useContext(UiContext);
}

function useData() {
  return useContext(DataContext);
}

const API_BASE_URL = "https://localhost:7011";
const USE_MOCK_AUTH = true;

function t(key, fallback) {
  return typeof window.uiT === "function" ? window.uiT(key) : fallback;
}

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function readJsonSafe(key, fallback) {
  return window.spaStorage.readJson(key, fallback);
}

function writeJsonSafe(key, value) {
  window.spaStorage.writeJson(key, value);
}

function readMockUsers() {
  return window.spaStorage.readJson(window.spaStorage.keys.mockAuthUsers, []);
}

function writeMockUsers(users) {
  window.spaStorage.writeJson(window.spaStorage.keys.mockAuthUsers, users);
}

async function postMockAuth(path, payload) {
  const users = readMockUsers();
  if (path === "/api/auth/register") {
    const email = String(payload?.email || "").trim().toLowerCase();
    if (users.some((x) => x.email === email)) {
      return { ok: false, data: { message: "Пользователь уже существует." } };
    }
    const user = { id: Date.now(), ...payload, email };
    users.push(user);
    writeMockUsers(users);
    return { ok: true, data: { success: true } };
  }
  if (path === "/api/auth/login") {
    const email = String(payload?.email || "").trim().toLowerCase();
    const user = users.find((u) => u.email === email && u.password === payload?.password);
    if (!user) return { ok: false, data: { message: "Неверный email или пароль." } };
    return { ok: true, data: { account: user, token: { accessToken: `mock-${user.id}` } } };
  }
  return { ok: false, data: { message: "Not found" } };
}

async function postJson(path, payload) {
  if (USE_MOCK_AUTH) return postMockAuth(path, payload);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, data };
  } catch {
    return postMockAuth(path, payload);
  }
}

function ProtectedRoute({ children }) {
  const { isAuthed } = useAuth();
  const location = useLocation();
  if (!isAuthed) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  return children;
}

function RegisteredProfileRoute({ children }) {
  const { account, session } = useAuth();
  const location = useLocation();
  const hasRegisteredAccount = Boolean(
    account
    && typeof account === "object"
    && typeof account.email === "string"
    && account.email.trim()
  );
  if (!hasRegisteredAccount || session?.guest) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }
  return children;
}

function UiNotice() {
  const { notice } = useUi();
  if (!notice) return null;
  return <div className="spa-notice">{notice}</div>;
}

function GlobalSearchModal() {
  const { searchOpen, setSearchOpen } = useUi();
  const navigate = useNavigate();
  const items = [
    { label: t("nav.home", "Главная"), to: "/home" },
    { label: t("nav.network", "Сеть"), to: "/network" },
    { label: t("nav.vacancies", "Вакансии"), to: "/vacancies" },
    { label: t("nav.messages", "Сообщения"), to: "/chat" },
    { label: t("user.myProfile", "Мой профиль"), to: "/profile" },
  ];
  const [query, setQuery] = useState("");
  if (!searchOpen) return null;
  const rows = items.filter((x) => x.label.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="spa-modal-root" onClick={() => setSearchOpen(false)}>
      <section className="spa-modal" onClick={(e) => e.stopPropagation()}>
        <div className="spa-modal__head">
          <h3>{t("search.title", "Поиск по сайту")}</h3>
          <button onClick={() => setSearchOpen(false)}>×</button>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder", "Люди, компании, страницы")}
        />
        <div className="spa-search-list">
          {rows.length ? (
            rows.map((item) => (
              <button
                key={item.to}
                className="spa-search-row"
                onClick={() => {
                  navigate(item.to);
                  setSearchOpen(false);
                }}
              >
                {item.label}
              </button>
            ))
          ) : (
            <p className="spa-muted">{t("search.empty", "Ничего не найдено")}</p>
          )}
        </div>
      </section>
    </div>
  );
}

function AppHeader() {
  const { account } = useAuth();
  const { setSearchOpen } = useUi();
  const avatarSeed = account?.userName || account?.email || "user";
  const avatar = account?.avatarDataUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`;

  return (
    <header className="home-header" role="banner">
      <div className="home-header__inner">
        <NavLink to="/home" className="home-logo" aria-label="Home">in</NavLink>
        <button type="button" className="home-search spa-search-trigger" role="search" onClick={() => setSearchOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <span>{t("nav.search", "Search")}</span>
        </button>
        <nav className="home-nav">
          <NavLink to="/home" className={({ isActive }) => isActive ? "home-nav__item home-nav__item--active" : "home-nav__item"}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
            <span>{t("nav.home", "Home")}</span>
          </NavLink>
          <NavLink to="/network" className={({ isActive }) => isActive ? "home-nav__item home-nav__item--active" : "home-nav__item"}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
            <span>{t("nav.network", "Network")}</span>
          </NavLink>
          <NavLink to="/vacancies" className={({ isActive }) => isActive ? "home-nav__item home-nav__item--active" : "home-nav__item"}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" /></svg>
            <span>{t("nav.vacancies", "Vacancies")}</span>
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => isActive ? "home-nav__item home-nav__item--active" : "home-nav__item"}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
            <span>{t("nav.messages", "Messages")}</span>
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => isActive ? "home-nav__item home-nav__item--active" : "home-nav__item"}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /></svg>
            <span>{t("nav.notifications", "Notifications")}</span>
          </NavLink>
        </nav>
        <button type="button" className="theme-toggle" data-theme-toggle aria-pressed="false" aria-label="theme">
          <svg className="theme-toggle__icon theme-toggle__icon--moon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
          <svg className="theme-toggle__icon theme-toggle__icon--sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        </button>
        <select className="spa-lang" data-ui-lang defaultValue={window.getUiLang ? window.getUiLang() : "ru"}>
          <option value="ru">Русский</option>
          <option value="en">English</option>
          <option value="uk">Українська</option>
        </select>
        <NavLink to="/profile" className="home-user">
          <img className="home-user__avatar" src={avatar} width="36" height="36" alt="" />
          <span className="home-user__label">{account?.firstName || t("user.myProfile", "Мой профиль")}</span>
        </NavLink>
      </div>
    </header>
  );
}

function AppLayout({ children }) {
  return (
    <main className="home-body">
      <AppHeader />
      <div className="spa-page">{children}</div>
      <UiNotice />
      <GlobalSearchModal />
    </main>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const { setSession, setAccount } = useAuth();
  const [tab, setTab] = useState("register");
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState("");
  const [registerForm, setRegisterForm] = useState({
    email: "",
    userName: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const onRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      setBanner(t("reg.errPassMismatch", "Пароли не совпадают."));
      return;
    }
    setLoading(true);
    const res = await postJson("/api/auth/register", registerForm);
    setLoading(false);
    if (!res.ok) {
      setBanner(res.data?.message || t("reg.fetchErr", "Не удалось выполнить запрос"));
      return;
    }
    const account = {
      email: registerForm.email.trim(),
      userName: registerForm.userName.trim(),
      firstName: registerForm.firstName.trim(),
      lastName: registerForm.lastName.trim(),
    };
    setAccount(account);
    setSession(account);
    navigate("/profile", { replace: true });
  };

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await postJson("/api/auth/login", loginForm);
    setLoading(false);
    if (!res.ok) {
      setBanner(res.data?.message || t("reg.errLogin", "Неверный email или пароль."));
      return;
    }
    const account = {
      email: loginForm.email.trim(),
      userName: res.data?.account?.userName || loginForm.email.split("@")[0],
      firstName: res.data?.account?.firstName || "",
      lastName: res.data?.account?.lastName || "",
    };
    setAccount(account);
    setSession(account);
    navigate("/home", { replace: true });
  };

  return (
    <main className="page">
      <section className="app-shell">
        <aside className="promo">
          <div className="logo-mark">in</div>
          <h1>{t("reg.title", "LinkUp Auth")}</h1>
          <p>{t("reg.subtitle", "Современная регистрация и вход в одном удобном окне.")}</p>
        </aside>
        <article className="auth-card">
          <div className="tabs">
            <button type="button" className={tab === "register" ? "tab active" : "tab"} onClick={() => setTab("register")}>
              {t("reg.tabRegister", "Регистрация")}
            </button>
            <button type="button" className={tab === "login" ? "tab active" : "tab"} onClick={() => setTab("login")}>
              {t("reg.tabLogin", "Вход")}
            </button>
          </div>
          {banner ? <p className="banner error">{banner}</p> : null}
          {tab === "register" ? (
            <form className="form" onSubmit={onRegister}>
              <input name="email" placeholder="Email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} required />
              <input name="userName" placeholder="Username" value={registerForm.userName} onChange={(e) => setRegisterForm({ ...registerForm, userName: e.target.value })} required />
              <input name="firstName" placeholder={t("reg.firstName", "Имя")} value={registerForm.firstName} onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })} required />
              <input name="lastName" placeholder={t("reg.lastName", "Фамилия")} value={registerForm.lastName} onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })} required />
              <input type="password" name="password" placeholder={t("reg.password", "Пароль")} value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required />
              <input type="password" name="confirmPassword" placeholder={t("reg.confirmPassword", "Повторите пароль")} value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} required />
              <button className="primary" disabled={loading}>{loading ? t("reg.creating", "Создание...") : t("reg.submit", "Создать аккаунт")}</button>
            </form>
          ) : (
            <form className="form" onSubmit={onLogin}>
              <input name="email" placeholder="Email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
              <input type="password" name="password" placeholder={t("reg.password", "Пароль")} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
              <button className="primary" disabled={loading}>{loading ? t("reg.loggingIn", "Вход...") : t("reg.login", "Войти")}</button>
            </form>
          )}
        </article>
      </section>
    </main>
  );
}

function HomePage() {
  const { account, session, logout } = useAuth();
  const { setSearchOpen } = useUi();
  const navigate = useNavigate();
  const { feedPosts, setFeedPosts } = useData();
  const [postText, setPostText] = useState("");
  const [messageTab, setMessageTab] = useState("sorted");
  const [messageDraft, setMessageDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [actionHint, setActionHint] = useState("");
  const [likedPosts, setLikedPosts] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [, setLangTick] = useState(0);
  const FEED_MOCK = [
    {
      id: "demo-1",
      author: "Christian Nolan",
      role: "UI/UX Designer",
      text: "“Any author receives a variety of opinions by users at the end of the process I'd. The most, as opposed to understanding it's a day one issue and part of trying” - Tom Jackson",
      image: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1200&q=80&auto=format&fit=crop",
    },
    {
      id: "demo-2",
      author: "Jonathan Matthews",
      role: "UX Designer",
      text: "Users will tell you what they think they want. Users will tell you what they think you want to hear. Users will tell you what they think sounds good. Users will not tell you what you need to know.",
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80&auto=format&fit=crop",
    },
  ];
  const posts = feedPosts.length ? feedPosts : FEED_MOCK;
  const userEmail = typeof session?.email === "string" && session.email ? session.email : "guest@linkup.local";
  const displayName = session?.guest ? "Гость" : (account?.userName || userEmail.split("@")[0]);
  const profileName = [account?.firstName, account?.lastName].filter(Boolean).join(" ").trim() || displayName;
  const rawAvatar = typeof account?.avatarDataUrl === "string" ? account.avatarDataUrl.trim() : "";
  const userAvatar =
    rawAvatar.startsWith("data:image/") || /^https:\/\//i.test(rawAvatar)
      ? rawAvatar
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName || userEmail)}`;

  const showHint = (text) => {
    setActionHint(text);
    window.setTimeout(() => setActionHint(""), 1800);
  };

  const publishPost = () => {
    const text = postText.trim();
    if (!text) return;
    const newPost = {
      id: id("p"),
      author: profileName,
      role: "You",
      text,
      image: "",
    };
    setFeedPosts([newPost, ...posts]);
    setPostText("");
  };

  const sendMessage = () => {
    const text = messageDraft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: id("m"), text }]);
    setMessageDraft("");
  };

  const addComposerToken = (kind) => {
    const templates = { photo: "[photo]", video: "[video]", event: "[event]" };
    const token = templates[kind] || "";
    if (!token) return;
    setPostText((prev) => (prev ? `${prev} ${token}` : token));
    showHint(token);
  };

  const toggleLike = (postId) => {
    setLikedPosts((prev) => (
      prev.includes(postId)
        ? prev.filter((idValue) => idValue !== postId)
        : [...prev, postId]
    ));
  };

  const addComment = (postId) => {
    const text = window.prompt(t("feed.comment", "Comment"));
    if (!text || !text.trim()) return;
    setCommentCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
    showHint(t("feed.comment", "Comment"));
  };

  const sharePost = (postId) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/home?post=${encodeURIComponent(postId)}`;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    showHint(t("feed.share", "Share"));
  };

  const sendPostToMessages = (post) => {
    const snippet = String(post.text || "").slice(0, 60);
    setMessages((prev) => [...prev, { id: id("m"), text: `${post.author}: ${snippet}${snippet.length >= 60 ? "…" : ""}` }]);
    showHint(t("feed.send", "Send"));
  };

  useEffect(() => {
    const onLang = () => setLangTick((n) => n + 1);
    document.addEventListener("uilangchange", onLang);
    return () => document.removeEventListener("uilangchange", onLang);
  }, []);

  return (
    <main className="home-root">
      <header className="home-header" role="banner">
        <div className="home-header__inner">
          <NavLink to="/home" className="home-logo" aria-label="Home">in</NavLink>
          <button type="button" className="home-search spa-search-trigger" role="search" onClick={() => setSearchOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <span data-i18n="nav.search">Search</span>
          </button>
          <nav className="home-nav" aria-label="Primary">
            <NavLink to="/home" className={({ isActive }) => isActive ? "home-nav__item home-nav__item--active" : "home-nav__item"}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
              <span data-i18n="nav.home">Home</span>
            </NavLink>
            <NavLink to="/network" className={({ isActive }) => isActive ? "home-nav__item home-nav__item--active" : "home-nav__item"}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
              <span data-i18n="nav.network">Network</span>
            </NavLink>
            <NavLink to="/vacancies" className={({ isActive }) => isActive ? "home-nav__item home-nav__item--active" : "home-nav__item"}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" /></svg>
              <span data-i18n="nav.vacancies">Vacancies</span>
            </NavLink>
            <NavLink to="/chat" className={({ isActive }) => isActive ? "home-nav__item home-nav__item--active" : "home-nav__item"}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
              <span data-i18n="nav.messages">Messages</span>
            </NavLink>
            <button type="button" className="home-nav__item" onClick={() => navigate("/notifications")}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /></svg>
              <span data-i18n="nav.notifications">Notifications</span>
            </button>
          </nav>
          <button type="button" className="theme-toggle home-theme-toggle" data-theme-toggle aria-pressed="false" aria-label="Переключить тему" title="Переключить тему">
            <svg className="theme-toggle__icon theme-toggle__icon--moon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
            <svg className="theme-toggle__icon theme-toggle__icon--sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          </button>
          <NavLink to="/profile" className="home-user">
            <img className="home-user__avatar" src={userAvatar} width="36" height="36" alt="" />
            <span className="home-user__label">{profileName}</span>
          </NavLink>
        </div>
      </header>
      {actionHint ? <div className="action-hint">{actionHint}</div> : null}

      <section className="home-layout">
        <aside className="left-card">
          <img className="avatar avatar-img" src={userAvatar} alt="" />
          <h3>{profileName}</h3>
          <p data-i18n="home.role">Front-end Developer</p>
          <hr />
          <div className="metric"><span data-i18n="home.contacts">Contacts</span><strong>73</strong></div>
          <div className="metric"><span data-i18n="home.profileViews">Who viewed profile</span><strong>420</strong></div>
          <button className="ghost-main" onClick={() => navigate("/vacancies")}><span data-i18n="home.savedElements">Saved elements</span></button>
        </aside>

        <section className="feed">
          <article className="composer">
            <div className="composer-top">
              <img className="avatar avatar-img small" src={userAvatar} alt="" />
              <input value={postText} onChange={(event) => setPostText(event.target.value)} placeholder="Start your post" data-i18n-placeholder="feed.composerPlaceholder" />
            </div>
            <div className="composer-actions">
              <button onClick={() => addComposerToken("photo")} data-i18n="feed.photo">Photo</button>
              <button onClick={() => addComposerToken("video")} data-i18n="feed.video">Video</button>
              <button onClick={() => addComposerToken("event")} data-i18n="feed.event">Event</button>
              <button className="primary-mini" onClick={publishPost} data-i18n="feed.post">Publish</button>
            </div>
          </article>

          {posts.map((post) => (
            <article key={post.id} className="post-card">
              <div className="post-head">
                <img className="avatar avatar-img small" src={userAvatar} alt="" />
                <div>
                  <strong>{post.author}</strong>
                  <p>{post.role === "You" ? (typeof window.uiT === "function" ? window.uiT("home.you") : "You") : post.role}</p>
                </div>
              </div>
              <p className="post-text">{post.text}</p>
              {post.image ? <img src={post.image} alt="post visual" /> : null}
              <div className="post-actions">
                <button onClick={() => toggleLike(post.id)} data-i18n="feed.like">{likedPosts.includes(post.id) ? `${t("feed.like", "Like")} ✓` : t("feed.like", "Like")}</button>
                <button onClick={() => addComment(post.id)} data-i18n="feed.comment">{`${t("feed.comment", "Comment")}${commentCounts[post.id] ? ` (${commentCounts[post.id]})` : ""}`}</button>
                <button onClick={() => sharePost(post.id)} data-i18n="feed.share">Share</button>
                <button onClick={() => sendPostToMessages(post)} data-i18n="feed.send">Send</button>
              </div>
            </article>
          ))}
        </section>

        <aside className="right-card">
          <div className="right-top">
            <h4 data-i18n="widget.title">Messages</h4>
            <button onClick={logout} data-i18n="home.logout">Log out</button>
          </div>
          <input className="search small-input" placeholder="Search messages" data-i18n-placeholder="widget.searchPh" value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} />
          <div className="msg-tabs">
            <button className={messageTab === "sorted" ? "active" : ""} onClick={() => setMessageTab("sorted")} data-i18n="widget.tabSorted">Sorted</button>
            <button className={messageTab === "other" ? "active" : ""} onClick={() => setMessageTab("other")} data-i18n="widget.tabOther">Other</button>
          </div>
          <div className="msg-list">
            {messages.length === 0 ? (
              <p className="muted" data-i18n="home.msgEmpty">No messages yet. Start a discussion.</p>
            ) : (
              messages.map((msg) => <p key={msg.id}>{msg.text}</p>)
            )}
          </div>
          <button className="ghost-main" onClick={sendMessage} data-i18n="widget.cta">Send a message</button>
        </aside>
      </section>

      <footer className="footer">
        <span data-i18n="footer.link1a">General information</span>
        <span data-i18n="footer.link2b">Privacy terms</span>
        <span data-i18n="footer.link4a">Help center</span>
        <span data-i18n="footer.link3c">Cookie policy</span>
        <span data-i18n="footer.link2a">Accessibility</span>
        <div className="footer-lang">
          <label>
            <span className="footer-lang__label" data-i18n="home.langLabel">Язык интерфейса</span>
            <select name="lang" data-ui-lang data-i18n-aria="footer.langAria" id="uiLangSelectHome">
              <option value="ru">Русский</option>
              <option value="en">English</option>
              <option value="uk">Українська</option>
            </select>
          </label>
        </div>
      </footer>
      <UiNotice />
    </main>
  );
}

function NetworkPage() {
  const { homeChats, setHomeChats, notifications, setNotifications } = useData();
  const { pushNotice } = useUi();
  const navigate = useNavigate();
  const [tab, setTab] = useState("connections");
  const [sidebarSection, setSidebarSection] = useState("contacts");
  const [eventFilter, setEventFilter] = useState("all");
  const [messageTab, setMessageTab] = useState("sorted");
  const [messageSearch, setMessageSearch] = useState("");
  const [peopleSearch, setPeopleSearch] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);
  const people = [
    { id: "david-jonson", name: "David Jonson", role: "Lead UI/UX Designer", handle: "@JonsonCPDR", section: "contacts", online: true, mutual: 12, skills: ["Figma", "Design Systems"] },
    { id: "duncan-callahan", name: "Duncan Callahan", role: "Lead UX Designer", handle: "@CallahanDesign", section: "following", online: false, mutual: 8, skills: ["User Research", "UX Writing"] },
    { id: "joshua-cortez", name: "Joshua Cortez", role: "UI/UX Designer", handle: "@JoshuaCortezUX", section: "groups", online: true, mutual: 5, skills: ["Prototyping", "Accessibility"] },
    { id: "jennifer-obrian", name: "Jennifer O'Brian", role: "Product Designer", handle: "@JenniferOBrian", section: "contacts", online: true, mutual: 14, skills: ["Product Strategy", "Figma"] },
    { id: "emma-knight", name: "Emma Knight", role: "Senior UI/UX Designer", handle: "@EmmaKnightUI", section: "pages", online: false, mutual: 11, skills: ["Mentoring", "Design Ops"] },
    { id: "michael-kendy", name: "Michael Kendy", role: "Junior UI/UX Designer", handle: "@MichaelKendy", section: "following", online: true, mutual: 4, skills: ["Wireframes", "Auto Layout"] },
    { id: "anna-lis", name: "Anna Lis", role: "Front-end Developer", handle: "@AnnaLisCode", section: "groups", online: true, mutual: 7, skills: ["React", "TypeScript"] },
    { id: "petro-ivanenko", name: "Petro Ivanenko", role: "Full-stack Developer", handle: "@PetroIva", section: "pages", online: false, mutual: 9, skills: ["Node.js", "PostgreSQL"] },
  ];
  const networkEvents = [
    { id: "ev-1", kind: "career", title: "Emma Knight started a new role", text: "Now working as Product Design Lead at TechNova.", when: "2h ago" },
    { id: "ev-2", kind: "birthdays", title: "Joshua Cortez has a birthday today", text: "Send a short message to stay in touch.", when: "today" },
    { id: "ev-3", kind: "education", title: "Duncan Callahan completed a course", text: "Finished Advanced UX Strategy by Coursera.", when: "1d ago" },
    { id: "ev-4", kind: "career", title: "Petro Ivanenko is open to work", text: "Looking for senior full-stack opportunities.", when: "3d ago" },
  ];
  const [sentIds, setSentIds] = useState([]);
  const visibleMessages = homeChats.filter((chat, index) => {
    const matchesSearch = String(chat.name || "").toLowerCase().includes(messageSearch.toLowerCase());
    const inTab = messageTab === "sorted" ? index % 2 === 0 : index % 2 === 1;
    return matchesSearch && inTab;
  });
  const visiblePeople = people.filter((person) => {
    if (dismissedIds.includes(person.id)) return false;
    if (sidebarSection !== "events" && sidebarSection !== "contacts" && person.section !== sidebarSection) return false;
    if (onlineOnly && !person.online) return false;
    const q = peopleSearch.trim().toLowerCase();
    if (!q) return true;
    return [person.name, person.role, person.handle, person.skills.join(" ")].join(" ").toLowerCase().includes(q);
  });
  const visibleEvents = networkEvents.filter((event) => eventFilter === "all" || event.kind === eventFilter);

  const connect = (person) => {
    const exists = homeChats.some((c) => window.spaStorage.normalizeId(c.id) === person.id);
    if (!exists) {
      setHomeChats([{ id: person.id, name: person.name, preview: t("network.newChatPreview", "Начните переписку…"), time: "" }, ...homeChats]);
    }
    setSentIds((prev) => (prev.includes(person.id) ? prev : [...prev, person.id]));
    setNotifications([{ text: `Новый контакт: ${person.name}`, ts: new Date().toISOString() }, ...notifications].slice(0, 24));
    pushNotice(t("network.sent", "Запрос отправлен"));
  };
  const openChat = (person) => {
    const exists = homeChats.some((c) => window.spaStorage.normalizeId(c.id) === person.id);
    if (!exists) {
      setHomeChats([{ id: person.id, name: person.name, preview: t("network.newChatPreview", "Начните переписку…"), time: "" }, ...homeChats]);
    }
    navigate("/chat");
    pushNotice(t("network.openChat", "Открыт чат"));
  };
  const dismissPerson = (person) => {
    setDismissedIds((prev) => (prev.includes(person.id) ? prev : [...prev, person.id]));
    pushNotice(t("network.hidden", "Карточка скрыта"));
  };

  return (
    <AppLayout>
      <div className="home-shell home-shell--vacancies">
        <aside className="home-col-left home-card vac-sidebar">
          <h2 className="vac-sidebar__title">{t("network.sidebarTitle", "Manage your network of contacts")}</h2>
          <nav className="vac-sidebar__nav">
            <button type="button" className={sidebarSection === "contacts" ? "vac-sidebar__link vac-sidebar__link--active" : "vac-sidebar__link"} onClick={() => { setSidebarSection("contacts"); setTab("connections"); }}>
              <span>{t("network.contacts", "Contacts")}</span>
            </button>
            <button type="button" className={sidebarSection === "following" ? "vac-sidebar__link vac-sidebar__link--active" : "vac-sidebar__link"} onClick={() => { setSidebarSection("following"); setTab("connections"); }}>
              <span>{t("network.following", "People you follow")}</span>
            </button>
            <button type="button" className={sidebarSection === "groups" ? "vac-sidebar__link vac-sidebar__link--active" : "vac-sidebar__link"} onClick={() => { setSidebarSection("groups"); setTab("connections"); }}>
              <span>{t("network.groups", "Groups")}</span>
            </button>
            <button type="button" className={sidebarSection === "events" ? "vac-sidebar__link vac-sidebar__link--active" : "vac-sidebar__link"} onClick={() => { setSidebarSection("events"); setTab("events"); }}>
              <span>{t("network.events", "Events")}</span>
            </button>
            <button type="button" className={sidebarSection === "pages" ? "vac-sidebar__link vac-sidebar__link--active" : "vac-sidebar__link"} onClick={() => { setSidebarSection("pages"); setTab("connections"); }}>
              <span>{t("network.pages", "Pages")}</span>
            </button>
          </nav>
        </aside>

        <main className="home-col-feed vac-page-main">
          <div className="vac-tabs" role="tablist">
            <button
              type="button"
              className={tab === "connections" ? "vac-tabs__btn vac-tabs__btn--active" : "vac-tabs__btn"}
              onClick={() => setTab("connections")}
            >
              {t("network.tabNew", "New Connections")}
            </button>
            <button
              type="button"
              className={tab === "events" ? "vac-tabs__btn vac-tabs__btn--active" : "vac-tabs__btn"}
              onClick={() => setTab("events")}
            >
              {t("network.tabEvents", "Event")}
            </button>
          </div>

          {tab === "connections" ? (
            <section className="home-card vac-people">
              <div className="vac-people__toolbar">
                <div>
                  <h3 className="vac-people__heading">{t("network.peopleHeading", "People in the 'UI/UX design' you may know")}</h3>
                  <p className="vac-people__sub">{t("network.peopleSub", "Find relevant contacts, send requests, and start a conversation in one click.")}</p>
                </div>
                <div className="vac-people__filters">
                  <input
                    className="vac-people__search"
                    type="search"
                    value={peopleSearch}
                    onChange={(e) => setPeopleSearch(e.target.value)}
                    placeholder={t("network.searchPeople", "Search by name, role, skill")}
                  />
                  <label className="vac-people__online">
                    <input type="checkbox" checked={onlineOnly} onChange={(e) => setOnlineOnly(e.target.checked)} />
                    <span>{t("network.onlyOnline", "Online only")}</span>
                  </label>
                </div>
              </div>
              <div className="vac-people__grid">
                {visiblePeople.map((p) => (
                  <article key={p.id} className="vac-person">
                    <img
                      className="vac-person__avatar"
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.name)}`}
                      width="72"
                      height="72"
                      alt=""
                    />
                    <h4 className="vac-person__name">{p.name}</h4>
                    <p className="vac-person__role">{p.role}</p>
                    <p className="vac-person__handle">{p.handle}</p>
                    <p className="vac-person__mutual">{`${p.mutual} ${t("network.mutual", "mutual contacts")}`}</p>
                    <div className="vac-person__skills">
                      {p.skills.map((skill) => <span key={`${p.id}-${skill}`}>{skill}</span>)}
                    </div>
                    <button
                      type="button"
                      className="vac-person__btn"
                      onClick={() => connect(p)}
                      disabled={sentIds.includes(p.id)}
                    >
                      {sentIds.includes(p.id) ? t("network.sent", "Sent") : t("network.connect", "Make contact")}
                    </button>
                    <div className="vac-person__actions">
                      <button type="button" className="vac-person__ghost" onClick={() => openChat(p)}>
                        {t("network.message", "Message")}
                      </button>
                      <button type="button" className="vac-person__ghost" onClick={() => dismissPerson(p)}>
                        {t("network.hide", "Hide")}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {!visiblePeople.length ? (
                <div className="vac-event-empty">
                  <h3 className="vac-event-empty__title">{t("network.noMatches", "No matches found")}</h3>
                  <p className="vac-event-empty__text">{t("network.noMatchesSub", "Try another query or reset filters to see more people.")}</p>
                  <button type="button" className="vac-event-expand" onClick={() => { setPeopleSearch(""); setOnlineOnly(false); setSidebarSection("contacts"); }}>
                    {t("network.resetFilters", "Reset filters")}
                  </button>
                </div>
              ) : null}
            </section>
          ) : (
            <div className="home-card vac-event-card">
              <div className="vac-event-filters" role="toolbar">
                <button type="button" className={eventFilter === "all" ? "vac-event-filter vac-event-filter--active" : "vac-event-filter"} onClick={() => setEventFilter("all")}>{t("network.evAll", "All")}</button>
                <button type="button" className={eventFilter === "career" ? "vac-event-filter vac-event-filter--active" : "vac-event-filter"} onClick={() => setEventFilter("career")}>{t("network.evCareer", "Career changes")}</button>
                <button type="button" className={eventFilter === "birthdays" ? "vac-event-filter vac-event-filter--active" : "vac-event-filter"} onClick={() => setEventFilter("birthdays")}>{t("network.evBirth", "Birthdays")}</button>
                <button type="button" className={eventFilter === "education" ? "vac-event-filter vac-event-filter--active" : "vac-event-filter"} onClick={() => setEventFilter("education")}>{t("network.evEdu", "Education")}</button>
              </div>
              {visibleEvents.length ? (
                <div className="vac-events-list">
                  {visibleEvents.map((event) => (
                    <article key={event.id} className="vac-event-item">
                      <div className="vac-event-item__dot" aria-hidden="true"></div>
                      <div className="vac-event-item__content">
                        <h3>{event.title}</h3>
                        <p>{event.text}</p>
                      </div>
                      <p className="vac-event-item__when">{event.when}</p>
                      <button type="button" className="vac-event-item__btn" onClick={() => setTab("connections")}>
                        {t("network.evExpand", "Expand network")}
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="vac-event-empty">
                  <h3 className="vac-event-empty__title">{t("network.evTitle", "No fresh updates")}</h3>
                  <p className="vac-event-empty__text">{t("network.evText", "When your network grows, updates will appear here.")}</p>
                </div>
              )}
            </div>
          )}
        </main>

        <aside id="homeMessagesWidget" className="home-col-right home-card home-messages">
          <div className="home-messages__head">
            <h2 className="home-messages__title">{t("widget.title", "Messages")}</h2>
            <button type="button" className="home-messages__icon-btn" aria-label="more" onClick={() => pushNotice(t("network.contacts", "Contacts"))}>⋯</button>
            <button type="button" className="home-messages__icon-btn" aria-label="settings" onClick={() => pushNotice(t("network.pages", "Pages"))}>⚙</button>
          </div>
          <div id="homeMessagesWidgetBody" className="home-messages__body">
            <input className="home-messages__search" type="search" value={messageSearch} onChange={(e) => setMessageSearch(e.target.value)} placeholder={t("widget.searchPh", "Search messages")} />
            <div className="home-messages__tabs" role="tablist">
              <button type="button" className={messageTab === "sorted" ? "home-messages__tab home-messages__tab--active" : "home-messages__tab"} role="tab" aria-selected={messageTab === "sorted"} onClick={() => setMessageTab("sorted")}>
                {t("widget.tabSorted", "Sorted")}
              </button>
              <button type="button" className={messageTab === "other" ? "home-messages__tab home-messages__tab--active" : "home-messages__tab"} role="tab" aria-selected={messageTab === "other"} onClick={() => setMessageTab("other")}>
                {t("widget.tabOther", "Other")}
              </button>
            </div>
            {visibleMessages.length ? (
              <div className="vac-msg-list">
                {visibleMessages.map((chat) => (
                  <button key={chat.id} type="button" className="vac-msg-item" onClick={() => navigate("/chat")}>
                    <span className="vac-msg-item__name">{chat.name}</span>
                    <span className="vac-msg-item__preview">{chat.preview || t("network.newChatPreview", "Начните переписку…")}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="home-messages__empty">
                <p>{t("widget.empty", "No messages yet. Contact a member and start a discussion.")}</p>
                <NavLink to="/chat" className="home-messages__cta">{t("widget.cta", "Send a message")}</NavLink>
              </div>
            )}
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}

function ProfilePage() {
  const { account, setAccount, session, setSession } = useAuth();
  const { pushNotice } = useUi();
  const { homeChats, setHomeChats, notifications, setNotifications, feedPosts, setFeedPosts } = useData();
  const [form, setForm] = useState(() => ({
    firstName: account?.firstName || "",
    lastName: account?.lastName || "",
    email: account?.email || "",
    specialty: account?.specialty || "",
    position: account?.position || "",
    company: account?.company || "",
    experienceFrom: account?.experienceFrom || "",
    experienceTo: account?.experienceTo || "",
    country: "Украина",
    city: account?.city || "",
    phone: account?.phone || "",
    website: account?.website || "",
    education: account?.education || "",
    educationPeriod: account?.educationPeriod || "",
    about: account?.about || "",
    avatarDataUrl: account?.avatarDataUrl || "",
  }));
  const [skills, setSkills] = useState(() => (Array.isArray(account?.skills) ? account.skills : []));
  const [skillDraft, setSkillDraft] = useState("");
  const [experienceItems, setExperienceItems] = useState(() => (Array.isArray(account?.experienceItems) ? account.experienceItems : []));
  const [educationItems, setEducationItems] = useState(() => (Array.isArray(account?.educationItems) ? account.educationItems : []));
  const [projectItems, setProjectItems] = useState(() => (Array.isArray(account?.projectItems) ? account.projectItems : []));
  const [projectTitle, setProjectTitle] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [resumeName, setResumeName] = useState(() => (typeof account?.resumeName === "string" ? account.resumeName : ""));
  const [resumeDataUrl, setResumeDataUrl] = useState(() => (typeof account?.resumeDataUrl === "string" ? account.resumeDataUrl : ""));
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [pendingAvatarDataUrl, setPendingAvatarDataUrl] = useState(() => (typeof account?.avatarDataUrl === "string" ? account.avatarDataUrl : ""));
  const [saveHint, setSaveHint] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [modalForm, setModalForm] = useState({
    name: "",
    email: "",
    message: "",
    title: "",
    link: "",
    issuer: "",
    date: "",
    skill: "",
    post: "",
  });
  const [visibility, setVisibility] = useState(() => {
    const raw = readFromStorage("uiProfileVisibility", "public");
    return raw === "contacts" || raw === "private" ? raw : "public";
  });

  const avatarOptions = [
    { label: "Кот", url: "https://api.iconify.design/twemoji:cat-face.svg" },
    { label: "Собака", url: "https://api.iconify.design/twemoji:dog-face.svg" },
    { label: "Лиса", url: "https://api.iconify.design/twemoji:fox.svg" },
    { label: "Медведь", url: "https://api.iconify.design/twemoji:bear.svg" },
    { label: "Панда", url: "https://api.iconify.design/twemoji:panda.svg" },
    { label: "Коала", url: "https://api.iconify.design/twemoji:koala.svg" },
    { label: "Тигр", url: "https://api.iconify.design/twemoji:tiger.svg" },
    { label: "Кролик", url: "https://api.iconify.design/twemoji:rabbit-face.svg" },
    { label: "Мышка", url: "https://api.iconify.design/twemoji:mouse-face.svg" },
    { label: "Обезьяна", url: "https://api.iconify.design/twemoji:monkey-face.svg" },
    { label: "Волк", url: "https://api.iconify.design/twemoji:wolf.svg" },
    { label: "Лев", url: "https://api.iconify.design/twemoji:lion.svg" },
  ];
  const programmerSkillOptions = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Express",
    "Redux",
    "Vue.js",
    "Angular",
    "HTML5",
    "CSS3",
    "Sass",
    "Tailwind CSS",
    "REST API",
    "GraphQL",
    "PostgreSQL",
    "MongoDB",
    "Docker",
    "Git",
    "CI/CD",
    "Jest",
    "C#",
    ".NET",
    "Java",
    "Spring",
    "Python",
    "Django",
    "FastAPI",
  ];
  const ukraineCityOptions = [
    "Киев",
    "Харьков",
    "Одесса",
    "Днепр",
    "Львов",
    "Запорожье",
    "Кривой Рог",
    "Николаев",
    "Мариуполь",
    "Винница",
    "Херсон",
    "Полтава",
    "Чернигов",
    "Черкассы",
    "Житомир",
    "Сумы",
    "Хмельницкий",
    "Черновцы",
    "Ровно",
    "Ивано-Франковск",
    "Тернополь",
    "Луцк",
    "Ужгород",
    "Кропивницкий",
    "Кременчуг",
    "Белая Церковь",
    "Краматорск",
    "Мелитополь",
    "Никополь",
    "Бердянск",
    "Славянск",
    "Павлоград",
    "Бровары",
    "Ирпень",
    "Буча",
    "Борисполь",
    "Каменское",
    "Каменец-Подольский",
    "Измаил",
    "Белгород-Днестровский",
    "Умань",
    "Мукачево",
    "Коломыя",
    "Ковель",
    "Дрогобыч",
    "Стрый",
    "Червоноград",
    "Бердичев",
    "Коростень",
    "Нежин",
    "Прилуки",
    "Конотоп",
    "Шостка",
    "Лубны",
    "Миргород",
    "Вознесенск",
    "Первомайск",
    "Южное",
    "Подольск",
    "Покровск",
    "Дружковка",
    "Бахмут",
    "Донецк",
    "Луганск",
    "Севастополь",
    "Симферополь",
    "Северодонецк",
    "Рубежное",
    "Лисичанск",
  ];

  const displayName = `${form.firstName} ${form.lastName}`.trim() || t("profile.defaultName", "Профиль");
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName || form.email || "profile")}`;
  const avatarSrc = pendingAvatarDataUrl || form.avatarDataUrl || defaultAvatar;
  const hasUploadedPhotoAvatar = typeof form.avatarDataUrl === "string" && form.avatarDataUrl.startsWith("data:image/");
  const selectedUkraineCity = ukraineCityOptions.includes(form.city) ? form.city : "";

  const completionPercent = Math.round(
    (
      [
        form.firstName,
        form.lastName,
        form.email,
        form.specialty,
        form.position,
        form.company,
        form.experienceFrom,
        form.experienceTo,
        form.country,
        form.city,
        form.phone,
        form.website,
        form.education,
        form.educationPeriod,
        form.about,
        skills.length ? "skills" : "",
      ].filter(Boolean).length / 16
    ) * 100
  );
  const profileViews = String(Math.max(12, completionPercent + 48));
  const postViews = String(Math.max(6, completionPercent + 17));

  const flashSaved = () => {
    setSaveHint(t("profile.saved", "Данные сохранены."));
    pushNotice(t("profile.saved", "Данные сохранены."));
    window.setTimeout(() => setSaveHint(""), 1300);
  };

  const openModal = (type, seed = {}) => {
    setModalForm((prev) => ({
      ...prev,
      ...seed,
      name: seed.name ?? displayName,
      email: seed.email ?? form.email,
    }));
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const submitModal = () => {
    if (!activeModal) return;

    if (activeModal === "newMessage") {
      const text = modalForm.message.trim();
      if (!text) return;
      const person = modalForm.name.trim() || "New contact";
      const nextChats = [{ id: id("chat"), name: person, preview: text, time: "now" }, ...homeChats];
      setHomeChats(nextChats);
      setNotifications([{ text: `Новое сообщение для ${person}`, ts: new Date().toISOString() }, ...notifications].slice(0, 24));
      pushNotice("Сообщение отправлено");
      closeModal();
      return;
    }

    if (activeModal === "recommendation") {
      const person = modalForm.name.trim() || displayName;
      setNotifications([{ text: `Запрос рекомендации отправлен: ${person}`, ts: new Date().toISOString() }, ...notifications].slice(0, 24));
      pushNotice("Запрос рекомендации отправлен");
      closeModal();
      return;
    }

    if (activeModal === "certificate") {
      const cert = modalForm.title.trim();
      if (!cert) return;
      const nextExp = [{
        title: `${cert}${modalForm.issuer.trim() ? ` · ${modalForm.issuer.trim()}` : ""}`,
        meta: modalForm.date.trim() || t("profile.notSpecifiedPeriod", "Не указан"),
      }, ...experienceItems];
      setExperienceItems(nextExp);
      persist(form, skills, nextExp);
      flashSaved();
      closeModal();
      return;
    }

    if (activeModal === "course") {
      const course = modalForm.title.trim();
      if (!course) return;
      const nextEdu = [{
        title: course,
        meta: modalForm.date.trim() || t("profile.notSpecifiedPeriod", "Не указан"),
      }, ...educationItems];
      setEducationItems(nextEdu);
      persist(form, skills, experienceItems, nextEdu);
      flashSaved();
      closeModal();
      return;
    }

    if (activeModal === "skill") {
      const value = modalForm.skill.trim();
      if (!value) return;
      if (!skills.some((item) => item.toLowerCase() === value.toLowerCase())) {
        const nextSkills = [...skills, value];
        setSkills(nextSkills);
        persist(form, nextSkills);
        flashSaved();
      }
      closeModal();
      return;
    }

    if (activeModal === "publication") {
      const title = modalForm.title.trim();
      if (!title) return;
      const nextProjects = [{ title, meta: modalForm.link.trim() || t("profile.notSpecified", "Не указана") }, ...projectItems];
      setProjectItems(nextProjects);
      persist(form, skills, experienceItems, educationItems, nextProjects);
      flashSaved();
      closeModal();
      return;
    }

    if (activeModal === "post") {
      const text = modalForm.post.trim();
      if (!text) return;
      const nextPost = { id: id("p"), author: displayName, role: form.specialty || "You", text, image: "" };
      setFeedPosts([nextPost, ...feedPosts]);
      setNotifications([{ text: "Опубликован новый пост", ts: new Date().toISOString() }, ...notifications].slice(0, 24));
      pushNotice("Пост опубликован");
      closeModal();
    }
  };

  const persist = (nextForm, nextSkills = skills, nextExp = experienceItems, nextEdu = educationItems, nextProjects = projectItems, nextResumeName = resumeName, nextResumeDataUrl = resumeDataUrl) => {
    const next = {
      ...account,
      ...nextForm,
      skills: nextSkills,
      experienceItems: nextExp,
      educationItems: nextEdu,
      projectItems: nextProjects,
      resumeName: nextResumeName,
      resumeDataUrl: nextResumeDataUrl,
    };
    setAccount(next);
    setSession({ ...(session || {}), ...next });
  };

  const onFormInput = (key, value) => {
    const next = { ...form, [key]: value };
    setForm(next);
    persist(next);
  };

  const addSkill = () => {
    const value = skillDraft.trim();
    if (!value) return;
    if (skills.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setSkillDraft("");
      return;
    }
    const nextSkills = [...skills, value];
    setSkills(nextSkills);
    setSkillDraft("");
    persist(form, nextSkills);
    flashSaved();
  };

  const removeSkill = (index) => {
    const nextSkills = skills.filter((_, idx) => idx !== index);
    setSkills(nextSkills);
    persist(form, nextSkills);
    flashSaved();
  };

  const addExperience = () => {
    const role = form.position.trim() || form.specialty.trim();
    if (!role) return;
    const period = [form.experienceFrom.trim(), form.experienceTo.trim()].filter(Boolean).join(" — ");
    const nextExp = [{ title: form.company ? `${role} · ${form.company}` : role, meta: `${period || t("profile.notSpecifiedPeriod", "Не указан")} · ${form.city || t("profile.notSpecified", "Не указана")}` }, ...experienceItems];
    setExperienceItems(nextExp);
    persist(form, skills, nextExp);
    flashSaved();
  };

  const clearExperience = () => {
    const next = { ...form, specialty: "", position: "", company: "", experienceFrom: "", experienceTo: "", city: "" };
    setForm(next);
    persist(next, skills);
    flashSaved();
  };

  const addEducation = () => {
    const school = form.education.trim();
    if (!school) return;
    const nextEdu = [{ title: school, meta: form.educationPeriod || t("profile.notSpecifiedPeriod", "Не указан") }, ...educationItems];
    setEducationItems(nextEdu);
    persist(form, skills, experienceItems, nextEdu);
    flashSaved();
  };

  const addProject = () => {
    const title = projectTitle.trim();
    if (!title) return;
    const nextProjects = [{ title, meta: projectLink.trim() || t("profile.notSpecified", "Не указана") }, ...projectItems];
    setProjectItems(nextProjects);
    setProjectTitle("");
    setProjectLink("");
    persist(form, skills, experienceItems, educationItems, nextProjects);
    flashSaved();
  };

  const onAvatarFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      pushNotice(t("profile.needImage", "Нужно выбрать изображение."));
      return;
    }
    if (file.size > 1_200_000) {
      pushNotice(t("profile.photoTooLarge", "Фото слишком большое (до 1.2MB)."));
      return;
    }
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }).catch(() => "");
    if (!dataUrl) {
      pushNotice(t("profile.photoLoadFail", "Не удалось загрузить фото."));
      return;
    }
    const next = { ...form, avatarDataUrl: dataUrl };
    setForm(next);
    setPendingAvatarDataUrl(dataUrl);
    setAvatarPickerOpen(false);
    persist(next);
    flashSaved();
  };

  const onResumeFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 1_800_000) {
      pushNotice(t("profile.resumeTooLarge", "Резюме слишком большое (до 1.8MB)."));
      return;
    }
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }).catch(() => "");
    if (!dataUrl) {
      pushNotice(t("profile.resumeLoadFail", "Не удалось загрузить резюме."));
      return;
    }
    setResumeName(file.name || "resume");
    setResumeDataUrl(dataUrl);
    persist(form, skills, experienceItems, educationItems, projectItems, file.name || "resume", dataUrl);
    flashSaved();
  };

  const removeHistoryItem = (type, index) => {
    if (type === "exp") {
      const next = experienceItems.filter((_, idx) => idx !== index);
      setExperienceItems(next);
      persist(form, skills, next);
    }
    if (type === "edu") {
      const next = educationItems.filter((_, idx) => idx !== index);
      setEducationItems(next);
      persist(form, skills, experienceItems, next);
    }
    if (type === "proj") {
      const next = projectItems.filter((_, idx) => idx !== index);
      setProjectItems(next);
      persist(form, skills, experienceItems, educationItems, next);
    }
    flashSaved();
  };

  const onThemeChange = (value) => {
    const nextTheme = value === "dark" ? "dark" : "light";
    writeToStorage("uiTheme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme === "dark" ? "dark" : "light";
    document.dispatchEvent(new CustomEvent("uithemechange", { detail: { theme: nextTheme } }));
    if (typeof window.syncThemeToggleI18n === "function") window.syncThemeToggleI18n();
    flashSaved();
  };

  const currentTheme = (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

  return (
    <AppLayout>
      <section className="lk-full-bleed">
      <main className="lk-wrap">
        <section className="lk-card">
          <div className="lk-cover"></div>
          <div className="lk-head">
            <div className="lk-avatar-wrap">
              <img className="lk-avatar" src={avatarSrc} alt="" />
              <button id="avatarPickBtn" type="button" className="lk-avatar-edit" onClick={() => { setAvatarPickerOpen((prev) => !prev); setPendingAvatarDataUrl(form.avatarDataUrl || ""); }}>
                {hasUploadedPhotoAvatar ? t("profile.avatarEdit", "Изменить аватар") : t("profile.avatarAdd", "Добавить аватар")}
              </button>
              {hasUploadedPhotoAvatar ? <button type="button" className="lk-avatar-edit lk-avatar-delete" onClick={() => { const next = { ...form, avatarDataUrl: "" }; setForm(next); setPendingAvatarDataUrl(""); persist(next); flashSaved(); }}>{t("profile.avatarRemove", "Удалить фото")}</button> : null}
              <input id="avatarInput" type="file" accept="image/*" hidden onChange={onAvatarFile} />
              {avatarPickerOpen ? (
                <div className="lk-icon-picker lk-icon-picker--header">
                  <div className="lk-icon-picker-actions">
                    <p className="lk-muted">{t("profile.pickAnimalIcon", "Выбери иконку-животное")}</p>
                    <label htmlFor="avatarInput" className="lk-file-btn">{t("profile.avatarUpload", "Загрузить фото")}</label>
                    <button type="button" className="lk-icon-save-btn" onClick={() => { const next = { ...form, avatarDataUrl: pendingAvatarDataUrl }; setForm(next); setAvatarPickerOpen(false); persist(next); flashSaved(); }}>{t("profile.avatarSaveIcon", "Сохранить иконку")}</button>
                  </div>
                  <div className="lk-icon-grid">
                    {avatarOptions.map((item) => (
                      <button key={item.url} type="button" className={pendingAvatarDataUrl === item.url ? "lk-icon-option lk-icon-option--active" : "lk-icon-option"} onClick={() => setPendingAvatarDataUrl(item.url)} aria-label={`${t("profile.pickIcon", "Выбрать иконку")}: ${item.label}`}>
                        <img src={item.url} alt="" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <h1 className="lk-name">{displayName}</h1>
            <p className="lk-sub">{t("profile.subtitle", "Заполните информацию о себе для личного кабинета")}</p>
            <div className="lk-head-actions">
              <button type="button" className="lk-head-chip lk-head-chip--primary" onClick={() => openModal("publication", { title: projectTitle, link: projectLink })}>{t("profile.openToWork", "Open to work")}</button>
              <button type="button" className="lk-head-chip" onClick={() => openModal("certificate", { title: form.position, issuer: form.company })}>{t("profile.addSection", "Add profile section")}</button>
              <button type="button" className="lk-head-chip" onClick={() => openModal("newMessage", { name: displayName, email: form.email })}>{t("profile.editContact", "Edit contact info")}</button>
            </div>
          </div>
        </section>

        <section className="lk-main">
          <article className="lk-card">
            <form className="lk-form" onSubmit={(e) => { e.preventDefault(); persist(form); flashSaved(); }}>
              <h2 className="lk-title">{t("profile.cabinetTitle", "Личный кабинет")}</h2>
              <label>{t("profile.firstNameLabel", "Имя")}<input value={form.firstName} onChange={(e) => onFormInput("firstName", e.target.value)} required /></label>
              <label>{t("profile.lastNameLabel", "Фамилия")}<input value={form.lastName} onChange={(e) => onFormInput("lastName", e.target.value)} required /></label>
              <label>{t("profile.emailLabel", "Почта")}<input type="email" value={form.email} onChange={(e) => onFormInput("email", e.target.value)} required /></label>
              <label>{t("profile.specialtyLabel", "Специальность")}<input value={form.specialty} onChange={(e) => onFormInput("specialty", e.target.value)} /></label>
              <div className="lk-inline">
                <label>{t("profile.positionLabel", "Текущая должность")}<input value={form.position} onChange={(e) => onFormInput("position", e.target.value)} /></label>
                <label>{t("profile.companyLabel", "Компания")}<input value={form.company} onChange={(e) => onFormInput("company", e.target.value)} /></label>
              </div>
              <div className="lk-inline">
                <label>{t("profile.experienceFromLabel", "Начало опыта")}<input value={form.experienceFrom} onChange={(e) => onFormInput("experienceFrom", e.target.value)} /></label>
                <label>{t("profile.experienceToLabel", "Окончание опыта")}<input value={form.experienceTo} onChange={(e) => onFormInput("experienceTo", e.target.value)} /></label>
              </div>
              <label>
                {t("profile.countryLabel", "Страна")}
                <select value={form.country || "Украина"} onChange={(e) => onFormInput("country", e.target.value)}>
                  <option value="Украина">{t("profile.countryUkraine", "Украина")}</option>
                </select>
              </label>
              <label>
                {t("profile.cityLabel", "Город")}
                <select value={selectedUkraineCity} onChange={(e) => onFormInput("city", e.target.value)}>
                  <option value="">{t("profile.selectCity", "Выберите город")}</option>
                  {ukraineCityOptions.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </label>
              <div className="lk-inline">
                <label>{t("profile.phoneLabel", "Телефон")}<input value={form.phone} onChange={(e) => onFormInput("phone", e.target.value)} /></label>
                <label>{t("profile.websiteLabel", "Сайт")}<input value={form.website} onChange={(e) => onFormInput("website", e.target.value)} /></label>
              </div>
              <div className="lk-inline">
                <label>{t("profile.educationLabel", "Учебное заведение")}<input value={form.education} onChange={(e) => onFormInput("education", e.target.value)} /></label>
                <label>{t("profile.educationPeriodLabel", "Период обучения")}<input value={form.educationPeriod} onChange={(e) => onFormInput("educationPeriod", e.target.value)} /></label>
              </div>
              <label>{t("profile.aboutLabel", "О себе")}<textarea value={form.about} onChange={(e) => onFormInput("about", e.target.value)} /></label>
              <label>
                {t("profile.resumeLabel", "Резюме")}
                <div className="lk-file-row">
                  <label htmlFor="resumeInput" className="lk-file-btn">{t("profile.uploadFile", "Загрузить файл")}</label>
                  <button type="button" className="lk-file-btn" onClick={() => { setResumeName(""); setResumeDataUrl(""); persist(form, skills, experienceItems, educationItems, projectItems, "", ""); flashSaved(); }}>{t("profile.clear", "Очистить")}</button>
                  <input id="resumeInput" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden onChange={onResumeFile} />
                </div>
                <p className="lk-muted">{resumeName || t("profile.resumeEmpty", "Файл не загружен")}</p>
                {resumeDataUrl && resumeName ? <a className="lk-line" href={resumeDataUrl} download={resumeName}>{t("profile.resumeDownload", "Скачать загруженное резюме")}</a> : null}
              </label>
              <label>
                {t("profile.skillsLabel", "Навыки")}
                <div className="skills-editor">
                  <div className="skills-row">
                    <input
                      list="profile-programmer-skills"
                      value={skillDraft}
                      onChange={(e) => setSkillDraft(e.target.value)}
                      placeholder={t("profile.selectSkill", "Выберите навык программиста")}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    />
                    <datalist id="profile-programmer-skills">
                      {programmerSkillOptions.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                    <button type="button" className="skills-add-btn" onClick={() => openModal("skill", { skill: skillDraft })}>{t("profile.addSkill", "Добавить")}</button>
                  </div>
                  <div className="skills-chips">
                    {skills.map((skill, index) => (
                      <span key={`${skill}-${index}`} className="skill-chip">{skill}<button type="button" onClick={() => removeSkill(index)}>×</button></span>
                    ))}
                  </div>
                  {!skills.length ? <p className="skills-empty">{t("profile.skillsEmpty", "Пока навыков нет.")}</p> : null}
                </div>
              </label>
              <button className="lk-cta" type="submit">{t("profile.cta", "Добавьте информацию о себе, чтобы покорить мир")}</button>
              <p className="lk-save-hint">{saveHint}</p>
            </form>
          </article>

          <aside className="lk-card lk-side">
            <h3 className="lk-title">{t("profile.progressTitle", "Прогресс профиля")}</h3>
            <p className="lk-muted">{`${completionPercent}% ${t("profile.progressFilledWord", "заполнено")}`}</p>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${completionPercent}%` }}></div></div>
            <p className="lk-muted">{t("profile.progressHint", "Чем больше данных, тем лучше ваш профиль выглядит в системе.")}</p>
            <div className="lk-links">
              <NavLink to="/home">{t("profile.linkHome", "Главная лента")}</NavLink>
              <NavLink to="/auth">{t("profile.linkBackReg", "Назад к регистрации")}</NavLink>
            </div>
            <section className="lk-settings" aria-label="Настройки аккаунта">
              <h4>{t("profile.settingsTitle", "Мини-настройки аккаунта")}</h4>
              <label>
                <span>{t("profile.settingsLang", "Язык интерфейса")}</span>
                <select data-ui-lang defaultValue={window.getUiLang ? window.getUiLang() : "ru"}>
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                  <option value="uk">Українська</option>
                </select>
              </label>
              <label>
                <span>{t("profile.settingsTheme", "Тема")}</span>
                <select value={currentTheme} onChange={(e) => onThemeChange(e.target.value)}>
                  <option value="light">{t("profile.themeLight", "Светлая")}</option>
                  <option value="dark">{t("profile.themeDark", "Темная")}</option>
                </select>
              </label>
              <label>
                <span>{t("profile.settingsVisibility", "Видимость профиля")}</span>
                <select value={visibility} onChange={(e) => { setVisibility(e.target.value); writeToStorage("uiProfileVisibility", e.target.value); flashSaved(); }}>
                  <option value="public">{t("profile.visibilityPublic", "Публичный")}</option>
                  <option value="contacts">{t("profile.visibilityContacts", "Только контакты")}</option>
                  <option value="private">{t("profile.visibilityPrivate", "Только я")}</option>
                </select>
              </label>
            </section>
          </aside>
        </section>

        <section className="lk-rows">
          <article className="lk-card lk-row-card">
            <div className="lk-row-head">
              <h3 className="lk-row-title">{t("profile.analyticsTitle", "Analytics")}</h3>
              <div className="lk-row-actions">
                <button type="button" className="lk-icon-btn" onClick={() => openModal("recommendation", { name: displayName, email: form.email })}>+</button>
              </div>
            </div>
            <div className="metrics">
              <div className="metric"><strong>{profileViews}</strong><span>{t("profile.metricViews", "Просмотры профиля")}</span></div>
              <div className="metric"><strong>{postViews}</strong><span>{t("profile.metricPostViews", "Просмотры постов")}</span></div>
              <div className="metric"><strong>{`${completionPercent}%`}</strong><span>{t("profile.metricCompletion", "Заполненность профиля")}</span></div>
            </div>
          </article>

          <article className="lk-card lk-row-card">
            <div className="lk-row-head">
              <h3 className="lk-row-title">{t("profile.experienceTitle", "Experience")}</h3>
              <div className="lk-row-actions">
                <button type="button" className="lk-icon-btn" onClick={() => openModal("certificate", { title: form.position, issuer: form.company, date: [form.experienceFrom, form.experienceTo].filter(Boolean).join(" — ") })}>+</button>
                <button type="button" className="lk-icon-btn" onClick={clearExperience}>✕</button>
              </div>
            </div>
            <div className="lk-open-card">
              <p className="lk-open-title">{t("profile.expOpenTitle", "Покажите достижения и опыт")}</p>
              <p className="lk-open-text">{t("profile.expOpenText", "Добавьте позицию, компанию и период работы, чтобы профиль выглядел сильнее.")}</p>
            </div>
            <p className="lk-line">{`${t("profile.specialtyPrefix", "Специальность")}: `}<strong>{form.specialty || t("profile.notSpecified", "Не указана")}</strong></p>
            <p className="lk-line">{`${t("profile.positionPrefix", "Позиция")}: `}<strong>{form.position || t("profile.notSpecified", "Не указана")}</strong></p>
            <p className="lk-line">{`${t("profile.companyPrefix", "Компания")}: `}<strong>{form.company || t("profile.notSpecified", "Не указана")}</strong></p>
            <p className="lk-line">{`${t("profile.periodPrefix", "Период")}: `}<strong>{[form.experienceFrom, form.experienceTo].filter(Boolean).join(" — ") || t("profile.notSpecifiedPeriod", "Не указан")}</strong></p>
            <p className="lk-line">{`${t("profile.locationPrefix", "Локация")}: `}<strong>{form.city || t("profile.notSpecified", "Не указана")}</strong></p>
            <div className="lk-history">
              {experienceItems.map((item, index) => (
                <div key={`${item.title}-${index}`} className="lk-history__item">
                  <div>
                    <p className="lk-history__title">{item.title}</p>
                    <p className="lk-history__meta">{item.meta}</p>
                  </div>
                  <button type="button" className="lk-icon-btn" onClick={() => removeHistoryItem("exp", index)}>✕</button>
                </div>
              ))}
            </div>
          </article>

          <article className="lk-card lk-row-card">
            <div className="lk-row-head">
              <h3 className="lk-row-title">{t("profile.educationTitle", "Education")}</h3>
              <div className="lk-row-actions">
                <button type="button" className="lk-icon-btn" onClick={() => openModal("course", { title: form.education, date: form.educationPeriod })}>+</button>
                <button type="button" className="lk-icon-btn" onClick={() => pushNotice(t("profile.saved", "Данные сохранены."))}>✎</button>
              </div>
            </div>
            <p className="lk-line">{`${t("profile.educationPrefix", "Учебное заведение")}: `}<strong>{form.education || t("profile.notSpecifiedN", "Не указано")}</strong></p>
            <p className="lk-line">{`${t("profile.periodPrefix", "Период")}: `}<strong>{form.educationPeriod || t("profile.notSpecifiedPeriod", "Не указан")}</strong></p>
            <div className="lk-history">
              {educationItems.map((item, index) => (
                <div key={`${item.title}-${index}`} className="lk-history__item">
                  <div>
                    <p className="lk-history__title">{item.title}</p>
                    <p className="lk-history__meta">{item.meta}</p>
                  </div>
                  <button type="button" className="lk-icon-btn" onClick={() => removeHistoryItem("edu", index)}>✕</button>
                </div>
              ))}
            </div>
          </article>

          <article className="lk-card lk-row-card">
            <div className="lk-row-head">
              <h3 className="lk-row-title">{t("profile.projectsTitle", "Projects")}</h3>
            </div>
            <div className="lk-inline">
              <label>{t("profile.projectTitleLabel", "Название проекта")}<input value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder={t("profile.phProjectTitle", "Например: Job Board Redesign")} /></label>
              <label>{t("profile.projectLinkLabel", "Ссылка")}<input value={projectLink} onChange={(e) => setProjectLink(e.target.value)} placeholder={t("profile.phProjectLink", "https://github.com/...")} /></label>
            </div>
            <div className="lk-head-actions">
              <button type="button" className="lk-head-chip lk-head-chip--primary" onClick={() => openModal("publication", { title: projectTitle, link: projectLink })}>{t("profile.addProject", "Добавить проект")}</button>
              <button type="button" className="lk-head-chip" onClick={() => openModal("post", { post: "" })}>Write post</button>
            </div>
            <div className="lk-history">
              {projectItems.map((item, index) => (
                <div key={`${item.title}-${index}`} className="lk-history__item">
                  <div>
                    <p className="lk-history__title">{item.title}</p>
                    <p className="lk-history__meta">{item.meta}</p>
                  </div>
                  <button type="button" className="lk-icon-btn" onClick={() => removeHistoryItem("proj", index)}>✕</button>
                </div>
              ))}
            </div>
          </article>

          <article className="lk-card lk-row-card">
            <div className="lk-row-head">
              <h3 className="lk-row-title">{t("profile.skillsTitle", "Skills")}</h3>
              <div className="lk-row-actions">
                <button type="button" className="lk-icon-btn" onClick={() => { setSkills([]); persist(form, []); flashSaved(); }}>✕</button>
              </div>
            </div>
            <div className="skills-preview">
              {skills.length ? skills.map((skill, index) => <span key={`${skill}-${index}`} className="skill-pill">{skill}</span>) : <p className="lk-line">{t("profile.skillsPreviewEmpty", "Навыки пока не добавлены.")}</p>}
            </div>
          </article>
        </section>
        <footer className="lk-footer">{t("profile.footer", "LinkUp • Личный кабинет пользователя")}</footer>
        {activeModal ? (
          <div className="spa-modal-root" onClick={closeModal}>
            <section className="spa-modal profile-action-modal" onClick={(e) => e.stopPropagation()}>
              <div className="spa-modal__head">
                <h3>
                  {activeModal === "newMessage" ? "Новое сообщение" : null}
                  {activeModal === "recommendation" ? "Запрос рекомендательного письма" : null}
                  {activeModal === "certificate" ? "Добавление сертификата и лицензии" : null}
                  {activeModal === "course" ? "Добавление курса" : null}
                  {activeModal === "skill" ? "Добавление навыка" : null}
                  {activeModal === "publication" ? "Новая публикация" : null}
                  {activeModal === "post" ? "Write post" : null}
                </h3>
                <button type="button" onClick={closeModal}>×</button>
              </div>
              <div className="profile-modal-grid">
                {activeModal === "newMessage" || activeModal === "recommendation" ? (
                  <>
                    <input value={modalForm.name} onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })} placeholder="Name" />
                    <input value={modalForm.email} onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })} placeholder="Email" />
                    <textarea value={modalForm.message} onChange={(e) => setModalForm({ ...modalForm, message: e.target.value })} placeholder="Message" />
                  </>
                ) : null}
                {activeModal === "certificate" || activeModal === "course" || activeModal === "publication" ? (
                  <>
                    <input value={modalForm.title} onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })} placeholder="Title" />
                    <input value={modalForm.issuer} onChange={(e) => setModalForm({ ...modalForm, issuer: e.target.value })} placeholder="Issuer / Organization" />
                    <input value={modalForm.date} onChange={(e) => setModalForm({ ...modalForm, date: e.target.value })} placeholder="Date / Period" />
                    <input value={modalForm.link} onChange={(e) => setModalForm({ ...modalForm, link: e.target.value })} placeholder="Link (optional)" />
                  </>
                ) : null}
                {activeModal === "skill" ? (
                  <input value={modalForm.skill} onChange={(e) => setModalForm({ ...modalForm, skill: e.target.value })} placeholder="Skill" />
                ) : null}
                {activeModal === "post" ? (
                  <textarea value={modalForm.post} onChange={(e) => setModalForm({ ...modalForm, post: e.target.value })} placeholder="What do you want to talk about?" />
                ) : null}
              </div>
              <div className="profile-modal-actions">
                <button type="button" onClick={closeModal}>Cancel</button>
                <button type="button" onClick={submitModal}>Submit</button>
              </div>
            </section>
          </div>
        ) : null}
      </main>
      </section>
    </AppLayout>
  );
}

function VacanciesPage() {
  const { account } = useAuth();
  const { applications, setApplications, savedJobs, setSavedJobs, notifications, setNotifications, homeChats } = useData();
  const { pushNotice } = useUi();
  const JOBS = useMemo(() => ([
    {
      id: "retail-associate-walmart",
      role: "Retail Associate",
      company: "Walmart",
      location: "Denison, AL",
      type: "part-time",
      level: "entry",
      remote: false,
      salaryMinK: 14,
      salaryMaxK: 22,
      postedDays: 14,
      postedLabel: "2 weeks ago",
      desc: "Работа с клиентами в торговом зале, помощь с выбором товаров, оформление выкладки и поддержка стандартов сервиса.",
      tags: ["Part-time", "Entry level", "On-site", "Customer service"],
      logoSeed: "Walmart",
      group: "top",
    },
    {
      id: "product-analyst-airtable",
      role: "Product Analyst",
      company: "Airtable",
      location: "Remote",
      type: "full-time",
      level: "middle",
      remote: true,
      salaryMinK: 85,
      salaryMaxK: 110,
      postedDays: 7,
      postedLabel: "1 week ago",
      desc: "Анализ продуктовых метрик, построение дашбордов и поиск точек роста в воронке. Работа в связке с PM, Design и Engineering.",
      tags: ["Full-time", "Middle", "Remote", "SQL + BI"],
      logoSeed: "Airtable",
      group: "top",
    },
    {
      id: "financial-advisor-wealthsimple",
      role: "Financial Advisor",
      company: "Wealthsimple",
      location: "Toronto",
      type: "full-time",
      level: "middle",
      remote: false,
      salaryMinK: 70,
      salaryMaxK: 95,
      postedDays: 3,
      postedLabel: "3 days ago",
      desc: "Консультирование клиентов по финансовым продуктам, сопровождение портфелей и персональные рекомендации по инвестиционной стратегии.",
      tags: ["Full-time", "Middle", "On-site", "Client advisory"],
      logoSeed: "Wealthsimple",
      group: "top",
    },
    {
      id: "brand-designer-dribbble",
      role: "Brand Designer",
      company: "Dribbble",
      location: "Remote",
      type: "contract",
      level: "senior",
      remote: true,
      salaryMinK: 90,
      salaryMaxK: 120,
      postedDays: 5,
      postedLabel: "5 days ago",
      desc: "Разработка визуальной системы бренда, дизайн ключевых маркетинговых материалов и поддержка единого стиля на всех каналах.",
      tags: ["Contract", "Senior", "Remote", "Brand systems"],
      logoSeed: "Dribbble",
      group: "design",
    },
    {
      id: "visual-designer-freshworks",
      role: "Visual Designer",
      company: "Freshworks",
      location: "San Mateo, CA",
      type: "full-time",
      level: "middle",
      remote: false,
      salaryMinK: 78,
      salaryMaxK: 102,
      postedDays: 7,
      postedLabel: "1 week ago",
      desc: "Подготовка UI-визуалов для продуктовых и маркетинговых задач, работа с дизайн-системой и улучшение пользовательских сценариев.",
      tags: ["Full-time", "Middle", "On-site", "Figma"],
      logoSeed: "Freshworks",
      group: "design",
    },
  ]), []);

  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobLevel, setJobLevel] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [hubTab, setHubTab] = useState("applied");
  const [messageTab, setMessageTab] = useState("sorted");
  const [messageSearch, setMessageSearch] = useState("");
  const [dismissedIds, setDismissedIds] = useState([]);
  const [queriesVisible, setQueriesVisible] = useState(true);
  const [applyForm, setApplyForm] = useState({
    fullName: `${account?.firstName || ""} ${account?.lastName || ""}`.trim(),
    email: account?.email || "",
    phone: account?.phone || "",
    about: "",
    resumeName: account?.resumeName || "",
    resumeDataUrl: account?.resumeDataUrl || "",
  });

  const filtersApplied = JOBS.filter((job) => {
    const hay = `${job.role} ${job.company} ${job.location}`.toLowerCase();
    if (q.trim() && !hay.includes(q.trim().toLowerCase())) return false;
    if (location.trim() && !job.location.toLowerCase().includes(location.trim().toLowerCase())) return false;
    if (jobType && job.type !== jobType) return false;
    if (jobLevel && job.level !== jobLevel) return false;
    if (remoteOnly && !job.remote) return false;
    if (salaryMin && job.salaryMaxK < Number(salaryMin)) return false;
    if (dismissedIds.includes(job.id)) return false;
    return true;
  });
  const rows = [...filtersApplied].sort((a, b) => {
    if (sortBy === "salary_desc") return b.salaryMaxK - a.salaryMaxK;
    if (sortBy === "salary_asc") return a.salaryMaxK - b.salaryMaxK;
    if (sortBy === "newest") return a.postedDays - b.postedDays;
    return 0;
  });
  const topRows = rows.filter((job) => job.group === "top");
  const designRows = rows.filter((job) => job.group === "design");
  const appliedRows = Object.values(applications || {});
  const savedRows = Object.values(savedJobs || {});

  const visibleMessages = homeChats.filter((chat, index) => {
    const matchesSearch = String(chat.name || "").toLowerCase().includes(messageSearch.toLowerCase());
    const inTab = messageTab === "sorted" ? index % 2 === 0 : index % 2 === 1;
    return matchesSearch && inTab;
  });

  const onQuickChip = (kind) => {
    if (kind === "frontend") setQ("frontend");
    if (kind === "designer") setQ("designer");
    if (kind === "analyst") setQ("analyst");
    if (kind === "remote") {
      setRemoteOnly(true);
      setLocation("Remote");
    }
  };

  const applySearch = () => {
    pushNotice(`Фильтры применены: ${rows.length}`);
  };

  const resetSearch = () => {
    setQ("");
    setLocation("");
    setJobType("");
    setJobLevel("");
    setSalaryMin("");
    setSortBy("relevance");
    setRemoteOnly(false);
  };

  const openApply = (job) => {
    setSelectedJob(job);
    setApplyForm((prev) => ({
      ...prev,
      fullName: `${account?.firstName || ""} ${account?.lastName || ""}`.trim() || prev.fullName,
      email: account?.email || prev.email,
      phone: account?.phone || prev.phone,
      resumeName: account?.resumeName || prev.resumeName,
      resumeDataUrl: account?.resumeDataUrl || prev.resumeDataUrl,
    }));
  };

  const toggleSave = (job) => {
    const next = { ...savedJobs };
    if (next[job.id]) {
      delete next[job.id];
      pushNotice(t("vac.unsaved", "Вакансия удалена из сохранённых"));
    } else {
      next[job.id] = job;
      pushNotice(t("vac.savedNotice", "Вакансия сохранена"));
    }
    setSavedJobs(next);
  };
  const submitApply = () => {
    if (!selectedJob) return;
    const next = { ...applications };
    next[selectedJob.id] = {
      id: selectedJob.id,
      role: selectedJob.role,
      company: selectedJob.company,
      location: selectedJob.location,
      fullName: applyForm.fullName,
      email: applyForm.email,
      phone: applyForm.phone,
      about: applyForm.about,
      resumeName: applyForm.resumeName || account?.resumeName || "—",
      submittedAt: new Date().toISOString(),
    };
    setApplications(next);
    setSelectedJob(null);
    setNotifications([{ text: `Отклик отправлен: ${selectedJob.role}`, ts: new Date().toISOString() }, ...notifications].slice(0, 24));
    pushNotice(`${t("vac.applyDone", "Отклик отправлен")}: ${selectedJob.role}`);
  };

  const onUploadResume = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }).catch(() => "");
    if (!dataUrl) {
      pushNotice("Не удалось загрузить файл");
      return;
    }
    setApplyForm((prev) => ({ ...prev, resumeName: file.name || "resume", resumeDataUrl: dataUrl }));
  };

  const dismissJob = (jobId) => {
    setDismissedIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));
  };

  const renderJobRow = (job) => {
    const saved = Boolean(savedJobs[job.id]);
    const applied = Boolean(applications[job.id]);
    return (
      <li key={job.id} className="vac-job-row">
        <img className="vac-job-row__logo" src={`https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(job.logoSeed)}`} width="44" height="44" alt="" />
        <div className="vac-job-row__main">
          <p className="vac-job-row__title">{job.role} — {job.company} — {job.location}</p>
          <p className="vac-job-row__salary">${job.salaryMinK}k — ${job.salaryMaxK}k / year</p>
          <p className="vac-job-row__meta">{job.postedLabel}</p>
          <p className="vac-job-row__desc">{job.desc}</p>
          <div className="vac-job-row__tags">
            {job.tags.map((tag) => <span key={tag} className="vac-job-row__tag">{tag}</span>)}
          </div>
          <div className="vac-job-row__actions">
            <a className="vac-job-row__cta" href="#" onClick={(e) => { e.preventDefault(); if (!applied) openApply(job); }}>
              {applied ? t("vac.applied", "Application sent") : t("vac.apply", "Откликнуться")}
            </a>
            <button type="button" className={saved ? "vac-job-row__save vac-job-row__save--active" : "vac-job-row__save"} onClick={() => toggleSave(job)}>
              {saved ? t("vac.saved", "Saved") : t("vac.save", "Сохранить")}
            </button>
          </div>
        </div>
        <button type="button" className="vac-job-row__dismiss" onClick={() => dismissJob(job.id)} aria-label="dismiss">×</button>
      </li>
    );
  };

  return (
    <AppLayout>
      <div className="home-shell home-shell--vacancies home-shell--jobs">
        <aside className="home-col-left home-card vac-jobs-sidebar">
          <nav className="vac-jobs-nav">
            <a className="vac-jobs-nav__link" href="#" onClick={(e) => { e.preventDefault(); pushNotice("Открыты параметры поиска"); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
              <span>{t("vac.params", "Параметры")}</span>
            </a>
            <a className="vac-jobs-nav__link" href="#" onClick={(e) => { e.preventDefault(); pushNotice("Раздел ваших вакансий будет добавлен"); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" /></svg>
              <span>{t("vac.mine", "Мои вакансии")}</span>
            </a>
          </nav>
          <button type="button" className="vac-jobs-post" onClick={() => pushNotice("Форма публикации вакансии откроется в следующем обновлении")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" /></svg>
            <span>{t("vac.post", "Разместить вакансию")}</span>
          </button>
        </aside>

        <main className="home-col-feed vac-jobs-feed">
          <section className="home-card vac-advanced-search" id="vacAdvancedSearch">
            <header className="vac-advanced-search__head">
              <h2 className="vac-advanced-search__title">Расширенный поиск вакансий</h2>
              <p className="vac-advanced-search__subtitle">Настройте фильтры как в LinkedIn: роль, локация, тип работы, уровень и зарплата.</p>
            </header>
            <form className="vac-advanced-search__form" onSubmit={(e) => { e.preventDefault(); applySearch(); }}>
              <label className="vac-field vac-field--query">Ключевые слова<input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Например: Frontend Developer, Product Analyst" /></label>
              <label className="vac-field vac-field--location">Локация<input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote, Toronto, San Mateo" /></label>
              <label className="vac-field">Тип занятости
                <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
                  <option value="">Любой</option><option value="full-time">Полная занятость</option><option value="part-time">Частичная занятость</option><option value="contract">Контракт</option><option value="internship">Стажировка</option>
                </select>
              </label>
              <label className="vac-field">Уровень
                <select value={jobLevel} onChange={(e) => setJobLevel(e.target.value)}>
                  <option value="">Любой</option><option value="entry">Junior / Entry</option><option value="middle">Middle</option><option value="senior">Senior</option><option value="lead">Lead</option>
                </select>
              </label>
              <label className="vac-field vac-field--salary">Мин. зарплата (k $/year)<input type="number" min="0" step="1" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="Например: 80" /></label>
              <label className="vac-field vac-field--sort">Сортировка
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="relevance">По релевантности</option>
                  <option value="salary_desc">По зарплате ↓</option>
                  <option value="salary_asc">По зарплате ↑</option>
                  <option value="newest">Сначала новые</option>
                </select>
              </label>
              <label className="vac-advanced-search__checkbox"><input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} /><span>Только удалёнка</span></label>
              <div className="vac-advanced-search__actions">
                <button type="submit" className="vac-advanced-search__btn vac-advanced-search__btn--primary">Применить</button>
                <button type="button" className="vac-advanced-search__btn" onClick={resetSearch}>Сбросить</button>
              </div>
            </form>
            <div className="vac-advanced-search__quick">
              <button type="button" className="vac-quick-chip" onClick={() => onQuickChip("frontend")}>Frontend</button>
              <button type="button" className="vac-quick-chip" onClick={() => onQuickChip("designer")}>Designer</button>
              <button type="button" className="vac-quick-chip" onClick={() => onQuickChip("analyst")}>Analyst</button>
              <button type="button" className="vac-quick-chip" onClick={() => onQuickChip("remote")}>Remote</button>
            </div>
            <p className="vac-advanced-search__stats">Найдено: {rows.length} вакансий</p>
          </section>

          <section className="home-card vac-job-card">
            <header className="vac-job-card__header">
              <h2 className="vac-job-card__title">{t("vac.card1Title", "Подборка лучших вакансий")}</h2>
              <p className="vac-job-card__subtitle">{t("vac.card1Sub", "С учётом профиля, настроек и активности: отклики, поиск и сохранения")}</p>
            </header>
            <ul className="vac-job-list">{topRows.map(renderJobRow)}</ul>
            <a className="vac-job-card__footer-link" href="#" onClick={(e) => { e.preventDefault(); pushNotice("Показаны все вакансии в выдаче"); }}><span>{t("vac.showAll", "Показать все")}</span> <span aria-hidden="true">→</span></a>
          </section>

          {queriesVisible ? (
            <section className="home-card vac-job-card vac-job-card--queries" id="vacRecommendedQueries">
              <button type="button" className="vac-job-card__close" onClick={() => setQueriesVisible(false)} aria-label="close">×</button>
              <h2 className="vac-job-card__title vac-job-card__title--sm">{t("vac.queriesTitle", "Рекомендуемые поисковые запросы")}</h2>
              <div className="vac-query-pills">
                {["marketing manager", "hr", "legal", "sales", "google", "analyst", "amazon"].map((value) => (
                  <a key={value} className="vac-query-pill" href="#" onClick={(e) => { e.preventDefault(); setQ(value); }}>{value}</a>
                ))}
              </div>
            </section>
          ) : null}

          <section className="home-card vac-job-card">
            <header className="vac-job-card__header">
              <h2 className="vac-job-card__title">{t("vac.roleTitle", "Графический дизайнер")}</h2>
              <p className="vac-job-card__subtitle">{t("vac.roleSub", "Удалённо · США")}</p>
            </header>
            <ul className="vac-job-list">{designRows.map(renderJobRow)}</ul>
            <a className="vac-job-card__footer-link" href="#" onClick={(e) => { e.preventDefault(); pushNotice("Показаны все дизайнерские вакансии"); }}><span>{t("vac.showAll", "Показать все")}</span> <span aria-hidden="true">→</span></a>
          </section>

          {!rows.length ? (
            <section className="home-card vac-no-results">
              <h3 className="vac-no-results__title">Ничего не найдено</h3>
              <p className="vac-no-results__text">Попробуйте ослабить фильтры, изменить локацию или снизить минимальную зарплату.</p>
            </section>
          ) : null}

          <section className="home-card vac-user-hub" aria-label="Ваша активность">
            <header className="vac-user-hub__head">
              <h2 className="vac-user-hub__title">{t("vac.myActivity", "Моя активность")}</h2>
              <div className="vac-user-hub__tabs" role="tablist">
                <button type="button" className={hubTab === "applied" ? "vac-user-hub__tab vac-user-hub__tab--active" : "vac-user-hub__tab"} role="tab" aria-selected={hubTab === "applied"} onClick={() => setHubTab("applied")}>{t("vac.myApplications", "Мои отклики")}</button>
                <button type="button" className={hubTab === "saved" ? "vac-user-hub__tab vac-user-hub__tab--active" : "vac-user-hub__tab"} role="tab" aria-selected={hubTab === "saved"} onClick={() => setHubTab("saved")}>{t("vac.savedJobs", "Сохранённые")}</button>
              </div>
            </header>
            {hubTab === "applied" ? (
              appliedRows.length ? (
                <ul className="vac-user-hub__list">
                  {appliedRows.map((item) => <li key={item.id}>{item.role} — {item.company} <span className="spa-muted">({item.location})</span></li>)}
                </ul>
              ) : <p className="vac-user-hub__empty">{t("vac.myApplicationsEmpty", "Вы ещё не отправляли отклики.")}</p>
            ) : (
              savedRows.length ? (
                <ul className="vac-user-hub__list">
                  {savedRows.map((item) => <li key={item.id}>{item.role} — {item.company} <span className="spa-muted">({item.location})</span></li>)}
                </ul>
              ) : <p className="vac-user-hub__empty">{t("vac.savedJobsEmpty", "Пока нет сохранённых вакансий.")}</p>
            )}
          </section>
        </main>

        <aside id="homeMessagesWidget" className="home-col-right home-card home-messages">
          <div className="home-messages__head">
            <h2 className="home-messages__title">{t("widget.title", "Messages")}</h2>
          </div>
          <div id="homeMessagesWidgetBody" className="home-messages__body">
            <input className="home-messages__search" type="search" value={messageSearch} onChange={(e) => setMessageSearch(e.target.value)} placeholder={t("widget.searchPh", "Search messages")} />
            <div className="home-messages__tabs" role="tablist">
              <button type="button" className={messageTab === "sorted" ? "home-messages__tab home-messages__tab--active" : "home-messages__tab"} role="tab" aria-selected={messageTab === "sorted"} onClick={() => setMessageTab("sorted")}>{t("widget.tabSorted", "Sorted")}</button>
              <button type="button" className={messageTab === "other" ? "home-messages__tab home-messages__tab--active" : "home-messages__tab"} role="tab" aria-selected={messageTab === "other"} onClick={() => setMessageTab("other")}>{t("widget.tabOther", "Other")}</button>
            </div>
            {visibleMessages.length ? (
              <div className="msg-list">
                {visibleMessages.map((chat) => (
                  <p key={chat.id}>{chat.name}</p>
                ))}
              </div>
            ) : (
              <div className="home-messages__empty">
                <p>{t("widget.empty", "No messages yet. Contact a member and start a discussion.")}</p>
                <NavLink to="/chat" className="home-messages__cta">{t("widget.cta", "Send a message")}</NavLink>
              </div>
            )}
          </div>
        </aside>
      </div>

      {selectedJob ? (
        <div id="vacApplyModal" className="vac-apply-modal">
          <div className="vac-apply-modal__backdrop" onClick={() => setSelectedJob(null)}></div>
          <section className="vac-apply-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="vacApplyTitle">
            <button type="button" className="vac-apply-modal__close" onClick={() => setSelectedJob(null)} aria-label="Закрыть">×</button>
            <header className="vac-apply-modal__head">
              <h3 id="vacApplyTitle" className="vac-apply-modal__title">{t("vac.applyModalTitle", "Быстрый отклик")}</h3>
              <p className="vac-apply-modal__subtitle">{selectedJob.role} — {selectedJob.company}</p>
            </header>
            <form className="vac-apply-modal__form" onSubmit={(e) => { e.preventDefault(); submitApply(); }}>
              <label className="vac-apply-modal__field"><span>{t("vac.applyName", "Имя и фамилия")}</span><input value={applyForm.fullName} onChange={(e) => setApplyForm({ ...applyForm, fullName: e.target.value })} required /></label>
              <label className="vac-apply-modal__field"><span>{t("vac.applyEmail", "Email")}</span><input type="email" value={applyForm.email} onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })} required /></label>
              <label className="vac-apply-modal__field"><span>{t("vac.applyPhone", "Телефон")}</span><input value={applyForm.phone} onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })} /></label>
              <label className="vac-apply-modal__field"><span>{t("vac.applyAbout", "Почему вы подходите")}</span><textarea rows="4" value={applyForm.about} onChange={(e) => setApplyForm({ ...applyForm, about: e.target.value })} placeholder={t("vac.applyAboutPh", "Коротко расскажите о релевантном опыте...")}></textarea></label>
              <div className="vac-apply-modal__resume">
                <p className="vac-apply-modal__resume-title">{t("vac.applyResumeTitle", "Резюме")}</p>
                <p className="vac-apply-modal__resume-name">{applyForm.resumeName || t("vac.applyResumeEmpty", "Файл не выбран")}</p>
                <div className="vac-apply-modal__resume-actions">
                  <button type="button" className="vac-apply-modal__btn" onClick={() => setApplyForm({ ...applyForm, resumeName: account?.resumeName || "", resumeDataUrl: account?.resumeDataUrl || "" })}>{t("vac.applyUseSaved", "Использовать сохраненное")}</button>
                  <label className="vac-apply-modal__btn vac-apply-modal__btn--secondary">{t("vac.applyUpload", "Загрузить новый файл")}<input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden onChange={onUploadResume} /></label>
                </div>
              </div>
              <div className="vac-apply-modal__actions">
                <button type="button" className="vac-apply-modal__btn vac-apply-modal__btn--ghost" onClick={() => setSelectedJob(null)}>{t("vac.applyCancel", "Отмена")}</button>
                <button type="submit" className="vac-apply-modal__btn vac-apply-modal__btn--primary">{t("vac.applySubmit", "Отправить отклик")}</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </AppLayout>
  );
}

function ChatPage() {
  const { homeChats } = useData();
  const [archivedPeers, setArchivedPeers] = useState(() => readJsonSafe("chatArchivedPeers", []));
  const [tab, setTab] = useState("inbox");
  const defaultPeers = [
    { id: "marcus", name: "Marcus Dias", preview: t("chat.previewMarcus", "Отлично, тогда до встречи!") },
    { id: "alena", name: "Alena Curtis", preview: t("chat.previewAlena", "Можем перенести звонок?") },
    { id: "abram", name: "Abram Lipshutz", preview: t("chat.previewAbram", "Спасибо за фидбек по презентации.") },
  ];
  const peers = [...defaultPeers, ...homeChats.filter((c) => !defaultPeers.some((p) => p.id === window.spaStorage.normalizeId(c.id))).map((c) => ({
    id: window.spaStorage.normalizeId(c.id),
    name: c.name || c.id,
    preview: c.preview || "",
  }))];
  const [activePeer, setActivePeer] = useState(peers[0]?.id || "marcus");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [threads, setThreads] = useState({
    marcus: [{ id: id("m"), text: t("chat.msg4", "Отлично, тогда до встречи!"), dir: "in" }],
  });
  const archivedSet = new Set(archivedPeers.map((x) => window.spaStorage.normalizeId(x)));
  useEffect(() => {
    writeJsonSafe("chatArchivedPeers", [...archivedSet]);
  }, [archivedPeers]);
  const filteredPeers = peers.filter((p) => {
    if (!p.name.toLowerCase().includes(query.toLowerCase())) return false;
    const isArchived = archivedSet.has(window.spaStorage.normalizeId(p.id));
    return tab === "archive" ? isArchived : !isArchived;
  });
  const activeThread = threads[activePeer] || [];
  const send = () => {
    const text = message.trim();
    if (!text) return;
    setThreads({ ...threads, [activePeer]: [...activeThread, { id: id("m"), text, dir: "out" }] });
    setMessage("");
  };
  return (
    <AppLayout>
      <section className="chat-layout">
        <aside className="chat-col chat-col--list">
          <div className="chat-list__tabs" role="tablist">
            <button type="button" className={tab === "inbox" ? "chat-list__tab chat-list__tab--active" : "chat-list__tab"} onClick={() => setTab("inbox")}>
              {t("chat.tabChats", "Чаты")}
            </button>
            <button type="button" className={tab === "archive" ? "chat-list__tab chat-list__tab--active" : "chat-list__tab"} onClick={() => setTab("archive")}>
              {t("chat.tabArchive", "Архив")}
            </button>
          </div>
          <input className="chat-list__search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("chat.searchPh", "Поиск")} />
          <div className="chat-list__scroll">
            {filteredPeers.map((peer) => (
              <div key={peer.id} className="chat-list__row">
                <button className={peer.id === activePeer ? "chat-list__item chat-list__item--active" : "chat-list__item"} onClick={() => setActivePeer(peer.id)}>
                  <span className="chat-list__item-name-text">{peer.name}</span>
                  <span className="chat-list__item-preview">{peer.preview}</span>
                </button>
                <button
                  type="button"
                  className="chat-list__row-toggle"
                  onClick={() => {
                    const slug = window.spaStorage.normalizeId(peer.id);
                    if (archivedSet.has(slug)) {
                      setArchivedPeers([...archivedSet].filter((x) => x !== slug));
                    } else {
                      setArchivedPeers([...archivedSet, slug]);
                      if (activePeer === peer.id) {
                        const candidate = peers.find((x) => !archivedSet.has(window.spaStorage.normalizeId(x.id)) && x.id !== peer.id);
                        if (candidate) setActivePeer(candidate.id);
                      }
                    }
                  }}
                  aria-label={archivedSet.has(window.spaStorage.normalizeId(peer.id)) ? t("chat.unarchiveChat", "Вернуть из архива") : t("chat.archiveChat", "В архив")}
                >
                  {archivedSet.has(window.spaStorage.normalizeId(peer.id)) ? "↩" : "⇩"}
                </button>
              </div>
            ))}
            {!filteredPeers.length ? <p className="spa-muted">{tab === "archive" ? t("chat.emptyArchive", "В архиве пока никого.") : t("chat.emptyInboxAll", "Все чаты в архиве.")}</p> : null}
          </div>
        </aside>
        <section className="chat-col">
          <div className="chat-thread__head">
            <div className="chat-thread__person">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=MarcusDias" width="44" height="44" alt="" />
              <div>
                <h1 className="chat-thread__name">{filteredPeers.find((x) => x.id === activePeer)?.name || "Marcus Dias"}</h1>
                <div className="chat-thread__status"><span className="chat-thread__status-dot" aria-hidden="true"></span><span>{t("chat.online", "Online")}</span></div>
              </div>
            </div>
          </div>
          <div className="chat-thread__scroll">
            {activeThread.length ? (
              activeThread.map((msg) => (
                <div key={msg.id} className={msg.dir === "out" ? "chat-msg chat-msg--out" : "chat-msg chat-msg--in"}>
                  <div className="chat-msg__bubble">{msg.text}</div>
                </div>
              ))
            ) : (
              <p className="spa-muted">{t("chat.emptyThreadHint", "Сообщений пока нет. Напишите первым ниже.")}</p>
            )}
          </div>
          <div className="chat-compose">
            <input className="chat-compose__input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("chat.inputPh", "Напишите сообщение…")} />
            <button onClick={send}>{t("feed.send", "Отправить")}</button>
          </div>
        </section>
        <aside className="chat-col chat-col--profile">
          <div className="chat-profile">
            <img className="chat-profile__avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=MarcusDias" width="96" height="96" alt="" />
            <h2 className="chat-profile__name">Marcus Dias</h2>
            <div className="chat-profile__block"><div className="chat-profile__label">Phone</div><div className="chat-profile__value">+880 789 569 895</div></div>
            <div className="chat-profile__block"><div className="chat-profile__label">Email</div><div className="chat-profile__value">MarcusAntonioDias@gmail.com</div></div>
            <div className="chat-profile__block"><div className="chat-profile__label">Current role</div><div className="chat-profile__value">Senior Design Manager · Microsoft</div></div>
            <div className="chat-profile__block"><div className="chat-profile__label">Education</div><div className="chat-profile__value">University of Texas, Austin — BFA Design</div></div>
          </div>
        </aside>
      </section>
    </AppLayout>
  );
}

function NotificationsPage() {
  const { account, session } = useAuth();
  const { homeChats } = useData();
  const { pushNotice } = useUi();
  const [kind, setKind] = useState("all");
  const [messageTab, setMessageTab] = useState("sorted");
  const [messageSearch, setMessageSearch] = useState("");
  const userEmail = typeof session?.email === "string" && session.email ? session.email : "guest@linkup.local";
  const displayName = [account?.firstName, account?.lastName].filter(Boolean).join(" ").trim()
    || account?.userName
    || userEmail.split("@")[0];
  const userRole = account?.specialty || "UI/UX Designer";
  const userCompany = account?.company || "Microsoft";
  const rawAvatar = typeof account?.avatarDataUrl === "string" ? account.avatarDataUrl.trim() : "";
  const userAvatar = rawAvatar.startsWith("data:image/") || /^https:\/\//i.test(rawAvatar)
    ? rawAvatar
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName || userEmail)}`;
  const cards = {
    all: { title: "No news notifications", text: "All notifications will be shown here." },
    vacancies: { title: "No vacancy notifications", text: "Vacancy updates will appear here." },
    publications: { title: "No publication notifications", text: "Publication updates will appear here." },
  };
  const cur = cards[kind];
  const visibleMessages = homeChats.filter((chat, index) => {
    const matchesSearch = String(chat.name || "").toLowerCase().includes(messageSearch.toLowerCase());
    const inTab = messageTab === "sorted" ? index % 2 === 0 : index % 2 === 1;
    return matchesSearch && inTab;
  });
  return (
    <AppLayout>
      <div className="home-shell home-shell--vacancies">
        <aside className="home-col-left home-card">
          <div className="home-profile-card__top">
            <img className="home-profile-card__avatar" src={userAvatar} width="72" height="72" alt="" />
            <h2 className="home-profile-card__name">{displayName}</h2>
            <p className="home-profile-card__title">{`${userRole} · ${userCompany}`}</p>
          </div>
        </aside>
        <main className="home-col-feed">
          <section className="home-card vac-event-card">
            <div className="vac-event-filters">
              <button type="button" className={kind === "all" ? "vac-event-filter vac-event-filter--active" : "vac-event-filter"} onClick={() => setKind("all")}>All</button>
              <button type="button" className={kind === "vacancies" ? "vac-event-filter vac-event-filter--active" : "vac-event-filter"} onClick={() => setKind("vacancies")}>Vacancies</button>
              <button type="button" className={kind === "publications" ? "vac-event-filter vac-event-filter--active" : "vac-event-filter"} onClick={() => setKind("publications")}>My publications</button>
            </div>
            <div className="vac-event-empty">
              <svg className="vac-event-empty__art" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="22" y="24" width="76" height="72" rx="10" fill="#eef2ff" stroke="#818cf8" strokeWidth="2" />
                <path d="M42 42h36M38 56h44M42 70h30" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" />
                <path d="M24 38l14-16M96 38l-14-16" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
                <circle cx="60" cy="89" r="10" fill="#6366f1" />
                <path d="M55 89h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <h3 className="vac-event-empty__title">{cur.title}</h3>
              <p className="vac-event-empty__text">{cur.text}</p>
              <button className="vac-event-expand" type="button" onClick={() => pushNotice(cur.title)}>Learn more</button>
            </div>
          </section>
        </main>
        <aside id="homeMessagesWidget" className="home-col-right home-card home-messages">
          <div className="home-messages__head"><h2 className="home-messages__title">{t("widget.title", "Messages")}</h2></div>
          <div id="homeMessagesWidgetBody" className="home-messages__body">
            <input className="home-messages__search" type="search" value={messageSearch} onChange={(e) => setMessageSearch(e.target.value)} placeholder={t("widget.searchPh", "Search messages")} />
            <div className="home-messages__tabs">
              <button type="button" className={messageTab === "sorted" ? "home-messages__tab home-messages__tab--active" : "home-messages__tab"} onClick={() => setMessageTab("sorted")}>Sorted</button>
              <button type="button" className={messageTab === "other" ? "home-messages__tab home-messages__tab--active" : "home-messages__tab"} onClick={() => setMessageTab("other")}>Other</button>
            </div>
            {visibleMessages.length ? (
              <div className="msg-list">
                {visibleMessages.map((chat) => (
                  <p key={chat.id}>{chat.name}</p>
                ))}
              </div>
            ) : (
              <div className="home-messages__empty"><p>{t("widget.empty", "No messages yet. Contact a member and start a discussion.")}</p><NavLink to="/chat" className="home-messages__cta">{t("widget.cta", "Send a message")}</NavLink></div>
            )}
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}

function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><RegisteredProfileRoute><ProfilePage /></RegisteredProfileRoute></ProtectedRoute>} />
        <Route path="/network" element={<ProtectedRoute><NetworkPage /></ProtectedRoute>} />
        <Route path="/vacancies" element={<ProtectedRoute><VacanciesPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </HashRouter>
  );
}

function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
