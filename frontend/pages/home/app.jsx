const { useEffect, useMemo, useRef, useState } = React;
const AUTH_PAGE_URL = "../../auth/index.html?v=only-new";
const USER_POSTS_KEY = "homeUserPosts";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 12 * 1024 * 1024;
const FEED_VISIBLE_MOCKS = 6;
const FEED_ROTATE_MS = 60000;
const FEED_MOCK_TEMPLATE = window.FEED_MOCK_TEMPLATE || [];

function pickRandomFeedMockIds(template, count) {
  return shuffleList(template)
    .slice(0, Math.min(count, template.length))
    .map((post) => post.id);
}

function pickFreshFeedMocks(pool, excludeIds, batch, count) {
  const excluded = new Set(excludeIds);
  const available = pool.filter((post) => !excluded.has(post.id));
  if (available.length === 0) return [];
  const take = Math.min(count, available.length);
  const offset = (batch * take) % available.length;
  const out = [];
  for (let i = 0; i < take; i += 1) {
    out.push(available[(offset + i) % available.length]);
  }
  return out;
}

const FEED_EMOJIS = ["😀", "😂", "😍", "🥳", "👍", "👏", "🔥", "💜", "🎉", "😎", "🤔", "💡", "🚀", "✨", "📸", "🎬", "❤️", "👀", "💬", "✅"];

const MOCK_MESSAGES_TEMPLATE = [
  {
    id: "msg-sarah",
    peer: "sarahchen",
    name: "Sarah Chen",
    seed: "SarahChen",
    previewKey: "home.msgPreview1",
    timeKey: "home.msgTime1",
    tab: "sorted",
    unread: true,
  },
  {
    id: "msg-marcus",
    peer: "marcus",
    name: "Marcus Dias",
    seed: "MarcusDias",
    previewKey: "home.msgPreview2",
    timeKey: "home.msgTime2",
    tab: "sorted",
  },
  {
    id: "msg-elena",
    peer: "elenavolkov",
    name: "Elena Volkov",
    seed: "ElenaVolkov",
    previewKey: "home.msgPreview3",
    timeKey: "home.msgTime3",
    tab: "sorted",
    unread: true,
  },
  {
    id: "msg-duncan",
    peer: "duncanux",
    name: "Duncan Callahan",
    seed: "DuncanCallahan",
    previewKey: "home.msgPreview4",
    timeKey: "home.msgTime4",
    tab: "other",
  },
  {
    id: "msg-james",
    peer: "jamesleedev",
    name: "James Lee",
    seed: "JamesLee",
    previewKey: "home.msgPreview5",
    timeKey: "home.msgTime5",
    tab: "sorted",
  },
  {
    id: "msg-nina",
    peer: "ninapetrova",
    name: "Nina Petrova",
    seed: "NinaPetrova",
    previewKey: "home.msgPreview6",
    timeKey: "home.msgTime6",
    tab: "other",
    unread: true,
  },
  {
    id: "msg-timur",
    peer: "timuryamchuk",
    name: "Timur Yamchuk",
    seed: "TimurYamchuk",
    avatar: "/auth/assets/timur-yamchuk-avatar.png",
    previewKey: "home.msgPreview7",
    timeKey: "home.msgTime7",
    tab: "other",
  },
  {
    id: "msg-priya",
    peer: "priyadevops",
    name: "Priya Patel",
    seed: "PriyaPatel",
    previewKey: "home.msgPreview8",
    timeKey: "home.msgTime8",
    tab: "sorted",
  },
];

function shuffleList(items) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function readUiLang() {
  return typeof window.getUiLang === "function" ? window.getUiLang() : "ru";
}

function t(key, lang) {
  if (typeof window.uiTForLang === "function" && lang) {
    return window.uiTForLang(key, lang);
  }
  return typeof window.uiT === "function" ? window.uiT(key) : key;
}

function isUsableAvatarUrl(raw) {
  const value = String(raw || "").trim();
  if (!value || value.includes('"') || value.includes("'")) return false;
  return value.startsWith("data:image/") || /^https?:\/\//i.test(value) || value.startsWith("/");
}

function resolvePostImage(post) {
  if (!post || !post.image) return "";
  if (post.isOwn || String(post.image).startsWith("data:")) return post.image;
  if (typeof window.feedPostImageUrl === "function") return window.feedPostImageUrl(post);
  return post.image;
}

function resolvePostImageFallback(post) {
  if (typeof window.feedPostImageFallback === "function") return window.feedPostImageFallback(post);
  return "";
}

function PostPhoto({ post, alt }) {
  const [src, setSrc] = useState(() => resolvePostImage(post));

  useEffect(() => {
    setSrc(resolvePostImage(post));
  }, [post]);

  if (!src) return null;

  return (
    <img
      className="post-media post-media--photo"
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        const fallback = resolvePostImageFallback(post);
        if (fallback && fallback !== src) {
          setSrc(fallback);
        }
      }}
    />
  );
}

function PostActionIcon({ name, active }) {
  if (name === "like") {
    if (active) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }
  if (name === "comment") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
      </svg>
    );
  }
  if (name === "share") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
      </svg>
    );
  }
  return null;
}

const COMMENT_POOL = [
  { author: "Sarah Chen", seed: "SarahChen", textKeys: ["feed.sampleComment1", "feed.sampleComment4"] },
  { author: "Marcus Dias", seed: "MarcusDias", textKeys: ["feed.sampleComment2", "feed.sampleComment5"] },
  { author: "Elena Volkov", seed: "ElenaVolkov", textKeys: ["feed.sampleComment3", "feed.sampleComment6"] },
];

function postEngagementKey(post) {
  return post.isOwn ? `own-${post.id}` : String(post.id);
}

function hashPostKey(key) {
  let n = 0;
  for (let i = 0; i < key.length; i += 1) n += key.charCodeAt(i);
  return n;
}

function initialLikeCount(post) {
  return 6 + (hashPostKey(postEngagementKey(post)) % 34);
}

function buildSampleComments(post, uiLang) {
  const key = postEngagementKey(post);
  const n = hashPostKey(key);
  const first = COMMENT_POOL[n % COMMENT_POOL.length];
  const second = COMMENT_POOL[(n + 1) % COMMENT_POOL.length];
  return [
    {
      id: `${key}-sample-1`,
      author: first.author,
      seed: first.seed,
      text: t(first.textKeys[n % first.textKeys.length], uiLang),
    },
    {
      id: `${key}-sample-2`,
      author: second.author,
      seed: second.seed,
      text: t(second.textKeys[(n + 1) % second.textKeys.length], uiLang),
    },
  ];
}

function triggerActionTap(btn) {
  if (!btn) return;
  btn.classList.add("post-action--tap");
  window.setTimeout(() => btn.classList.remove("post-action--tap"), 520);
}

async function copyPostLink(onHint) {
  const url = window.location.href.split("#")[0];
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
    }
  } catch {
    /* fallback hint only */
  }
  onHint("home.hint.linkCopied");
}

function tmplText(key, vars, lang) {
  let text = t(key, lang);
  if (!vars) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, name) => String(vars[name] ?? ""));
}

function getShareContacts() {
  const raw = window.MESSAGING_CONTACTS || {};
  return Object.entries(raw).map(([peer, contact]) => ({
    peer,
    name: contact.name,
    seed: contact.seed || contact.name,
    avatar: contact.avatar || "",
  }));
}

function shareContactAvatar(contact) {
  if (isUsableAvatarUrl(contact.avatar)) return contact.avatar;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(contact.seed || contact.name)}`;
}

function PostEngagement({ post, uiLang, userLabel, userAvatar, onHint }) {
  const [liked, setLiked] = useState(false);
  const [likeBurst, setLikeBurst] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [likeCount, setLikeCount] = useState(() => initialLikeCount(post));
  const [commentDraft, setCommentDraft] = useState("");
  const [userComments, setUserComments] = useState([]);
  const [shareFlash, setShareFlash] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [sharedContactId, setSharedContactId] = useState("");
  const commentInputRef = useRef(null);
  const shareWrapRef = useRef(null);

  const shareContacts = useMemo(() => getShareContacts(), []);

  const sampleComments = useMemo(() => buildSampleComments(post, uiLang), [post, uiLang]);
  const comments = useMemo(() => [...sampleComments, ...userComments], [sampleComments, userComments]);

  const openComments = () => {
    setCommentsOpen(true);
    window.setTimeout(() => {
      if (commentInputRef.current) commentInputRef.current.focus();
    }, 360);
  };

  const handleLike = (event) => {
    triggerActionTap(event.currentTarget);
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));
    if (nextLiked) {
      setLikeBurst(true);
      window.setTimeout(() => setLikeBurst(false), 720);
    }
  };

  const handleComment = (event) => {
    triggerActionTap(event.currentTarget);
    setCommentsOpen((open) => {
      const next = !open;
      if (next) {
        window.setTimeout(() => {
          if (commentInputRef.current) commentInputRef.current.focus();
        }, 320);
      }
      return next;
    });
  };

  const handleShare = (event) => {
    triggerActionTap(event.currentTarget);
    setShareMenuOpen((open) => !open);
  };

  const shareWithContact = async (contact) => {
    setSharedContactId(contact.peer);
    setShareFlash(true);
    window.setTimeout(() => setShareFlash(false), 700);
    window.setTimeout(() => setShareMenuOpen(false), 320);
    try {
      const url = window.location.href.split("#")[0];
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* ignore */
    }
    onHint("feed.sharedWith", { name: contact.name });
    window.setTimeout(() => setSharedContactId(""), 1200);
  };

  const handleShareCopyLink = async () => {
    setShareMenuOpen(false);
    setShareFlash(true);
    window.setTimeout(() => setShareFlash(false), 700);
    await copyPostLink(onHint);
  };

  useEffect(() => {
    if (!shareMenuOpen) return undefined;
    const onDocClick = (event) => {
      if (!shareWrapRef.current || shareWrapRef.current.contains(event.target)) return;
      setShareMenuOpen(false);
    };
    const onEsc = (event) => {
      if (event.key === "Escape") setShareMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [shareMenuOpen]);

  const submitComment = (event) => {
    event.preventDefault();
    const text = commentDraft.trim();
    if (!text) return;
    setUserComments((prev) => [
      ...prev,
      {
        id: `${postEngagementKey(post)}-user-${Date.now()}`,
        author: userLabel,
        seed: userLabel,
        avatar: userAvatar,
        text,
        isOwn: true,
      },
    ]);
    setCommentDraft("");
    setCommentsOpen(true);
    onHint("feed.commentAdded");
  };

  return (
    <>
      <div className={`post-stats${liked ? " post-stats--liked" : ""}`}>
        <span className="post-stats__likes" aria-label={t("feed.likeCountAria", uiLang)}>
          <span className={`post-stats__heart${liked ? " post-stats__heart--on" : ""}`} aria-hidden="true">
            ♥
          </span>
          {likeCount}
        </span>
        <button type="button" className="post-stats__comments-btn" onClick={openComments}>
          {comments.length} {t("feed.commentsShort", uiLang)}
        </button>
      </div>

      <div className="post-actions">
        <div className="post-actions__bar">
          <button
            type="button"
            className={`post-action post-action--like${liked ? " post-action--liked" : ""}${likeBurst ? " post-action--burst" : ""}`}
            onClick={handleLike}
            aria-pressed={liked}
            aria-label={liked ? t("feed.likedAria", uiLang) : t("feed.like", uiLang)}
          >
          {likeBurst ? (
            <span className="post-like-burst" aria-hidden="true">
              <span className="post-like-burst__particle post-like-burst__particle--1">♥</span>
              <span className="post-like-burst__particle post-like-burst__particle--2">♥</span>
              <span className="post-like-burst__particle post-like-burst__particle--3">♥</span>
            </span>
          ) : null}
          <span className={`post-action__icon${liked ? " post-action__icon--liked" : ""}`}>
            <PostActionIcon name="like" active={liked} />
          </span>
          <span className="post-action__label">
            {liked ? t("feed.liked", uiLang) : t("feed.like", uiLang)}
          </span>
          {liked ? <span className="post-action__liked-mark" aria-hidden="true">✓</span> : null}
          <span className="post-action__ripple" aria-hidden="true" />
        </button>

        <button
          type="button"
          className={`post-action post-action--comment${commentsOpen ? " post-action--active" : ""}`}
          onClick={handleComment}
          aria-expanded={commentsOpen}
        >
          <span className="post-action__icon">
            <PostActionIcon name="comment" />
          </span>
          <span className="post-action__label" data-i18n="feed.comment">
            {t("feed.comment", uiLang)}
          </span>
          <span className="post-action__ripple" aria-hidden="true" />
        </button>

        <div className="post-action-wrap post-action-wrap--share" ref={shareWrapRef}>
          <button
            type="button"
            className={`post-action post-action--share${shareFlash ? " post-action--shared" : ""}${shareMenuOpen ? " post-action--active" : ""}`}
            onClick={handleShare}
            aria-expanded={shareMenuOpen}
            aria-haspopup="menu"
          >
            <span className="post-action__icon">
              <PostActionIcon name="share" />
            </span>
            <span className="post-action__label" data-i18n="feed.share">
              {t("feed.share", uiLang)}
            </span>
            <span className="post-action__ripple" aria-hidden="true" />
          </button>

          {shareMenuOpen ? (
            <div className="post-share-menu" role="menu" aria-label={t("feed.shareMenuTitle", uiLang)}>
              <p className="post-share-menu__title" data-i18n="feed.shareMenuTitle">
                {t("feed.shareMenuTitle", uiLang)}
              </p>
              <ul className="post-share-menu__list">
                {shareContacts.map((contact, index) => (
                  <li key={contact.peer}>
                    <button
                      type="button"
                      role="menuitem"
                      className={`post-share-menu__item${sharedContactId === contact.peer ? " post-share-menu__item--done" : ""}`}
                      style={{ animationDelay: `${index * 0.04}s` }}
                      onClick={() => shareWithContact(contact)}
                    >
                      <img
                        className="post-share-menu__avatar"
                        src={shareContactAvatar(contact)}
                        width="32"
                        height="32"
                        alt=""
                      />
                      <span className="post-share-menu__name">{contact.name}</span>
                      {sharedContactId === contact.peer ? (
                        <span className="post-share-menu__check" aria-hidden="true">
                          ✓
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" className="post-share-menu__copy" onClick={handleShareCopyLink} data-i18n="feed.shareCopyLink">
                {t("feed.shareCopyLink", uiLang)}
              </button>
            </div>
          ) : null}
        </div>
        </div>
      </div>

      <div className={`post-comments${commentsOpen ? " post-comments--open" : ""}`}>
        <div className="post-comments__inner">
          <div className="post-comments__body">
            <h5 className="post-comments__title" data-i18n="feed.commentsHeading">
              {t("feed.commentsHeading", uiLang)}
            </h5>
            <ul className="post-comments__list">
              {comments.map((comment, index) => (
                <li
                  key={comment.id}
                  className="post-comment"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <img
                    className="post-comment__avatar"
                    src={
                      isUsableAvatarUrl(comment.avatar)
                        ? comment.avatar
                        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(comment.seed || comment.author)}`
                    }
                    width="32"
                    height="32"
                    alt=""
                  />
                  <div className="post-comment__bubble">
                    <strong>{comment.author}</strong>
                    <p>{comment.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <form className="post-comments__form" onSubmit={submitComment}>
              <input
                ref={commentInputRef}
                type="text"
                className="post-comments__input"
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                placeholder={t("feed.commentPh", uiLang)}
                aria-label={t("feed.commentPh", uiLang)}
                maxLength={500}
              />
              <button type="submit" className="post-comments__submit" disabled={!commentDraft.trim()} data-i18n="feed.commentPost">
                {t("feed.commentPost", uiLang)}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

function readSession() {
  try {
    const raw = localStorage.getItem("authSession");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadUserPosts() {
  try {
    const raw = localStorage.getItem(USER_POSTS_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveUserPosts(posts) {
  try {
    localStorage.setItem(USER_POSTS_KEY, JSON.stringify(posts));
  } catch {
    /* quota or private mode */
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function HomePage({ session, onLogout }) {
  const [userPosts, setUserPosts] = useState(loadUserPosts);
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postVideo, setPostVideo] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageTab, setMessageTab] = useState("sorted");
  const [messageSearch, setMessageSearch] = useState("");
  const [actionHint, setActionHint] = useState("");
  const [uiLang, setUiLang] = useState(readUiLang);
  const [feedMockIds, setFeedMockIds] = useState(() => pickRandomFeedMockIds(FEED_MOCK_TEMPLATE, FEED_VISIBLE_MOCKS));
  const [feedRefreshBatch, setFeedRefreshBatch] = useState(0);
  const [feedUpdating, setFeedUpdating] = useState(false);
  const [messageOrder] = useState(() => shuffleList(MOCK_MESSAGES_TEMPLATE));
  const [connectedRevision, setConnectedRevision] = useState(0);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const composerRef = useRef(null);
  const userEmail = typeof session?.email === "string" && session.email ? session.email : "guest@linkup.local";
  const userName = userEmail.includes("@") ? userEmail.split("@")[0] : "guest";
  const displayName = session?.guest ? t("home.guest", uiLang) : userName;
  const profileName = [session?.firstName, session?.lastName].filter(Boolean).join(" ").trim() || displayName;
  const rawAvatar = typeof session?.avatarDataUrl === "string" ? session.avatarDataUrl.trim() : "";
  const userAvatar = isUsableAvatarUrl(rawAvatar)
    ? rawAvatar
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName || userEmail)}`;

  const localizedFeedPool = useMemo(
    () =>
      FEED_MOCK_TEMPLATE.map((post) => ({
        ...post,
        text: t(post.textKey, uiLang),
      })),
    [uiLang],
  );

  const mockPosts = useMemo(() => {
    const byId = new Map(localizedFeedPool.map((post) => [post.id, post]));
    const base = feedMockIds.map((id) => byId.get(id)).filter(Boolean);
    if (feedRefreshBatch === 0) return base;
    const fresh = pickFreshFeedMocks(
      localizedFeedPool,
      base.map((post) => post.id),
      feedRefreshBatch,
      2,
    ).map((post) => ({ ...post, isFresh: true }));
    return [...fresh, ...base];
  }, [localizedFeedPool, feedMockIds, feedRefreshBatch]);

  const posts = useMemo(() => [...userPosts, ...mockPosts], [userPosts, mockPosts]);

  const inboxMessages = useMemo(() => {
    const query = messageSearch.trim().toLowerCase();
    const connectedChats =
      typeof window.loadHomeChats === "function" ? window.loadHomeChats() : [];
    const connectedItems = connectedChats.map((chat) => {
      const peer =
        typeof window.canonicalPeerId === "function"
          ? window.canonicalPeerId(chat.id)
          : String(chat.id || "").trim().toLowerCase();
      return {
        id: `connected-${peer}`,
        peer,
        name: String(chat.name || peer).trim() || peer,
        seed: String(chat.name || peer).trim() || peer,
        avatar: typeof chat.avatar === "string" ? chat.avatar.trim() : "",
        preview: String(chat.preview || t("network.newChatPreview", uiLang)).trim(),
        time: String(chat.time || t("js.chatNow", uiLang)).trim(),
        tab: messageTab,
        unread: true,
      };
    });
    const connectedPeers = new Set(connectedItems.map((item) => item.peer));
    const localized = messageOrder
      .filter((item) => !connectedPeers.has(item.peer))
      .map((item) => ({
        ...item,
        preview: t(item.previewKey, uiLang),
        time: t(item.timeKey, uiLang),
      }));
    const matchesQuery = (item) => {
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        String(item.preview || "")
          .toLowerCase()
          .includes(query)
      );
    };
    const connectedFiltered = connectedItems.filter(matchesQuery);
    const staticFiltered = localized.filter(
      (item) => item.tab === messageTab && matchesQuery(item),
    );
    return [...connectedFiltered, ...staticFiltered];
  }, [messageOrder, messageSearch, messageTab, uiLang, connectedRevision]);

  const showHint = (key, vars) => {
    setActionHint(tmplText(key, vars, uiLang));
    window.setTimeout(() => setActionHint(""), 2200);
  };

  const clearComposerDraft = () => {
    setPostText("");
    setPostImage("");
    setPostVideo("");
    setShowEmojiPicker(false);
  };

  const canPublish = postText.trim() || postImage || postVideo;

  const handlePhotoPick = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showHint("feed.photoInvalid");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      showHint("feed.photoTooLarge");
      return;
    }
    try {
      const url = await readFileAsDataUrl(file);
      setPostImage(url);
      setPostVideo("");
      showHint("feed.photoAdded");
    } catch {
      showHint("feed.attachFailed");
    }
  };

  const handleVideoPick = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      showHint("feed.videoInvalid");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      showHint("feed.videoTooLarge");
      return;
    }
    try {
      const url = await readFileAsDataUrl(file);
      setPostImage("");
      setPostVideo(url);
      showHint("feed.videoAdded");
    } catch {
      showHint("feed.attachFailed");
    }
  };

  const insertEmoji = (emoji) => {
    setPostText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const publishPost = () => {
    const text = postText.trim();
    if (!text && !postImage && !postVideo) {
      showHint("feed.publishEmpty");
      return;
    }

    const newPost = {
      id: Date.now(),
      isOwn: true,
      role: t("home.you", uiLang),
      text,
      image: postImage || "",
      video: postVideo || "",
      createdAt: Date.now(),
    };
    setUserPosts((prev) => {
      const next = [newPost, ...prev];
      saveUserPosts(next);
      return next;
    });
    clearComposerDraft();
    showHint("feed.published");
  };

  const deletePost = (postId) => {
    setUserPosts((prev) => {
      const next = prev.filter((post) => post.id !== postId);
      saveUserPosts(next);
      return next;
    });
    showHint("feed.postDeleted");
  };

  const refreshFeed = () => {
    if (feedUpdating) return;
    setFeedUpdating(true);
    setFeedMockIds(pickRandomFeedMockIds(FEED_MOCK_TEMPLATE, FEED_VISIBLE_MOCKS));
    setFeedRefreshBatch((batch) => batch + 1);
    showHint("feed.updated");
    window.setTimeout(() => setFeedUpdating(false), 650);
  };

  const getMockPostKey = (post) => {
    if (post.isFresh) return `${post.id}-fresh-${feedRefreshBatch}`;
    return `${post.id}-${feedMockIds.join(".")}`;
  };

  const sendMessage = () => {
    window.location.href = "../chat/index.html";
  };

  const openMessageChat = (peer) => {
    if (!peer) return;
    window.location.href = `../chat/index.html?with=${encodeURIComponent(peer)}`;
  };

  const messageAvatar = (item) => {
    if (item.avatar) return item.avatar;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.seed || item.name)}`;
  };

  useEffect(() => {
    if (typeof window.syncThemeToggleI18n === "function") {
      window.syncThemeToggleI18n();
    }
  }, [uiLang]);

  useEffect(() => {
    const onConnectedUpdate = () => setConnectedRevision((value) => value + 1);
    document.addEventListener("homechatsupdated", onConnectedUpdate);
    return () => document.removeEventListener("homechatsupdated", onConnectedUpdate);
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setFeedMockIds(pickRandomFeedMockIds(FEED_MOCK_TEMPLATE, FEED_VISIBLE_MOCKS));
    }, FEED_ROTATE_MS);
    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!composerRef.current || composerRef.current.contains(event.target)) return;
      setShowEmojiPicker(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const onLanguageChange = (event) => {
    const next = event.target.value;
    if (next !== "en" && next !== "uk" && next !== "ru") return;
    setUiLang(next);
    if (typeof window.setUiLang === "function") {
      window.setUiLang(next);
    }
  };

  return (
    <main className="home-root">
      <header className="home-header" role="banner">
        <div className="home-header__inner">
          <a href="./index.html" className="home-logo" aria-label="Home">
            in
          </a>
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
            <button type="button" className="home-nav__item" onClick={() => showHint("home.hint.noNotifications")}>
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
          <button className="ghost-main" onClick={() => showHint("home.hint.savedElementsSoon")}>
            <span data-i18n="home.savedElements">Saved elements</span>
          </button>
        </aside>

        <section className="feed">
          <article className="composer" ref={composerRef}>
            <div className="composer-top">
              <img className="avatar avatar-img small" src={userAvatar} alt="" />
              <textarea
                className="composer-textarea"
                rows={2}
                value={postText}
                onChange={(event) => setPostText(event.target.value)}
                placeholder={t("feed.composerPlaceholder", uiLang)}
                aria-label={t("feed.composerPostAria", uiLang)}
              />
            </div>

            {postImage || postVideo ? (
              <div className="composer-preview">
                {postImage ? (
                  <img src={postImage} alt={t("feed.previewPhotoAlt", uiLang)} />
                ) : (
                  <video src={postVideo} controls className="composer-preview__video" />
                )}
                <button
                  type="button"
                  className="composer-preview__remove"
                  onClick={() => {
                    setPostImage("");
                    setPostVideo("");
                  }}
                >
                  {postVideo ? t("feed.removeVideo", uiLang) : t("feed.removePreview", uiLang)}
                </button>
              </div>
            ) : null}

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoPick}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              hidden
              onChange={handleVideoPick}
            />

            <div className="composer-actions">
              <div className="composer-actions__left">
                <button type="button" onClick={() => photoInputRef.current && photoInputRef.current.click()} data-i18n="feed.photo">
                  Photo
                </button>
                <button type="button" onClick={() => videoInputRef.current && videoInputRef.current.click()} data-i18n="feed.video">
                  Video
                </button>
                <div className="composer-emoji-wrap">
                  <button
                    type="button"
                    className={showEmojiPicker ? "composer-emoji-btn active" : "composer-emoji-btn"}
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowEmojiPicker((open) => !open);
                    }}
                    aria-expanded={showEmojiPicker}
                    aria-label={t("feed.emojiAria", uiLang)}
                  >
                    <span aria-hidden="true">😊</span>
                    <span data-i18n="feed.emoji">Emoji</span>
                  </button>
                  {showEmojiPicker ? (
                    <div className="composer-emoji-picker" role="listbox" aria-label={t("feed.emojiPickerAria", uiLang)}>
                      {FEED_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className="composer-emoji-picker__item"
                          onClick={() => insertEmoji(emoji)}
                          aria-label={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <button
                className="primary-mini"
                onClick={publishPost}
                disabled={!canPublish}
                data-i18n="feed.post"
              >
                Publish
              </button>
            </div>
          </article>

          <div className="feed-toolbar">
            <span className="feed-toolbar__line" aria-hidden="true" />
            <button
              type="button"
              className={`feed-update-btn${feedUpdating ? " feed-update-btn--busy" : ""}`}
              onClick={refreshFeed}
              disabled={feedUpdating}
              aria-busy={feedUpdating}
            >
              <span className="feed-update-btn__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08a5.99 5.99 0 01-5.65 4c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                </svg>
              </span>
              <span className="feed-update-btn__label" data-i18n="feed.updatePosts">
                {t("feed.updatePosts", uiLang)}
              </span>
              <span className="feed-update-btn__shine" aria-hidden="true" />
              <span className="feed-update-btn__ring" aria-hidden="true" />
            </button>
            <span className="feed-toolbar__line" aria-hidden="true" />
          </div>

          {posts.map((post, index) => (
            <article
              key={post.isOwn ? post.id : getMockPostKey(post)}
              className={`post-card${post.isOwn ? "" : " post-card--enter"}${post.isFresh ? " post-card--fresh" : ""}`}
              style={post.isOwn ? undefined : { animationDelay: `${Math.min(index, 5) * 0.07}s` }}
            >
              <div className="post-head">
                <img
                  className="avatar avatar-img small"
                  src={
                    post.isOwn
                      ? userAvatar
                      : isUsableAvatarUrl(post.avatar)
                        ? post.avatar
                        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.seed || post.author || "user")}`
                  }
                  alt=""
                />
                <div className="post-head__meta">
                  <strong>{post.isOwn ? displayName : post.author}</strong>
                  <p>{post.isOwn ? t("home.you", uiLang) : post.role}</p>
                </div>
                {post.isOwn ? (
                  <button
                    type="button"
                    className="post-delete"
                    onClick={() => deletePost(post.id)}
                    aria-label={t("js.deletePost", uiLang)}
                    title={t("js.delete", uiLang)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </button>
                ) : null}
              </div>
              {post.text ? <p className="post-text post-text--multiline">{post.text}</p> : null}
              {post.video ? (
                <video className="post-media post-media--video" src={post.video} controls playsInline />
              ) : null}
              {!post.video && post.image ? (
                <PostPhoto post={post} alt={t("feed.postMediaAlt", uiLang)} />
              ) : null}
              <PostEngagement
                post={post}
                uiLang={uiLang}
                userLabel={displayName}
                userAvatar={userAvatar}
                onHint={showHint}
              />
            </article>
          ))}
        </section>

        <aside className="right-card">
          <div className="right-top">
            <h4 data-i18n="widget.title">Messages</h4>
            <button onClick={onLogout} data-i18n="home.logout">
              Log out
            </button>
          </div>
          <input
            className="search small-input"
            placeholder={t("widget.searchPh", uiLang)}
            aria-label={t("widget.searchAria", uiLang)}
            value={messageSearch}
            onChange={(event) => setMessageSearch(event.target.value)}
          />
          <div className="msg-tabs">
            <button
              type="button"
              className={messageTab === "sorted" ? "active" : ""}
              onClick={() => setMessageTab("sorted")}
              data-i18n="widget.tabSorted"
            >
              Sorted
            </button>
            <button
              type="button"
              className={messageTab === "other" ? "active" : ""}
              onClick={() => setMessageTab("other")}
              data-i18n="widget.tabOther"
            >
              Other
            </button>
          </div>
          <div className="msg-list msg-list--live">
            {inboxMessages.length === 0 ? (
              <p className="muted" data-i18n="home.msgNoResults">
                No messages match your search.
              </p>
            ) : (
              inboxMessages.map((item, index) => (
                <a
                  key={item.id}
                  className={`msg-row${item.unread ? " msg-row--unread" : ""}`}
                  style={{ animationDelay: `${index * 0.07}s` }}
                  href={`../chat/index.html?with=${encodeURIComponent(item.peer)}`}
                  onClick={(event) => {
                    event.preventDefault();
                    openMessageChat(item.peer);
                  }}
                  aria-label={`${item.name} — ${item.preview}`}
                >
                  <img className="msg-row__avatar" src={messageAvatar(item)} width="40" height="40" alt="" />
                  <span className="msg-row__body">
                    <span className="msg-row__head">
                      <strong className="msg-row__name">{item.name}</strong>
                      <time className="msg-row__time">{item.time}</time>
                    </span>
                    <span className="msg-row__preview">{item.preview}</span>
                  </span>
                  {item.unread ? <span className="msg-row__dot" aria-hidden="true" /> : null}
                </a>
              ))
            )}
          </div>
          <button type="button" className="ghost-main" onClick={sendMessage} data-i18n="widget.cta">
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
            <span className="footer-lang__label" data-i18n="home.langLabel">
              Язык интерфейса
            </span>
            <select
              name="lang"
              data-ui-lang
              data-i18n-aria="footer.langAria"
              id="uiLangSelectHome"
              value={uiLang}
              onChange={onLanguageChange}
            >
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
        <a href={AUTH_PAGE_URL} data-i18n="home.goRegister">
          Перейти к регистрации
        </a>
      </main>
    );
  }

  return <HomePage session={session} onLogout={logout} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
