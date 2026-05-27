const { useEffect, useState } = React;
const AUTH_PAGE_URL = "../../auth/index.html?v=only-new";

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

function readSession() {
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
  const [actionHint, setActionHint] = useState("");
  const [, setLangTick] = useState(0);
  const userEmail = typeof session?.email === "string" && session.email ? session.email : "guest@linkup.local";
  const userName = userEmail.includes("@") ? userEmail.split("@")[0] : "guest";
  const displayName = session?.guest ? "Гость" : userName;
  const profileName = [session?.firstName, session?.lastName].filter(Boolean).join(" ").trim() || displayName;
  const rawAvatar = typeof session?.avatarDataUrl === "string" ? session.avatarDataUrl.trim() : "";
  const userAvatar =
    rawAvatar.startsWith("data:image/") || /^https:\/\//i.test(rawAvatar)
      ? rawAvatar
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName || userEmail)}`;
  const showHint = (text) => {
    setActionHint(text);
    window.setTimeout(() => setActionHint(""), 1800);
  };
  const goTo = (path) => {
    window.location.href = path;
  };

  const publishPost = () => {
    const text = postText.trim();
    if (!text) return;

    const newPost = {
      id: Date.now(),
      author: displayName,
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

  useEffect(() => {
    const onLang = () => setLangTick((n) => n + 1);
    document.addEventListener("uilangchange", onLang);
    return () => document.removeEventListener("uilangchange", onLang);
  }, []);

  return (
    <main className="home-root">
      <header className="home-header" role="banner">
        <div className="home-header__inner">
          <a href="./index.html" className="home-logo" aria-label="Home">in</a>
          <div className="home-search" role="search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <span data-i18n="nav.search">Поиск</span>
          </div>
          <nav className="home-nav" aria-label="Primary">
            <a href="./index.html" className="home-nav__item home-nav__item--active" aria-current="page">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              <span data-i18n="nav.home">Главная</span>
            </a>
            <a href="../network/index.html" className="home-nav__item">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
              <span data-i18n="nav.network">Сеть</span>
            </a>
            <a href="../vacancies/index.html" className="home-nav__item">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
              </svg>
              <span data-i18n="nav.vacancies">Вакансии</span>
            </a>
            <a href="../chat/index.html" className="home-nav__item">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
              <span data-i18n="nav.messages">Сообщения</span>
            </a>
            <button type="button" className="home-nav__item" onClick={() => showHint("Новых уведомлений пока нет")}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
              <span data-i18n="nav.notifications">Уведомления</span>
            </button>
          </nav>
          <button
            type="button"
            className="theme-toggle home-theme-toggle"
            data-theme-toggle
            aria-pressed="false"
            aria-label="Переключить тему"
            title="Переключить тему"
          >
            <svg className="theme-toggle__icon theme-toggle__icon--moon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
            <svg className="theme-toggle__icon theme-toggle__icon--sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          </button>
          <a href="../profile/index.html?v=20260516-2" className="home-user">
            <img className="home-user__avatar" src={userAvatar} width="36" height="36" alt="" />
            <span className="home-user__label">{profileName}</span>
          </a>
        </div>
      </header>
      {actionHint ? <div className="action-hint">{actionHint}</div> : null}

      <section className="home-layout">
        <aside className="left-card">
          <img className="avatar avatar-img" src={userAvatar} alt="" />
          <h3>{displayName}</h3>
          <p data-i18n="home.role">Front-end Developer</p>
          <hr />
          <div className="metric">
            <span data-i18n="home.contacts">Contacts</span>
            <strong>73</strong>
          </div>
          <div className="metric">
            <span data-i18n="home.profileViews">Who viewed profile</span>
            <strong>420</strong>
          </div>
          <button className="ghost-main" onClick={() => showHint("Сохраненные элементы откроем в следующем экране")}>
            <span data-i18n="home.savedElements">Saved elements</span>
          </button>
        </aside>

        <section className="feed">
          <article className="composer">
            <div className="composer-top">
              <img className="avatar avatar-img small" src={userAvatar} alt="" />
              <input
                value={postText}
                onChange={(event) => setPostText(event.target.value)}
                placeholder="Start your post"
                data-i18n-placeholder="feed.composerPlaceholder"
                data-i18n-aria="feed.composerPostAria"
              />
            </div>
            <div className="composer-actions">
              <button onClick={() => showHint("Добавление фото будет в следующем обновлении")} data-i18n="feed.photo">Photo</button>
              <button onClick={() => showHint("Добавление видео будет в следующем обновлении")} data-i18n="feed.video">Video</button>
              <button onClick={() => showHint("Создание события будет в следующем обновлении")} data-i18n="feed.event">Event</button>
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
                <button onClick={() => showHint("Лайк учтен")} data-i18n="feed.like">Like</button>
                <button onClick={() => showHint("Комментарии будут в следующем обновлении")} data-i18n="feed.comment">Comment</button>
                <button onClick={() => showHint("Ссылка на пост скопирована")} data-i18n="feed.share">Share</button>
                <button onClick={() => showHint("Пост отправлен в сообщения")} data-i18n="feed.send">Send</button>
              </div>
            </article>
          ))}
        </section>

        <aside className="right-card">
          <div className="right-top">
            <h4 data-i18n="widget.title">Messages</h4>
            <button onClick={onLogout} data-i18n="home.logout">Log out</button>
          </div>
          <input
            className="search small-input"
            placeholder="Search messages"
            data-i18n-placeholder="widget.searchPh"
            value={messageDraft}
            onChange={(event) => setMessageDraft(event.target.value)}
          />
          <div className="msg-tabs">
            <button
              className={messageTab === "sorted" ? "active" : ""}
              onClick={() => setMessageTab("sorted")}
              data-i18n="widget.tabSorted"
            >
              Sorted
            </button>
            <button
              className={messageTab === "other" ? "active" : ""}
              onClick={() => setMessageTab("other")}
              data-i18n="widget.tabOther"
            >
              Other
            </button>
          </div>
          <div className="msg-list">
            {messages.length === 0 ? (
              <p className="muted" data-i18n="home.msgEmpty">No messages yet. Start a discussion.</p>
            ) : (
              messages.map((msg) => <p key={msg.id}>{msg.text}</p>)
            )}
          </div>
          <button className="ghost-main" onClick={sendMessage} data-i18n="widget.cta">
            Send message
          </button>
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
    </main>
  );
}

function App() {
  const session = readSession();

  const logout = () => {
    localStorage.removeItem("authSession");
    window.location.href = AUTH_PAGE_URL;
  };

  if (!session) {
    return (
      <main className="empty-state">
        <h1 data-i18n="home.noSessionTitle">Сессия не найдена</h1>
        <p data-i18n="home.noSessionHint">Сначала выполните вход через страницу регистрации.</p>
        <a href={AUTH_PAGE_URL} data-i18n="home.goRegister">Перейти к регистрации</a>
      </main>
    );
  }

  return <HomePage session={session} onLogout={logout} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
