const API_BASE_URL = "http://localhost:7011";
const { useMemo, useState } = React;
const USE_MOCK_AUTH = true;
const MOCK_USERS_KEY = "mockAuthUsers";

const FEED_MOCK = [
  {
    id: 1,
    author: "Christian Nolan",
    role: "UI/UX Designer",
    text:
      "Сегодня собрали новый экран onboarding. Важно держать простые шаги и понятные CTA.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=80&auto=format&fit=crop",
  },
  {
    id: 2,
    author: "Jonathan Matthews",
    role: "UX Designer",
    text:
      "Если мы уменьшаем когнитивную нагрузку на первом экране, конверсия регистрации всегда выше.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80&auto=format&fit=crop",
  },
];

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

  if (path === "/api/account/register") {
    const email = String(payload?.email ?? "").trim().toLowerCase();
    const userName = String(payload?.userName ?? "").trim();
    const password = String(payload?.password ?? "");

    if (!email || !userName || !password) {
      return { ok: false, status: 400, data: { message: "Заполните все поля." } };
    }
    if (users.some((user) => user.email === email)) {
      return { ok: false, status: 409, data: { message: "Пользователь уже существует." } };
    }

    users.push({
      id: Date.now(),
      email,
      userName,
      password,
    });
    writeMockUsers(users);

    return {
      ok: true,
      status: 200,
      data: { success: true, data: { account: { email, userName } } },
    };
  }

  if (path === "/api/account/login") {
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
          account: {
            email: user.email,
            userName: user.userName,
          },
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

function useStoredSession() {
  try {
    const raw = localStorage.getItem("authSession");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function HomePage({ session, onLogout }) {
  const [posts, setPosts] = useState(FEED_MOCK);
  const [postText, setPostText] = useState("");
  const [messageTab, setMessageTab] = useState("sorted");
  const [messageDraft, setMessageDraft] = useState("");
  const [messages, setMessages] = useState([]);

  const publishPost = () => {
    const text = postText.trim();
    if (!text) return;

    const newPost = {
      id: Date.now(),
      author: session.email.split("@")[0],
      role: "You",
      text,
      image: "",
    };
    setPosts((prev) => [newPost, ...prev]);
    setPostText("");
  };

  const sendMessage = () => {
    const text = messageDraft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: Date.now(), text }]);
    setMessageDraft("");
  };

  return (
    <main className="home-root">
      <header className="topbar">
        <div className="topbar-left">
          <span className="logo-chip">in</span>
          <input className="search" placeholder="Search" />
        </div>
        <nav className="topbar-nav">
          <button>Home</button>
          <button>Network</button>
          <button>Vacancies</button>
          <button>Messages</button>
          <button>Notifications</button>
          <button className="profile-pill">My Profile</button>
        </nav>
      </header>

      <section className="home-layout">
        <aside className="left-card">
          <div className="avatar"></div>
          <h3>{session.email.split("@")[0]}</h3>
          <p>Front-end Developer</p>
          <hr />
          <div className="metric">
            <span>Contacts</span>
            <strong>73</strong>
          </div>
          <div className="metric">
            <span>Who viewed profile</span>
            <strong>420</strong>
          </div>
          <button className="ghost-main">Saved elements</button>
        </aside>

        <section className="feed">
          <article className="composer">
            <div className="composer-top">
              <div className="avatar small"></div>
              <input
                value={postText}
                onChange={(event) => setPostText(event.target.value)}
                placeholder="Start your post"
              />
            </div>
            <div className="composer-actions">
              <button>Photo</button>
              <button>Video</button>
              <button>Event</button>
              <button className="primary-mini" onClick={publishPost}>
                Publish
              </button>
            </div>
          </article>

          {posts.map((post) => (
            <article key={post.id} className="post-card">
              <div className="post-head">
                <div className="avatar small"></div>
                <div>
                  <strong>{post.author}</strong>
                  <p>{post.role}</p>
                </div>
              </div>
              <p className="post-text">{post.text}</p>
              {post.image ? <img src={post.image} alt="post visual" /> : null}
              <div className="post-actions">
                <button>Like</button>
                <button>Comment</button>
                <button>Share</button>
                <button>Send</button>
              </div>
            </article>
          ))}
        </section>

        <aside className="right-card">
          <div className="right-top">
            <h4>Messages</h4>
            <button onClick={onLogout}>Log out</button>
          </div>
          <input
            className="search small-input"
            placeholder="Search messages"
            value={messageDraft}
            onChange={(event) => setMessageDraft(event.target.value)}
          />
          <div className="msg-tabs">
            <button
              className={messageTab === "sorted" ? "active" : ""}
              onClick={() => setMessageTab("sorted")}
            >
              Sorted
            </button>
            <button
              className={messageTab === "other" ? "active" : ""}
              onClick={() => setMessageTab("other")}
            >
              Other
            </button>
          </div>
          <div className="msg-list">
            {messages.length === 0 ? (
              <p className="muted">No messages yet. Start a discussion.</p>
            ) : (
              messages.map((msg) => <p key={msg.id}>{msg.text}</p>)
            )}
          </div>
          <button className="ghost-main" onClick={sendMessage}>
            Send message
          </button>
        </aside>
      </section>

      <footer className="footer">
        <span>General information</span>
        <span>Privacy terms</span>
        <span>Help center</span>
        <span>Cookie policy</span>
        <span>Accessibility</span>
      </footer>
    </main>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("register");
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState({ type: "", text: "" });
  const [session, setSession] = useState(useStoredSession);
  const [registerForm, setRegisterForm] = useState({
    email: "",
    userName: "",
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
      registerForm.password &&
      registerForm.confirmPassword
    );
  }, [registerForm]);

  const loginReady = useMemo(() => {
    return loginForm.email.trim() && loginForm.password;
  }, [loginForm]);

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

  const onRegisterSubmit = async (event) => {
    event.preventDefault();
    setBanner({ type: "", text: "" });

    if (!isEmail(registerForm.email)) {
      setBanner({ type: "error", text: "Введите корректный email." });
      return;
    }
    if (registerForm.password.length < 6) {
      setBanner({ type: "error", text: "Пароль должен быть минимум 6 символов." });
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setBanner({ type: "error", text: "Пароли не совпадают." });
      return;
    }

    setLoading(true);
    try {
      const response = await postJson("/api/account/register", {
        email: registerForm.email.trim(),
        userName: registerForm.userName.trim(),
        password: registerForm.password,
        firstName: null,
        lastName: null,
      });

      if (!response.ok) {
        setBanner({
          type: "error",
          text: readApiError(response.data, "Не удалось зарегистрироваться."),
        });
        return;
      }

      setLoginForm((prev) => ({ ...prev, email: registerForm.email.trim() }));
      setActiveTab("login");
      setBanner({ type: "success", text: "Регистрация успешна. Теперь войдите в аккаунт." });
    } catch (error) {
      setBanner({ type: "error", text: "Сервер недоступен. Проверьте API и попробуйте снова." });
    } finally {
      setLoading(false);
    }
  };

  const onLoginSubmit = async (event) => {
    event.preventDefault();
    setBanner({ type: "", text: "" });

    if (!isEmail(loginForm.email)) {
      setBanner({ type: "error", text: "Введите корректный email." });
      return;
    }

    setLoading(true);
    try {
      const response = await postJson("/api/account/login", {
        email: loginForm.email.trim(),
        password: loginForm.password,
      });

      if (!response.ok) {
        setBanner({
          type: "error",
          text: readApiError(response.data, "Неверный email или пароль."),
        });
        return;
      }

      const payload = {
        email: loginForm.email.trim(),
        accessToken: response.data?.data?.tokens?.accessToken ?? null,
        refreshToken: response.data?.data?.tokens?.refreshToken ?? null,
      };
      localStorage.setItem("authSession", JSON.stringify(payload));
      setSession(payload);
      setBanner({ type: "success", text: "Вы успешно вошли." });
    } catch (error) {
      setBanner({ type: "error", text: "Сервер недоступен. Проверьте API и попробуйте снова." });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authSession");
    setSession(null);
    setLoginForm((prev) => ({ ...prev, password: "" }));
    setBanner({ type: "", text: "" });
    setActiveTab("login");
  };

  if (session) {
    return <HomePage session={session} onLogout={logout} />;
  }

  return (
    <main className="page">
      <div className="bg-orb bg-orb-a" aria-hidden="true"></div>
      <div className="bg-orb bg-orb-b" aria-hidden="true"></div>

      <section className="app-shell">
        <aside className="promo">
          <div className="logo-mark">in</div>
          <h1>LinkUp Auth</h1>
          <p>
            Живой экран авторизации: регистрация, затем вход в один клик.
            API подключен к <code>{API_BASE_URL}</code>.
          </p>
          <div className="flow-points">
            <span className={activeTab === "register" ? "on" : ""}>1. Регистрация</span>
            <span className={activeTab === "login" ? "on" : ""}>2. Вход</span>
            <span>3. Главная</span>
          </div>
        </aside>

        <article className="auth-card">
          <div className="tabs">
            <button
              type="button"
              className={activeTab === "register" ? "tab active" : "tab"}
              onClick={() => setActiveTab("register")}
            >
              Регистрация
            </button>
            <button
              type="button"
              className={activeTab === "login" ? "tab active" : "tab"}
              onClick={() => setActiveTab("login")}
            >
              Вход
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
                Email
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
                Username
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
                Пароль
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
                Повторите пароль
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="повторите пароль"
                  value={registerForm.confirmPassword}
                  onChange={setRegisterField}
                  required
                />
              </label>
              <button className="primary" disabled={loading || !registerReady} type="submit">
                {loading ? "Создание..." : "Создать аккаунт"}
              </button>
            </form>
          ) : (
            <form className="form" onSubmit={onLoginSubmit}>
              <label>
                Email
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
                Пароль
                <input
                  name="password"
                  type="password"
                  placeholder="ваш пароль"
                  value={loginForm.password}
                  onChange={setLoginField}
                  required
                />
              </label>
              <button className="primary" disabled={loading || !loginReady} type="submit">
                {loading ? "Вход..." : "Войти"}
              </button>
            </form>
          )}
        </article>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
