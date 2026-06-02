import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { useChatStore } from "../../features/chat/ChatStore";
import { useUiSettings } from "../../app/providers/AppProviders";
import { AI_ASSISTANT_PEER_ID } from "../../shared/constants/aiAssistant";
import { MESSAGING_CONTACTS } from "../../shared/constants/messagingContacts";
import { getContactAvatarUrl, getContactProfile } from "../../shared/constants/contactProfiles";
import { getMessagePreview } from "../../shared/lib/callMessage";
import { readRegisteredAccount } from "../../shared/lib/registeredAccount";
import "./home-legacy.css";

const USER_POSTS_KEY = "homeUserPosts";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 12 * 1024 * 1024;
const FEED_VISIBLE_MOCKS = 6;
const FEED_ROTATE_MS = 60000;
const FEED_EMOJIS = ["😀", "😂", "😍", "🥳", "👍", "👏", "🔥", "💜", "🎉", "😎", "🤔", "💡", "🚀", "✨"];

const FEED_MOCK_TEMPLATE = [
  { id: "m1", author: "Sarah Chen", seed: "SarahChen", role: "Product Designer", text: "Clean handoff with design tokens is half of frontend success.", likes: 23, image: "https://picsum.photos/seed/linkup-m1/960/520" },
  { id: "m2", author: "Marcus Dias", seed: "MarcusDias", role: "Frontend Developer", text: "Migrated another route to SPA, no full reload now.", likes: 18, image: "https://picsum.photos/seed/linkup-m2/960/520" },
  { id: "m3", author: "Elena Volkov", seed: "ElenaVolkov", role: "QA Engineer", text: "Regression tests are green after UI migration.", likes: 12, image: "https://picsum.photos/seed/linkup-m3/960/520" },
  { id: "m4", author: "Priya Patel", seed: "PriyaPatel", role: "DevOps Engineer", text: "Frontend build time is stable after splitting modules.", likes: 31, image: "https://picsum.photos/seed/linkup-m4/960/520" },
  { id: "m5", author: "James Lee", seed: "JamesLee", role: "UI Engineer", text: "Header alignment stays static across pages now.", likes: 27, image: "https://picsum.photos/seed/linkup-m5/960/520" },
  { id: "m6", author: "Duncan Callahan", seed: "DuncanCallahan", role: "UX Researcher", text: "Single search field in header feels much cleaner.", likes: 16, image: "https://picsum.photos/seed/linkup-m6/960/520" },
  { id: "m7", author: "Nina Petrova", seed: "NinaPetrova", role: "Product Manager", text: "Please keep interactions smooth on mobile too.", likes: 14, image: "https://picsum.photos/seed/linkup-m7/960/520" },
  { id: "m8", author: "Abram Lee", seed: "AbramLee", role: "Backend Engineer", text: "Unified API client will simplify integration.", likes: 29, image: "https://picsum.photos/seed/linkup-m8/960/520" },
];

export const INBOX_TEMPLATE = [
  {
    id: "msg-sarah",
    peer: "sarahchen",
    name: "Sarah Chen",
    seed: "SarahChen",
    previewKey: "home.msgPreview1",
    previewFallback: "Could you review my branch?",
    timeKey: "home.msgTime1",
    timeFallback: "13m",
    tab: "sorted",
    unread: true,
  },
  {
    id: "msg-marcus",
    peer: "marcus",
    name: "Marcus Dias",
    seed: "MarcusDias",
    previewKey: "home.msgPreview2",
    previewFallback: "Header is stable now, thanks!",
    timeKey: "home.msgTime2",
    timeFallback: "28m",
    tab: "sorted",
  },
  {
    id: "msg-elena",
    peer: "elenavolkov",
    name: "Elena Volkov",
    seed: "ElenaVolkov",
    previewKey: "home.msgPreview3",
    previewFallback: "Smoke check passed on my side.",
    timeKey: "home.msgTime3",
    timeFallback: "1h",
    tab: "sorted",
    unread: true,
  },
  {
    id: "msg-duncan",
    peer: "duncanux",
    name: "Duncan Callahan",
    seed: "DuncanCallahan",
    previewKey: "home.msgPreview4",
    previewFallback: "Need one more polish on cards.",
    timeKey: "home.msgTime4",
    timeFallback: "2h",
    tab: "other",
  },
  {
    id: "msg-james",
    peer: "jamesleedev",
    name: "James Lee",
    seed: "JamesLee",
    previewKey: "home.msgPreview5",
    previewFallback: "Can we sync on profile page?",
    timeKey: "home.msgTime5",
    timeFallback: "4h",
    tab: "sorted",
  },
  {
    id: "msg-nina",
    peer: "ninapetrova",
    name: "Nina Petrova",
    seed: "NinaPetrova",
    previewKey: "home.msgPreview6",
    previewFallback: "Please update PR summary.",
    timeKey: "home.msgTime6",
    timeFallback: "1d",
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
    previewFallback: "Can we sync backend contracts?",
    timeKey: "home.msgTime7",
    timeFallback: "1d",
    tab: "other",
  },
  {
    id: "msg-priya",
    peer: "priyadevops",
    name: "Priya Patel",
    seed: "PriyaPatel",
    previewKey: "home.msgPreview8",
    previewFallback: "Deployed successfully, all checks green.",
    timeKey: "home.msgTime8",
    timeFallback: "2d",
    tab: "sorted",
  },
];

function shuffleList(items) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

import {
  countUnreadIncoming,
  isInboxPeerRead,
  markInboxPeerRead,
} from "../../shared/lib/messageRead";

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
  for (let i = 0; i < take; i += 1) out.push(available[(offset + i) % available.length]);
  return out;
}

function loadUserPosts() {
  try {
    const raw = localStorage.getItem(USER_POSTS_KEY);
    const data = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(data)) return [];
    return data
      .filter((item) => item && typeof item === "object")
      .map((item, index) => ({
        id: String(item.id || `legacy-${index}`),
        isOwn: true,
        author: typeof item.author === "string" && item.author ? item.author : "You",
        seed: typeof item.seed === "string" && item.seed ? item.seed : "You",
        role: typeof item.role === "string" && item.role ? item.role : "You",
        text: typeof item.text === "string" ? item.text : "",
        image: typeof item.image === "string" ? item.image : "",
        video: typeof item.video === "string" ? item.video : "",
        likes: Number.isFinite(Number(item.likes)) ? Number(item.likes) : 0,
        createdAt: Number.isFinite(Number(item.createdAt)) ? Number(item.createdAt) : Date.now(),
        avatar: typeof item.avatar === "string" ? item.avatar : "",
        comments: Array.isArray(item.comments)
          ? item.comments
              .filter((comment) => comment && typeof comment === "object")
              .map((comment, commentIndex) => ({
                id: String(comment.id || `${item.id}-c-${commentIndex}`),
                author: typeof comment.author === "string" ? comment.author : "User",
                seed: typeof comment.seed === "string" ? comment.seed : "User",
                text: typeof comment.text === "string" ? comment.text : "",
              }))
          : [],
      }));
  } catch {
    return [];
  }
}

function saveUserPosts(posts) {
  try {
    localStorage.setItem(USER_POSTS_KEY, JSON.stringify(posts));
  } catch {
    // ignore storage errors
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

function avatarUrl(seed) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed || "user")}`;
}

function resolvePostAvatar(post, userAvatar) {
  if (typeof post?.avatar === "string" && post.avatar.trim()) return post.avatar;
  if (post?.isOwn && userAvatar) return userAvatar;
  return avatarUrl(post?.seed || post?.author);
}

function buildCelebrationComments(postId, t) {
  return [
    { id: `${postId}-c1`, author: "Sarah Chen", seed: "SarahChen", text: t("home.post.commentBravo", "Well done!") },
    { id: `${postId}-c2`, author: "Marcus Dias", seed: "MarcusDias", text: t("home.post.commentCool", "Cool!") },
    { id: `${postId}-c3`, author: "Elena Volkov", seed: "ElenaVolkov", text: "🔥✨" },
    { id: `${postId}-c4`, author: "James Lee", seed: "JamesLee", text: "🎉🎊🎉" },
    { id: `${postId}-c5`, author: "Nina Petrova", seed: "NinaPetrova", text: "👏💜" },
  ];
}

function getPostComments(post, t) {
  if (Array.isArray(post.comments) && post.comments.length > 0) {
    return post.comments.filter((item) => item && typeof item === "object");
  }
  if (post.isOwn) return buildCelebrationComments(post.id, t);
  return [
    { id: `${post.id}-c1`, author: "Sarah Chen", seed: "SarahChen", text: "Nice update!" },
    { id: `${post.id}-c2`, author: "Marcus Dias", seed: "MarcusDias", text: "Looks solid." },
  ];
}

function resolvePostImage(post) {
  if (!post || typeof post !== "object") return "";
  if (typeof post.image === "string" && post.image.trim()) return post.image;
  if (!post.isOwn) return `https://picsum.photos/seed/linkup-fallback-${encodeURIComponent(String(post.id || "post"))}/960/520`;
  return "";
}

function buildShareContacts() {
  const canonicalPeerId =
    typeof window !== "undefined" && typeof window.canonicalPeerId === "function"
      ? window.canonicalPeerId
      : (value) => String(value || "").trim().toLowerCase();
  const loadHomeChats =
    typeof window !== "undefined" && typeof window.loadHomeChats === "function"
      ? window.loadHomeChats
      : () => [];
  const contacts = [];
  const seen = new Set();

  loadHomeChats().forEach((chat) => {
    const peerId = canonicalPeerId(chat?.id);
    if (!peerId || seen.has(peerId)) return;
    seen.add(peerId);
    contacts.push({
      peerId,
      name: String(chat.name || peerId).trim() || peerId,
      avatar: chat.avatar || avatarUrl(chat.seed || chat.name || peerId),
      seed: chat.seed || chat.name || peerId,
    });
  });

  Object.entries(MESSAGING_CONTACTS).forEach(([id, meta]) => {
    const peerId = canonicalPeerId(id);
    if (!peerId || seen.has(peerId)) return;
    seen.add(peerId);
    contacts.push({
      peerId,
      name: meta.name,
      avatar: meta.avatar || avatarUrl(meta.seed || meta.name),
      seed: meta.seed || meta.name,
    });
  });

  return contacts;
}

function PostEngagement({ post, onHint, t, shareContacts, onSharePost }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => {
    const stored = Number(post.likes || 0);
    if (stored > 0) return stored;
    return post.isOwn ? 5 : 0;
  });
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [comments, setComments] = useState(() => getPostComments(post, t));
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [sharedTo, setSharedTo] = useState(() => new Set());
  const shareWrapRef = useRef(null);

  useEffect(() => {
    if (!shareMenuOpen) return undefined;
    const onDocClick = (event) => {
      if (!shareWrapRef.current || shareWrapRef.current.contains(event.target)) return;
      setShareMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [shareMenuOpen]);

  const handleShareToContact = (contact) => {
    onSharePost(post, contact);
    setSharedTo((prev) => new Set(prev).add(contact.peerId));
  };

  return (
    <>
      <div className={`post-stats${liked ? " post-stats--liked" : ""}`}>
        <span className="post-stats__likes">
          <span className={`post-stats__heart${liked ? " post-stats__heart--on" : ""}`}>♥</span>
          {likeCount}
        </span>
        <button type="button" className="post-stats__comments-btn" onClick={() => setCommentsOpen((v) => !v)}>
          {comments.length} {t("home.post.comments", "comments")}
        </button>
      </div>

      <div className="post-actions">
        <div className="post-actions__bar">
          <button
            type="button"
            className={`post-action post-action--like${liked ? " post-action--liked" : ""}`}
            onClick={() => {
              setLiked((v) => !v);
              setLikeCount((v) => Math.max(0, v + (liked ? -1 : 1)));
            }}
          >
            <span className="post-action__icon">♥</span>
            <span className="post-action__label">{liked ? t("home.post.liked", "Liked") : t("home.post.like", "Like")}</span>
          </button>
          <button type="button" className={`post-action post-action--comment${commentsOpen ? " post-action--active" : ""}`} onClick={() => setCommentsOpen((v) => !v)}>
            <span className="post-action__icon">💬</span>
            <span className="post-action__label">{t("home.post.comment", "Comment")}</span>
          </button>
          <div className="post-action-wrap--share" ref={shareWrapRef}>
            <button
              type="button"
              className={`post-action post-action--share${shareMenuOpen ? " post-action--active" : ""}`}
              onClick={(event) => {
                event.stopPropagation();
                setShareMenuOpen((open) => !open);
              }}
            >
              <span className="post-action__icon">↗</span>
              <span className="post-action__label">{t("home.post.share", "Share")}</span>
            </button>
            {shareMenuOpen ? (
              <div className="post-share-menu" role="menu" aria-label={t("home.post.shareWith", "Share with")}>
                <p className="post-share-menu__title">{t("home.post.shareWith", "Share with")}</p>
                <ul className="post-share-menu__list">
                  {shareContacts.map((contact, index) => {
                    const done = sharedTo.has(contact.peerId);
                    return (
                      <li key={contact.peerId}>
                        <button
                          type="button"
                          className={done ? "post-share-menu__item post-share-menu__item--done" : "post-share-menu__item"}
                          style={{ animationDelay: `${index * 0.04}s` }}
                          role="menuitem"
                          onClick={() => handleShareToContact(contact)}
                        >
                          <img className="post-share-menu__avatar" src={contact.avatar} width="32" height="32" alt="" />
                          <span className="post-share-menu__name">{contact.name}</span>
                          {done ? <span className="post-share-menu__check" aria-hidden="true">✓</span> : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <button
                  type="button"
                  className="post-share-menu__copy"
                  onClick={() => {
                    onHint(t("home.hint.linkCopied", "Link copied"));
                    navigator.clipboard?.writeText(window.location.href);
                  }}
                >
                  {t("home.post.copyLink", "Copy link")}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className={`post-comments${commentsOpen ? " post-comments--open" : ""}`}>
        <div className="post-comments__inner">
          <div className="post-comments__body">
            <h5 className="post-comments__title">{t("home.post.comments", "Comments")}</h5>
            <ul className="post-comments__list">
              {comments.map((comment) => (
                <li key={comment.id} className="post-comment">
                  <img className="post-comment__avatar" src={avatarUrl(comment.seed)} width="32" height="32" alt="" />
                  <div className="post-comment__bubble">
                    <strong>{comment.author}</strong>
                    <p>{comment.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <form
              className="post-comments__form"
              onSubmit={(event) => {
                event.preventDefault();
                const text = commentDraft.trim();
                if (!text) return;
                setComments((prev) => [...prev, { id: `${post.id}-${Date.now()}`, author: "You", seed: "You", text }]);
                setCommentDraft("");
              }}
            >
              <input
                type="text"
                className="post-comments__input"
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                placeholder={t("home.post.writeComment", "Write a comment...")}
              />
              <button type="submit" className="post-comments__submit" disabled={!commentDraft.trim()}>
                {t("home.post.submitComment", "Post")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { t } = useUiSettings();
  const { chats, setActiveChat, markChatAsReadByPeer, sharePostToContact } = useChatStore();

  const [userPosts, setUserPosts] = useState(loadUserPosts);
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postVideo, setPostVideo] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageSearch, setMessageSearch] = useState("");
  const [actionHint, setActionHint] = useState("");
  const [feedMockIds, setFeedMockIds] = useState(() => pickRandomFeedMockIds(FEED_MOCK_TEMPLATE, FEED_VISIBLE_MOCKS));
  const [feedRefreshBatch, setFeedRefreshBatch] = useState(0);
  const [feedUpdating, setFeedUpdating] = useState(false);
  const [messageOrder] = useState(() => shuffleList(INBOX_TEMPLATE));
  const [messagesRefreshTick, forceMessagesRerender] = useState(0);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const composerRef = useRef(null);

  const displayName = session.user?.name || t("common.guest", "Guest");
  const userAvatar = useMemo(() => {
    const fromSession = String(session.user?.avatarDataUrl || "").trim();
    if (fromSession) return fromSession;

    const account = readRegisteredAccount();
    const fromProfile = String(account.avatarDataUrl || "").trim();
    if (fromProfile) return fromProfile;
    return avatarUrl(displayName);
  }, [displayName, session.user?.avatarDataUrl]);

  const mockPosts = useMemo(() => {
    const byId = new Map(FEED_MOCK_TEMPLATE.map((post) => [post.id, post]));
    const base = feedMockIds.map((id) => byId.get(id)).filter(Boolean);
    const safeBase =
      base.length > 0
        ? base
        : FEED_MOCK_TEMPLATE.slice(0, Math.min(FEED_VISIBLE_MOCKS, FEED_MOCK_TEMPLATE.length));
    if (feedRefreshBatch === 0) return safeBase;
    const fresh = pickFreshFeedMocks(
      FEED_MOCK_TEMPLATE,
      safeBase.map((post) => post.id),
      feedRefreshBatch,
      2,
    ).map((post) => ({ ...post, isFresh: true }));
    return [...fresh, ...safeBase];
  }, [feedMockIds, feedRefreshBatch]);

  const posts = useMemo(() => {
    const normalizedUserPosts = userPosts.filter((post) => post && typeof post === "object");
    const normalizedMockPosts = mockPosts.filter((post) => post && typeof post === "object");
    const merged = [...normalizedUserPosts, ...normalizedMockPosts];
    if (merged.length > 0) return merged;
    return FEED_MOCK_TEMPLATE.slice(0, 3);
  }, [userPosts, mockPosts]);

  const inboxMessages = useMemo(() => {
    const query = messageSearch.trim().toLowerCase();
    const canonicalPeerId =
      typeof window.canonicalPeerId === "function"
        ? window.canonicalPeerId
        : (value) => String(value || "").trim().toLowerCase();
    const loadHomeChats = typeof window.loadHomeChats === "function" ? window.loadHomeChats : () => [];
    const storeChatByPeer = new Map();
    chats.forEach((chat) => {
      const peer = canonicalPeerId(chat.id || chat.peer);
      if (peer) storeChatByPeer.set(peer, chat);
    });

    const connectedDedup = [];
    const seenConnected = new Set();

    loadHomeChats().forEach((chat) => {
      const peer = canonicalPeerId(chat.id);
      if (!peer || seenConnected.has(peer)) return;
      seenConnected.add(peer);

      const storeChat = storeChatByPeer.get(peer);
      const messages = Array.isArray(storeChat?.messages) ? storeChat.messages : [];
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

      connectedDedup.push({
        id: `msg-connected-${peer}`,
        peer,
        name: String(chat.name || peer).trim() || peer,
        preview:
          (lastMessage && getMessagePreview(lastMessage, t)) ||
          String(chat.preview || t("network.newChatPreview", "Start the conversation...")).trim(),
        time: String(chat.time || t("js.chatNow", "Now")).trim(),
        tab: "connected",
        unread: countUnreadIncoming(storeChat || { messages }),
        avatar: chat.avatar || "",
        seed: chat.seed || chat.name || peer,
      });
    });

    chats.forEach((chat) => {
      const peer = canonicalPeerId(chat.id || chat.peer);
      if (!peer || seenConnected.has(peer)) return;
      seenConnected.add(peer);

      const messages = Array.isArray(chat.messages) ? chat.messages : [];
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      const isAiAssistant = peer === canonicalPeerId(AI_ASSISTANT_PEER_ID);

      const unreadCount = countUnreadIncoming(chat);

      connectedDedup.push({
        id: `msg-store-${peer || chat.id}`,
        peer: peer || String(chat.id),
        name: isAiAssistant ? t("notify.aiAssistantName", "AI Assistant") : chat.peer,
        preview:
          (lastMessage && getMessagePreview(lastMessage, t)) ||
          t("home.messages.noneYet", "No messages yet"),
        time: isAiAssistant ? t("notify.time.now", "now") : t("notify.time.now", "now"),
        tab: "connected",
        unread: unreadCount > 0,
        unreadCount,
        avatar: isAiAssistant
          ? getContactAvatarUrl(
              getContactProfile(AI_ASSISTANT_PEER_ID, { name: t("notify.aiAssistantName", "AI Assistant") }),
              AI_ASSISTANT_PEER_ID,
            )
          : avatarUrl(chat.peer),
        seed: chat.peer,
        isAi: isAiAssistant,
      });
    });

    const connectedPeers = new Set(connectedDedup.map((item) => canonicalPeerId(item.peer)));
    const staticFiltered = messageOrder
      .filter((item) => !connectedPeers.has(canonicalPeerId(item.peer)))
      .map((item) => ({
        ...item,
        preview: t(item.previewKey, item.previewFallback || ""),
        time: t(item.timeKey, item.timeFallback || ""),
        unread: Boolean(item.unread) && !isInboxPeerRead(canonicalPeerId(item.peer)),
      }));
    const all = [...connectedDedup, ...staticFiltered].sort((a, b) => {
      if (Boolean(a.unread) !== Boolean(b.unread)) return Number(Boolean(b.unread)) - Number(Boolean(a.unread));
      return (b.unreadCount || 0) - (a.unreadCount || 0);
    });
    if (!query) return all;
    return all.filter((item) => item.name.toLowerCase().includes(query) || String(item.preview || "").toLowerCase().includes(query));
  }, [chats, messageOrder, messageSearch, t, messagesRefreshTick]);

  const shareContacts = useMemo(() => buildShareContacts(), [chats, messagesRefreshTick]);

  const showHint = (text) => {
    setActionHint(text);
    window.setTimeout(() => setActionHint(""), 2200);
  };

  const handleSharePost = (post, contact) => {
    sharePostToContact({
      peer: contact.name,
      peerId: contact.peerId,
      post: {
        ...post,
        image: resolvePostImage(post),
      },
    });
    showHint(t("home.hint.postShared", "Post shared with {name}").replace("{name}", contact.name));
  };

  const canPublish = postText.trim() || postImage || postVideo;
  const hasPosts = posts.length > 0;

  const handlePhotoPick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return showHint(t("home.hint.onlyImages", "Only image files are allowed"));
    if (file.size > MAX_IMAGE_BYTES) return showHint(t("home.hint.imageLarge", "Image is too large"));
    try {
      const url = await readFileAsDataUrl(file);
      setPostImage(url);
      setPostVideo("");
    } catch {
      showHint(t("home.hint.attachFail", "Failed to attach file"));
    }
  };

  const handleVideoPick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) return showHint(t("home.hint.onlyVideos", "Only video files are allowed"));
    if (file.size > MAX_VIDEO_BYTES) return showHint(t("home.hint.videoLarge", "Video is too large"));
    try {
      const url = await readFileAsDataUrl(file);
      setPostImage("");
      setPostVideo(url);
    } catch {
      showHint(t("home.hint.attachFail", "Failed to attach file"));
    }
  };

  const publishPost = () => {
    const text = postText.trim();
    if (!text && !postImage && !postVideo) return showHint(t("home.hint.emptyPost", "Post cannot be empty"));
    const postId = `own-${Date.now()}`;
    const newPost = {
      id: postId,
      isOwn: true,
      author: displayName,
      seed: displayName,
      avatar: userAvatar,
      role: t("home.you", "You"),
      text,
      image: postImage || "",
      video: postVideo || "",
      likes: 5,
      comments: buildCelebrationComments(postId, t),
      createdAt: Date.now(),
    };
    setUserPosts((prev) => {
      const next = [newPost, ...prev];
      saveUserPosts(next);
      return next;
    });
    setPostText("");
    setPostImage("");
    setPostVideo("");
    setShowEmojiPicker(false);
    showHint(t("home.hint.postPublished", "Post published"));
  };

  const deletePost = (postId) => {
    setUserPosts((prev) => {
      const next = prev.filter((post) => post.id !== postId);
      saveUserPosts(next);
      return next;
    });
    showHint(t("home.hint.postDeleted", "Post deleted"));
  };

  const refreshFeed = () => {
    if (feedUpdating) return;
    setFeedUpdating(true);
    setFeedMockIds(pickRandomFeedMockIds(FEED_MOCK_TEMPLATE, FEED_VISIBLE_MOCKS));
    setFeedRefreshBatch((batch) => batch + 1);
    showHint(t("home.hint.feedUpdated", "Feed updated"));
    window.setTimeout(() => setFeedUpdating(false), 650);
  };

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

  useEffect(() => {
    const rerender = () => forceMessagesRerender((v) => v + 1);
    document.addEventListener("homechatsupdated", rerender);
    document.addEventListener("chatread", rerender);
    document.addEventListener("uilangchange", rerender);
    window.renderMessagesWidget = rerender;
    return () => {
      document.removeEventListener("homechatsupdated", rerender);
      document.removeEventListener("chatread", rerender);
      document.removeEventListener("uilangchange", rerender);
      delete window.renderMessagesWidget;
    };
  }, []);

  return (
    <main className="page-home-legacy">
      {actionHint ? <div className="action-hint">{actionHint}</div> : null}

      <section className="home-layout">
        <aside className="left-card">
          <div className="left-card__main">
            <img className="avatar avatar-img" src={userAvatar} alt="" />
            <h3>{displayName}</h3>
            <p>{t("home.role", "Front-end Developer")}</p>
            <hr />
            <div className="metric">
              <span>{t("home.metric.contacts", "Contacts")}</span>
              <strong>73</strong>
            </div>
            <div className="metric">
              <span>{t("home.metric.viewed", "Who viewed profile")}</span>
              <strong>420</strong>
            </div>
            <button className="ghost-main" onClick={() => navigate("/profile")}>
              {t("home.saved", "Saved elements")}
            </button>
          </div>
          <div className="left-card__extras">
            <h5>{t("home.card.quickTitle", "Quick overview")}</h5>
            <div className="left-card__extra-item">
              <span>{t("home.card.weekViews", "Views this week")}</span>
              <strong>128</strong>
            </div>
            <div className="left-card__extra-item">
              <span>{t("home.card.newContacts", "New contacts")}</span>
              <strong>9</strong>
            </div>
            <div className="left-card__extra-item">
              <span>{t("home.card.messages", "Unread messages")}</span>
              <strong>{inboxMessages.filter((item) => item.unread).length}</strong>
            </div>
            <button type="button" className="ghost-main" onClick={() => navigate("/network")}>
              {t("home.card.growNetwork", "Grow your network")}
            </button>
          </div>
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
                placeholder={t("home.startPost", "Start a post...")}
              />
            </div>

            {postImage || postVideo ? (
              <div className="composer-preview">
                {postImage ? <img src={postImage} alt={t("home.preview", "Post preview")} /> : <video src={postVideo} controls className="composer-preview__video" />}
                <button type="button" className="composer-preview__remove" onClick={() => { setPostImage(""); setPostVideo(""); }}>
                  {t("home.remove", "Remove")}
                </button>
              </div>
            ) : null}

            <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={handlePhotoPick} />
            <input ref={videoInputRef} type="file" accept="video/*" hidden onChange={handleVideoPick} />

            <div className="composer-actions">
              <div className="composer-actions__left">
                <button type="button" onClick={() => photoInputRef.current?.click()}>{t("home.photo", "Photo")}</button>
                <button type="button" onClick={() => videoInputRef.current?.click()}>{t("home.video", "Video")}</button>
                <div className="composer-emoji-wrap">
                  <button type="button" className={showEmojiPicker ? "composer-emoji-btn active" : "composer-emoji-btn"} onClick={(event) => { event.stopPropagation(); setShowEmojiPicker((open) => !open); }}>
                    <span aria-hidden="true">😊</span>
                    <span>{t("home.emoji", "Emoji")}</span>
                  </button>
                  {showEmojiPicker ? (
                    <div className="composer-emoji-picker" role="listbox" aria-label={t("home.emojiPicker", "Emoji picker")}>
                      {FEED_EMOJIS.map((emoji) => (
                        <button key={emoji} type="button" className="composer-emoji-picker__item" onClick={() => { setPostText((prev) => prev + emoji); setShowEmojiPicker(false); }} aria-label={emoji}>
                          {emoji}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <button className="primary-mini" onClick={publishPost} disabled={!canPublish}>{t("home.publish", "Publish")}</button>
            </div>
          </article>

          <div className="feed-toolbar">
            <span className="feed-toolbar__line" aria-hidden="true" />
            <button type="button" className={`feed-update-btn${feedUpdating ? " feed-update-btn--busy" : ""}`} onClick={refreshFeed} disabled={feedUpdating}>
              <span className="feed-update-btn__icon" aria-hidden="true">↻</span>
              <span className="feed-update-btn__label">{t("home.updatePosts", "Update posts")}</span>
              <span className="feed-update-btn__shine" aria-hidden="true" />
              <span className="feed-update-btn__ring" aria-hidden="true" />
            </button>
            <span className="feed-toolbar__line" aria-hidden="true" />
          </div>

          {hasPosts ? (
            posts.map((post, index) => (
              <article key={post.id} className={`post-card${post.isOwn ? "" : " post-card--enter"}${post.isFresh ? " post-card--fresh" : ""}`} style={post.isOwn ? undefined : { animationDelay: `${Math.min(index, 5) * 0.07}s` }}>
                <div className="post-head">
                  <img className="avatar avatar-img small" src={resolvePostAvatar(post, userAvatar)} alt="" />
                  <div className="post-head__meta">
                    <strong>{post.author}</strong>
                    <p>{post.role}</p>
                  </div>
                  {post.isOwn ? (
                    <button type="button" className="post-delete" onClick={() => deletePost(post.id)} aria-label={t("home.deletePost", "Delete post")} title={t("home.delete", "Delete")}>
                      ×
                    </button>
                  ) : null}
                </div>
                {post.text ? <p className="post-text post-text--multiline">{post.text}</p> : null}
                {post.video ? <video className="post-media post-media--video" src={post.video} controls playsInline /> : null}
                {!post.video && resolvePostImage(post) ? (
                  <img className="post-media post-media--photo" src={resolvePostImage(post)} alt={t("home.postMedia", "Post media")} loading="lazy" />
                ) : null}
                <PostEngagement
                  post={post}
                  onHint={showHint}
                  t={t}
                  shareContacts={shareContacts}
                  onSharePost={handleSharePost}
                />
              </article>
            ))
          ) : (
            <article className="post-card">
              <p className="muted">{t("home.postsUnavailable", "Posts are temporarily unavailable.")}</p>
              <button type="button" className="ghost-main" onClick={refreshFeed}>
                {t("home.reloadFeed", "Reload feed")}
              </button>
            </article>
          )}
        </section>

        <aside className="right-card" id="homeMessagesWidgetBody">
          <div className="right-top">
            <h4>{t("home.messages.title", "Messages")}</h4>
          </div>
          <input className="search small-input" placeholder={t("home.messages.search", "Search messages...")} value={messageSearch} onChange={(event) => setMessageSearch(event.target.value)} />
          <div className="msg-list msg-list--live" id="homeMessagesWidgetList">
            {inboxMessages.length === 0 ? (
              <p className="muted" id="homeMessagesWidgetListEmpty">
                {t("home.messages.noMatch", "No messages match your search.")}
              </p>
            ) : (
              inboxMessages.map((item, index) => (
                <button
                  key={item.id}
                  className={`msg-row${item.unread ? " msg-row--unread" : ""}${item.isAi ? " msg-row--ai" : ""}`}
                  style={{ animationDelay: `${index * 0.07}s` }}
                  onClick={() => {
                    const canonical =
                      typeof window.canonicalPeerId === "function"
                        ? window.canonicalPeerId(item.peer)
                        : String(item.peer || "").toLowerCase();
                    markInboxPeerRead(canonical);
                    markChatAsReadByPeer(canonical);
                    const target =
                      chats.find((chat) => {
                        const byId =
                          typeof window.canonicalPeerId === "function"
                            ? window.canonicalPeerId(chat.id || chat.peer)
                            : String(chat.id || chat.peer || "").toLowerCase();
                        const byPeer =
                          typeof window.canonicalPeerId === "function"
                            ? window.canonicalPeerId(chat.peer)
                            : String(chat.peer || "").toLowerCase();
                        return byId === canonical || byPeer === canonical;
                      }) || null;
                    if (target) setActiveChat(target.id);
                    forceMessagesRerender((value) => value + 1);
                    navigate("/chat");
                  }}
                  aria-label={`${item.name} — ${item.preview}`}
                >
                  <img className="msg-row__avatar" src={item.avatar || avatarUrl(item.name)} width="40" height="40" alt="" />
                  <span className="msg-row__body">
                    <span className="msg-row__head">
                      <strong className="msg-row__name">{item.name}</strong>
                      <time className="msg-row__time">{item.time}</time>
                    </span>
                    <span className="msg-row__preview">{item.preview}</span>
                  </span>
                  {item.unread ? <span className="msg-row__dot" aria-hidden="true" /> : null}
                </button>
              ))
            )}
          </div>
          <button type="button" className="ghost-main" onClick={() => navigate("/chat")}>{t("home.messages.send", "Send message")}</button>
        </aside>
      </section>

    </main>
  );
}
