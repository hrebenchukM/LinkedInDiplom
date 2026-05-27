const API_BASE_URL = "https://localhost:7011";
const { useEffect, useMemo, useState } = React;
// Keep frontend runnable for any user even without backend.
const USE_MOCK_AUTH = true;
const MOCK_USERS_KEY = "mockAuthUsers";
const HOME_PAGE_URL = "../pages/home/index.html";
const PROFILE_PAGE_URL = "../pages/profile/index.html?v=20260516-2";

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
    if (raw.startsWith("data:image/") || /^https:\/\//i.test(raw)) return raw;
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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
      return { ok: false, status: 400, data: { message: "Заполните все поля." } };
    }
    if (users.some((user) => user.email === email)) {
      return { ok: false, status: 409, data: { message: "Пользователь уже существует." } };
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
      return { ok: false, status: 401, data: { message: "Неверный email или пароль." } };
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

function App() {
  const [activeTab, setActiveTab] = useState("register");
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState({ type: "", text: "" });
  const [, setLangTick] = useState(0);
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
  const tr = (key, fallback) => (typeof window.uiT === "function" ? window.uiT(key) : fallback);

  useEffect(() => {
    const onLang = () => setLangTick((n) => n + 1);
    document.addEventListener("uilangchange", onLang);
    return () => document.removeEventListener("uilangchange", onLang);
  }, []);

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

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      return { ok: response.ok, status: response.status, data };
    } catch {
      // Automatic fallback keeps demo usable when API is offline.
      return postMockAuth(path, payload);
    }
  };

  const onRegisterSubmit = async (event) => {
    event.preventDefault();
    setBanner({ type: "", text: "" });

    if (!isEmail(registerForm.email)) {
      setBanner({ type: "error", text: tr("reg.errEmail", "Введите корректный email.") });
      return;
    }
    if (registerForm.password.length < 6) {
      setBanner({ type: "error", text: tr("reg.errPassShort", "Пароль должен быть минимум 6 символов.") });
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setBanner({ type: "error", text: tr("reg.errPassMismatch", "Пароли не совпадают.") });
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
          text: readApiError(response.data, "Не удалось зарегистрироваться."),
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
      localStorage.setItem("registeredAccount", JSON.stringify(accountDraft));
      localStorage.setItem(
        "authSession",
        JSON.stringify({
          email: accountDraft.email,
          userName: accountDraft.userName,
          firstName: accountDraft.firstName,
          lastName: accountDraft.lastName,
          accessToken: response.data?.token?.accessToken ?? null,
          refreshToken: response.data?.token?.refreshToken ?? null,
        }),
      );
      window.location.href = PROFILE_PAGE_URL;
    } catch {
      setBanner({ type: "error", text: tr("reg.errServer", "Сервер недоступен. Проверьте API и попробуйте снова.") });
    } finally {
      setLoading(false);
    }
  };

  const onLoginSubmit = async (event) => {
    event.preventDefault();
    setBanner({ type: "", text: "" });

    if (!isEmail(loginForm.email)) {
      setBanner({ type: "error", text: tr("reg.errEmail", "Введите корректный email.") });
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
          text: readApiError(response.data, tr("reg.errLogin", "Неверный email или пароль.")),
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
      setBanner({ type: "error", text: tr("reg.errServer", "Сервер недоступен. Проверьте API и попробуйте снова.") });
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

  return (
    <main className="page">
      <div className="bg-orb bg-orb-a" aria-hidden="true"></div>
      <div className="bg-orb bg-orb-b" aria-hidden="true"></div>

      <section className="app-shell">
        <aside className="promo">
          <div className="logo-mark">in</div>
          <h1>{tr("reg.title", "LinkUp Auth")}</h1>
          <p>{tr("reg.subtitle", "Современная регистрация и вход в одном удобном окне.")}</p>
          <div className="flow-points">
            <span className={activeTab === "register" ? "on" : ""}>{tr("reg.stepRegister", "1. Регистрация")}</span>
            <span className={activeTab === "login" ? "on" : ""}>{tr("reg.stepLogin", "2. Вход")}</span>
            <span>{tr("reg.stepHome", "3. Главная")}</span>
          </div>
        </aside>

        <article className="auth-card">
          <div className="tabs">
            <button
              type="button"
              className={activeTab === "register" ? "tab active" : "tab"}
              onClick={() => setActiveTab("register")}
            >
              {tr("reg.tabRegister", "Регистрация")}
            </button>
            <button
              type="button"
              className={activeTab === "login" ? "tab active" : "tab"}
              onClick={() => setActiveTab("login")}
            >
              {tr("reg.tabLogin", "Вход")}
            </button>
          </div>

          {banner.text ? (
            <div className={banner.type === "error" ? "banner error" : "banner success"}>
              {banner.text}
            </div>
          ) : null}

          {activeTab === "register" ? (
            <form className="form" onSubmit={onRegisterSubmit}>
              <label>
                {tr("reg.emailShort", "Email")}
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
                {tr("reg.usernameShort", "Username")}
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
                {tr("reg.firstName", "Имя")}
                <input
                  name="firstName"
                  type="text"
                  placeholder="Иван"
                  value={registerForm.firstName}
                  onChange={setRegisterField}
                  required
                />
              </label>
              <label>
                {tr("reg.lastName", "Фамилия")}
                <input
                  name="lastName"
                  type="text"
                  placeholder="Петров"
                  value={registerForm.lastName}
                  onChange={setRegisterField}
                  required
                />
              </label>
              <label>
                {tr("reg.password", "Пароль")}
                <input
                  name="password"
                  type="password"
                  placeholder="минимум 6 символов"
                  value={registerForm.password}
                  onChange={setRegisterField}
                  required
                />
              </label>
              <label>
                {tr("reg.confirmPassword", "Повторите пароль")}
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder={tr("reg.phConfirm", "повторите пароль")}
                  value={registerForm.confirmPassword}
                  onChange={setRegisterField}
                  required
                />
              </label>
              <button className="primary" disabled={loading || !registerReady} type="submit">
                {loading ? tr("reg.creating", "Создание...") : tr("reg.submit", "Создать аккаунт")}
              </button>
            </form>
          ) : (
            <form className="form" onSubmit={onLoginSubmit}>
              <label>
                {tr("reg.emailShort", "Email")}
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
                {tr("reg.password", "Пароль")}
                <input
                  name="password"
                  type="password"
                  placeholder={tr("reg.phLoginPass", "ваш пароль")}
                  value={loginForm.password}
                  onChange={setLoginField}
                  required
                />
              </label>
              <button className="primary" disabled={loading || !loginReady} type="submit">
                {loading ? tr("reg.loggingIn", "Вход...") : tr("reg.login", "Войти")}
              </button>
            </form>
          )}

          <button type="button" className="secondary-action" onClick={onContinueAsGuest}>
            {tr("reg.skip", "Продолжить без регистрации")}
          </button>
        </article>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
