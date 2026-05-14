const { useState } = React;

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
  const session = readSession();

  const logout = () => {
    localStorage.removeItem("authSession");
    window.location.href = "../auth/index.html";
  };

  if (!session) {
    return (
      <main className="empty-state">
        <h1>Сессия не найдена</h1>
        <p>Сначала выполните вход через страницу регистрации.</p>
        <a href="../auth/index.html">Перейти к регистрации</a>
      </main>
    );
  }

  return <HomePage session={session} onLogout={logout} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
