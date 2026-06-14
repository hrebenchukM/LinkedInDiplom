import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import * as contentApi from "../../features/content/contentApi";
import { loadFeedPostsFromApi } from "../../features/content/loadFeedPosts";
import { loadRepostsForFeed, loadSavedPostsForFeed } from "../../features/content/loadLibraryPosts";
import { FeedPostCard } from "../../features/content/FeedPostCard";
import { postAvatarUrl, resolvePostImage } from "../../features/content/postDisplay";
import { buildDisplayFeed, shuffleFeedPosts } from "./buildDisplayFeed";
import { HashtagsFollowingPanel } from "./HashtagsFollowingPanel";
import { useBackendApi } from "../../shared/hooks/useBackendApi";
import { useChatStore } from "../../features/chat/ChatStore";
import { useNetworkStore } from "../../features/network/NetworkStore";
import { useUiSettings } from "../../app/providers/AppProviders";
import { AI_ASSISTANT_PEER_ID } from "../../shared/constants/aiAssistant";
import { MESSAGING_CONTACTS } from "../../shared/constants/messagingContacts";
import { getContactAvatarUrl, getContactProfile } from "../../shared/constants/contactProfiles";
import { getMessagePreview } from "../../shared/lib/callMessage";
import { countUnreadIncoming, markInboxPeerRead } from "../../shared/lib/messageRead";
import { readRegisteredAccount } from "../../shared/lib/registeredAccount";
import { showApiFeedback } from "../../shared/lib/apiFeedback";
import "./home-legacy.css";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const FEED_ROTATE_MS = 60000;
const FEED_PAGE_SIZE = 20;
const FEED_EMOJIS = ["😀", "😂", "😍", "🥳", "👍", "👏", "🔥", "💜", "🎉", "😎", "🤔", "💡", "🚀", "✨"];

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function avatarUrl(seed) {
  return postAvatarUrl(seed);
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

export function HomePage() {
  const navigate = useNavigate();
  const { session, isReady } = useAuth();
  const { t } = useUiSettings();
  const { chats, setActiveChat, markChatAsReadByPeer, sharePostToContact } = useChatStore();
  const { people } = useNetworkStore();
  const useApi = useBackendApi();

  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postVideo, setPostVideo] = useState("");
  const [postMediaFile, setPostMediaFile] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [feedView, setFeedView] = useState("feed");
  const [libraryPosts, setLibraryPosts] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [savedPostIds, setSavedPostIds] = useState(() => new Set());
  const [repostedPostIds, setRepostedPostIds] = useState(() => new Set());
  const [composerHashtags, setComposerHashtags] = useState([]);
  const [composerMentions, setComposerMentions] = useState([]);
  const [entityPicker, setEntityPicker] = useState(null);
  const [entitySearch, setEntitySearch] = useState("");
  const [hashtagSuggestions, setHashtagSuggestions] = useState([]);
  const [hashtagFocusSearch, setHashtagFocusSearch] = useState("");
  const [feedPage, setFeedPage] = useState(1);
  const [feedHasNextPage, setFeedHasNextPage] = useState(false);
  const [feedTotalCount, setFeedTotalCount] = useState(0);
  const [feedLoadingMore, setFeedLoadingMore] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageSearch, setMessageSearch] = useState("");
  const [feedUpdating, setFeedUpdating] = useState(false);
  const [feedRevision, setFeedRevision] = useState(0);
  const [feedPosts, setFeedPosts] = useState(() => buildDisplayFeed([], { shuffle: true }));
  const [feedShuffleSeed, setFeedShuffleSeed] = useState(() => Date.now());
  const feedLoadModeRef = useRef("replace");
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

  useEffect(() => {
    if (!isReady) return;

    if (feedLoadModeRef.current === "append") {
      setFeedPosts((prev) => {
        const seen = new Set(prev.map((post) => String(post.id)));
        const fresh = userPosts.filter((post) => !seen.has(String(post.id)));
        if (!fresh.length) return prev;
        return [...prev, ...shuffleFeedPosts(fresh, feedShuffleSeed + fresh.length)];
      });
      feedLoadModeRef.current = "replace";
      return;
    }

    setFeedPosts(buildDisplayFeed(userPosts, { shuffle: true, seed: feedShuffleSeed }));
  }, [isReady, userPosts, feedShuffleSeed]);

  useEffect(() => {
    try {
      localStorage.removeItem("homeUserPosts");
    } catch {
      // ignore storage errors
    }
  }, []);

  const posts = feedView === "feed" ? feedPosts : feedView === "tags" ? [] : libraryPosts;

  const showHint = useCallback((text, { variant = "info" } = {}) => {
    showApiFeedback(text, { variant });
  }, []);

  const reloadEngagementIds = useCallback(async () => {
    if (!useApi) {
      setSavedPostIds(new Set());
      setRepostedPostIds(new Set());
      return;
    }
    try {
      const [saved, reposted] = await Promise.all([
        contentApi.fetchMySavedPostIds(),
        contentApi.fetchMyRepostedPostIds(),
      ]);
      setSavedPostIds(saved);
      setRepostedPostIds(reposted);
    } catch {
      setSavedPostIds(new Set());
      setRepostedPostIds(new Set());
    }
  }, [useApi]);

  const reloadLibraryPosts = useCallback(
    async (view = feedView) => {
      if (!useApi || view === "feed") return;
      setLibraryLoading(true);
      try {
        const loader = view === "saved" ? loadSavedPostsForFeed : loadRepostsForFeed;
        setLibraryPosts(await loader(session.user?.id, displayName, userAvatar));
      } catch {
        setLibraryPosts([]);
        showHint(t("home.hint.libraryFailed", "Could not load saved posts."), { variant: "error" });
      } finally {
        setLibraryLoading(false);
      }
    },
    [useApi, feedView, session.user?.id, displayName, userAvatar, t, showHint],
  );

  useEffect(() => {
    if (!isReady) return;
    reloadEngagementIds();
  }, [isReady, reloadEngagementIds, session.user?.id]);

  useEffect(() => {
    if (feedView === "feed") return;
    reloadLibraryPosts(feedView);
  }, [feedView, reloadLibraryPosts]);

  const handleToggleSave = async (postId) => {
    const id = String(postId);
    const isSaved = savedPostIds.has(id);
    try {
      if (isSaved) {
        await contentApi.unsavePost(id);
        setSavedPostIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        showHint(t("home.hint.unsavedPost", "Removed from saved posts."));
      } else {
        await contentApi.savePost(id);
        setSavedPostIds((prev) => new Set(prev).add(id));
        showHint(t("home.hint.savedPost", "Post saved."));
      }
      if (feedView === "saved") await reloadLibraryPosts("saved");
    } catch {
      // apiClient shows mutation errors via ApiFeedbackBanner
    }
  };

  const handleToggleRepost = async (postId) => {
    const id = String(postId);
    const isReposted = repostedPostIds.has(id);
    try {
      if (isReposted) {
        await contentApi.unrepostPost(id);
        setRepostedPostIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        showHint(t("home.hint.unreposted", "Repost removed."));
      } else {
        await contentApi.repostPost(id);
        setRepostedPostIds((prev) => new Set(prev).add(id));
        showHint(t("home.hint.reposted", "Post reposted."));
      }
      if (feedView === "reposts") await reloadLibraryPosts("reposts");
    } catch {
      // apiClient shows mutation errors via ApiFeedbackBanner
    }
  };

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

    const all = connectedDedup.sort((a, b) => {
      if (Boolean(a.unread) !== Boolean(b.unread)) return Number(Boolean(b.unread)) - Number(Boolean(a.unread));
      return (b.unreadCount || 0) - (a.unreadCount || 0);
    });
    if (!query) return all;
    return all.filter((item) => item.name.toLowerCase().includes(query) || String(item.preview || "").toLowerCase().includes(query));
  }, [chats, messageSearch, t, messagesRefreshTick]);

  const shareContacts = useMemo(() => buildShareContacts(), [chats, messagesRefreshTick]);

  const applyFeedResult = useCallback((result, { append = false } = {}) => {
    feedLoadModeRef.current = append ? "append" : "replace";
    setUserPosts((prev) => {
      if (!append) return result.posts;
      const seen = new Set(prev.map((post) => String(post.id)));
      const merged = [...prev];
      result.posts.forEach((post) => {
        const id = String(post.id);
        if (!seen.has(id)) {
          seen.add(id);
          merged.push(post);
        }
      });
      return merged;
    });
    setFeedPage(result.page);
    setFeedHasNextPage(result.hasNextPage);
    setFeedTotalCount(result.totalCount);
  }, []);

  const reloadPostsFromApi = useCallback(
    async ({ silent = false, page = 1, append = false } = {}) => {
      if (!useApi || !session.isAuthenticated || session.user?.isGuest) return true;
      if (!silent) setPostsLoading(true);
      try {
        const result = await loadFeedPostsFromApi(session.user.id, displayName, userAvatar, {
          page,
          pageSize: FEED_PAGE_SIZE,
          cacheBust: page === 1,
        });
        applyFeedResult(result, { append });
        return true;
      } catch {
        if (!silent) {
          showHint(t("home.hint.loadFailed", "Could not load posts. Check that you are signed in."), {
            variant: "error",
          });
        }
        return false;
      } finally {
        if (!silent) setPostsLoading(false);
      }
    },
    [
      useApi,
      session.isAuthenticated,
      session.user?.isGuest,
      session.user?.id,
      displayName,
      userAvatar,
      t,
      showHint,
      applyFeedResult,
    ],
  );

  const loadMoreFeed = useCallback(async () => {
    if (!feedHasNextPage || feedLoadingMore || postsLoading) return;
    setFeedLoadingMore(true);
    try {
      await reloadPostsFromApi({ silent: true, page: feedPage + 1, append: true });
    } catch {
      showHint(t("home.hint.loadFailed", "Could not load posts. Check that you are signed in."), {
        variant: "error",
      });
    } finally {
      setFeedLoadingMore(false);
    }
  }, [feedHasNextPage, feedLoadingMore, postsLoading, feedPage, reloadPostsFromApi, showHint, t]);

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

  const mentionCandidates = useMemo(() => {
    const seen = new Set();
    return people
      .filter((person) => person.userId)
      .filter((person) => {
        const key = String(person.userId);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((person) => ({
        userId: String(person.userId),
        name: person.name,
        role: person.role || "",
      }));
  }, [people]);

  useEffect(() => {
    if (!useApi || entityPicker !== "hashtag") {
      setHashtagSuggestions([]);
      return undefined;
    }
    let cancelled = false;
    contentApi
      .searchHashtags(entitySearch, 10)
      .then((items) => {
        if (!cancelled) setHashtagSuggestions(items);
      })
      .catch(() => {
        if (!cancelled) setHashtagSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [useApi, entityPicker, entitySearch]);

  const filteredMentionCandidates = useMemo(() => {
    const query = entitySearch.trim().toLowerCase();
    if (!query) return mentionCandidates.slice(0, 8);
    return mentionCandidates
      .filter(
        (person) =>
          person.name.toLowerCase().includes(query) || String(person.userId).toLowerCase().includes(query),
      )
      .slice(0, 8);
  }, [mentionCandidates, entitySearch]);

  function clearComposerEntities() {
    setComposerHashtags([]);
    setComposerMentions([]);
    setEntityPicker(null);
    setEntitySearch("");
  }

  function addComposerHashtag(tag) {
    if (!tag?.id) return;
    setComposerHashtags((prev) => {
      if (prev.some((item) => String(item.id) === String(tag.id))) return prev;
      return [...prev, { id: String(tag.id), name: tag.name }];
    });
    const token = `#${tag.name}`;
    setPostText((prev) => (prev.includes(token) ? prev : `${prev.trim() ? `${prev.trim()} ` : ""}${token}`));
    setEntityPicker(null);
    setEntitySearch("");
  }

  function addComposerMention(person) {
    if (!person?.userId) return;
    setComposerMentions((prev) => {
      if (prev.some((item) => item.userId === person.userId)) return prev;
      return [...prev, { userId: person.userId, name: person.name }];
    });
    const token = `@${person.userId}`;
    setPostText((prev) => (prev.includes(token) ? prev : `${prev.trim() ? `${prev.trim()} ` : ""}${token}`));
    setEntityPicker(null);
    setEntitySearch("");
  }

  function handleHashtagClick(name) {
    setHashtagFocusSearch(String(name || "").replace(/^#/, ""));
    setFeedView("tags");
  }

  const canPublish = postText.trim() || postImage || postVideo;
  const hasPosts = feedView === "tags" ? false : posts.length > 0;
  const feedLoading = feedView === "feed" ? postsLoading : feedView === "tags" ? false : libraryLoading;
  const postViewSource = feedView === "saved" ? "saved" : feedView === "reposts" ? "reposts" : "feed";
  const canRecordPostViews = useApi && session.isAuthenticated && !session.user?.isGuest;

  const clearPostAttachment = () => {
    setPostImage("");
    setPostVideo("");
    setPostMediaFile(null);
  };

  const handlePhotoPick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return showHint(t("home.hint.onlyImages", "Only image files are allowed"), { variant: "error" });
    if (file.size > MAX_IMAGE_BYTES)
      return showHint(t("home.hint.imageLarge", "Image is too large"), { variant: "error" });
    try {
      const url = await readFileAsDataUrl(file);
      setPostImage(url);
      setPostVideo("");
      setPostMediaFile(file);
    } catch {
      showHint(t("home.hint.attachFail", "Failed to attach file"), { variant: "error" });
    }
  };

  const handleVideoPick = (event) => {
    event.target.value = "";
    showHint(t("home.hint.apiImageOnly", "API posts support images only (no video upload yet)."), {
      variant: "error",
    });
  };

  const publishPost = async () => {
    const text = postText.trim();
    if (!text && !postImage && !postVideo)
      return showHint(t("home.hint.emptyPost", "Post cannot be empty"), { variant: "error" });

    if (!useApi) {
      return showHint(t("profile.apiRequired", "Sign in with a real account to sync this section."), {
        variant: "error",
      });
    }
    if (!text && !postMediaFile) {
      return showHint(t("home.hint.apiNeedsTextOrImage", "Add text or a photo to publish."), { variant: "error" });
    }
    setIsPublishing(true);
    try {
      const content = text || t("home.imagePost", "Photo");
      const created = await contentApi.createPostWithMedia({
        content,
        visibility: "public",
        file: postMediaFile || null,
      });
      if (created?.id) {
        await contentApi.syncPostEntities(created.id, {
          text: content,
          hashtagIds: composerHashtags.map((item) => item.id),
          mentionedUserIds: composerMentions.map((item) => item.userId),
        });
      }
      await reloadPostsFromApi();
      setPostText("");
      clearPostAttachment();
      clearComposerEntities();
      setShowEmojiPicker(false);
      showHint(t("home.hint.postPublished", "Post published"));
    } catch {
      // apiClient shows mutation errors via ApiFeedbackBanner
    } finally {
      setIsPublishing(false);
    }
  };

  const startEditPost = (post) => {
    if (!useApi || !post?._api || !post.isOwn) return;
    setEditingPostId(post.id);
    setEditDraft(String(post.text || ""));
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditDraft("");
  };

  const saveEditPost = async (post) => {
    if (!useApi || !post?._api || !post.isOwn) return;
    const text = editDraft.trim();
    if (!text) {
      showHint(t("home.hint.emptyPost", "Post cannot be empty"), { variant: "error" });
      return;
    }
    setIsSavingEdit(true);
    try {
      await contentApi.updatePost(post.id, {
        content: text,
        visibility: post.visibility || "public",
      });
      await contentApi.syncPostEntities(post.id, { text });
      setUserPosts((prev) =>
        prev.map((item) => (String(item.id) === String(post.id) ? { ...item, text } : item)),
      );
      cancelEditPost();
      showHint(t("home.hint.postUpdated", "Post updated"));
    } catch {
      // apiClient shows mutation errors via ApiFeedbackBanner
    } finally {
      setIsSavingEdit(false);
    }
  };

  const deletePost = async (postId) => {
    if (!useApi) {
      showHint(t("profile.apiRequired", "Sign in with a real account to sync this section."), { variant: "error" });
      return;
    }
    const target = userPosts.find((p) => p.id === postId);
    if (!target?._api) return;
    if (editingPostId === postId) cancelEditPost();
    try {
      await contentApi.deletePost(postId);
      setUserPosts((prev) => prev.filter((post) => post.id !== postId));
      showHint(t("home.hint.postDeleted", "Post deleted"));
    } catch {
      // apiClient shows mutation errors via ApiFeedbackBanner
    }
  };

  const rotateFeedVisuals = useCallback(() => {
    setFeedRevision((value) => value + 1);
  }, []);

  const refreshFeed = useCallback(async () => {
    if (feedUpdating) return;
    setFeedUpdating(true);
    rotateFeedVisuals();
    setFeedShuffleSeed(Date.now());
    try {
      let apiOk = true;
      if (useApi && session.isAuthenticated && !session.user?.isGuest) {
        apiOk = await reloadPostsFromApi({ silent: false });
      }
      if (apiOk !== false) {
        showHint(t("home.hint.feedUpdated", "Feed updated"));
      }
    } catch {
      showHint(t("home.hint.loadFailed", "Could not load posts. Check that you are signed in."), {
        variant: "error",
      });
    } finally {
      window.setTimeout(() => setFeedUpdating(false), 650);
    }
  }, [
    feedUpdating,
    rotateFeedVisuals,
    useApi,
    session.isAuthenticated,
    session.user?.isGuest,
    reloadPostsFromApi,
    t,
  ]);

  useEffect(() => {
    if (!isReady || !useApi) return undefined;

    rotateFeedVisuals();
    reloadPostsFromApi({ silent: true });
    const timerId = window.setInterval(() => {
      rotateFeedVisuals();
      reloadPostsFromApi({ silent: true });
    }, FEED_ROTATE_MS);
    return () => window.clearInterval(timerId);
  }, [isReady, useApi, reloadPostsFromApi, rotateFeedVisuals]);

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
            <button
              type="button"
              className={feedView === "saved" ? "ghost-main ghost-main--active" : "ghost-main"}
              onClick={() => setFeedView((view) => (view === "saved" ? "feed" : "saved"))}
              disabled={!useApi}
            >
              {t("home.saved", "Saved elements")}
              {useApi && savedPostIds.size > 0 ? ` (${savedPostIds.size})` : ""}
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
          {useApi ? (
            <nav className="feed-view-tabs" aria-label={t("home.feedViews", "Feed views")}>
              <button
                type="button"
                className={feedView === "feed" ? "feed-view-tabs__btn feed-view-tabs__btn--active" : "feed-view-tabs__btn"}
                onClick={() => setFeedView("feed")}
              >
                {t("home.feedTab.all", "All posts")}
              </button>
              <button
                type="button"
                className={feedView === "saved" ? "feed-view-tabs__btn feed-view-tabs__btn--active" : "feed-view-tabs__btn"}
                onClick={() => setFeedView("saved")}
              >
                {t("home.feedTab.saved", "Saved")}
                {savedPostIds.size > 0 ? ` (${savedPostIds.size})` : ""}
              </button>
              <button
                type="button"
                className={feedView === "reposts" ? "feed-view-tabs__btn feed-view-tabs__btn--active" : "feed-view-tabs__btn"}
                onClick={() => setFeedView("reposts")}
              >
                {t("home.feedTab.reposts", "Reposts")}
                {repostedPostIds.size > 0 ? ` (${repostedPostIds.size})` : ""}
              </button>
              <button
                type="button"
                className={feedView === "tags" ? "feed-view-tabs__btn feed-view-tabs__btn--active" : "feed-view-tabs__btn"}
                onClick={() => setFeedView("tags")}
              >
                {t("home.feedTab.hashtags", "Hashtags")}
              </button>
            </nav>
          ) : null}
          {!useApi ? (
            <p className="muted composer-api-hint">
              {t("profile.apiRequired", "Sign in with a real account to sync this section.")}
            </p>
          ) : null}
          <article className={`composer${useApi ? "" : " composer--disabled"}`} ref={composerRef}>
            <div className="composer-top">
              <img className="avatar avatar-img small" src={userAvatar} alt="" />
              <textarea
                className="composer-textarea"
                rows={2}
                value={postText}
                onChange={(event) => setPostText(event.target.value)}
                placeholder={t("home.startPost", "Start a post...")}
                disabled={!useApi}
              />
            </div>

            {postImage || postVideo ? (
              <div className="composer-preview">
                {postImage ? <img src={postImage} alt={t("home.preview", "Post preview")} /> : <video src={postVideo} controls className="composer-preview__video" />}
                <button type="button" className="composer-preview__remove" onClick={clearPostAttachment}>
                  {t("home.remove", "Remove")}
                </button>
              </div>
            ) : null}

            {useApi && (composerHashtags.length > 0 || composerMentions.length > 0) ? (
              <div className="composer-entities">
                {composerHashtags.map((tag) => (
                  <span key={tag.id} className="composer-entity composer-entity--hashtag">
                    #{tag.name}
                    <button
                      type="button"
                      aria-label={t("home.remove", "Remove")}
                      onClick={() => {
                        setComposerHashtags((prev) => prev.filter((item) => item.id !== tag.id));
                        setPostText((prev) => prev.replace(new RegExp(`#${tag.name}\\b`, "i"), "").trim());
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {composerMentions.map((person) => (
                  <span key={person.userId} className="composer-entity composer-entity--mention">
                    @{person.name}
                    <button
                      type="button"
                      aria-label={t("home.remove", "Remove")}
                      onClick={() => {
                        setComposerMentions((prev) => prev.filter((item) => item.userId !== person.userId));
                        setPostText((prev) => prev.replace(`@${person.userId}`, "").trim());
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            {useApi && entityPicker ? (
              <div className="composer-entity-picker">
                <input
                  className="composer-entity-picker__search"
                  type="search"
                  value={entitySearch}
                  onChange={(event) => setEntitySearch(event.target.value)}
                  placeholder={
                    entityPicker === "hashtag"
                      ? t("home.hashtags.search", "Search hashtags to follow…")
                      : t("home.mentions.search", "Search contacts to mention…")
                  }
                  autoFocus
                />
                <ul className="composer-entity-picker__list">
                  {entityPicker === "hashtag"
                    ? hashtagSuggestions.map((tag) => (
                        <li key={tag.id}>
                          <button type="button" onClick={() => addComposerHashtag(tag)}>
                            #{tag.name}
                          </button>
                        </li>
                      ))
                    : filteredMentionCandidates.map((person) => (
                        <li key={person.userId}>
                          <button type="button" onClick={() => addComposerMention(person)}>
                            {person.name}
                            <small>{person.role}</small>
                          </button>
                        </li>
                      ))}
                </ul>
                <button type="button" className="composer-entity-picker__close" onClick={() => setEntityPicker(null)}>
                  {t("home.close", "Close")}
                </button>
              </div>
            ) : null}

            <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={handlePhotoPick} />
            <input ref={videoInputRef} type="file" accept="video/*" hidden onChange={handleVideoPick} />

            <div className="composer-actions">
              <div className="composer-actions__left">
                <button type="button" onClick={() => photoInputRef.current?.click()}>{t("home.photo", "Photo")}</button>
                <button type="button" onClick={() => videoInputRef.current?.click()}>{t("home.video", "Video")}</button>
                {useApi ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEntityPicker("hashtag");
                        setEntitySearch("");
                      }}
                    >
                      {t("home.hashtag", "Hashtag")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEntityPicker("mention");
                        setEntitySearch("");
                      }}
                    >
                      {t("home.mention", "Mention")}
                    </button>
                  </>
                ) : null}
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
              <button className="primary-mini" onClick={publishPost} disabled={!useApi || !canPublish || isPublishing}>
                {isPublishing ? t("home.publishing", "Publishing…") : t("home.publish", "Publish")}
              </button>
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

          {feedView === "tags" && useApi ? (
            <HashtagsFollowingPanel t={t} onHint={showHint} focusSearch={hashtagFocusSearch} />
          ) : null}

          {hasPosts ? (
            <>
            <div className="feed-posts feed-posts--refresh" key={`feed-${feedRevision}`}>
            {posts.map((post, index) => (
              <FeedPostCard
                key={`${post.id}-${feedRevision}-${index}`}
                post={post}
                index={index}
                feedRevision={feedRevision}
                userAvatar={userAvatar}
                useApi={useApi}
                t={t}
                showHint={showHint}
                savedPostIds={savedPostIds}
                repostedPostIds={repostedPostIds}
                onToggleSave={handleToggleSave}
                onToggleRepost={handleToggleRepost}
                shareContacts={shareContacts}
                onSharePost={handleSharePost}
                onHashtagClick={handleHashtagClick}
                canRecordPostViews={canRecordPostViews}
                postViewSource={postViewSource}
                editingPostId={editingPostId}
                editDraft={editDraft}
                isSavingEdit={isSavingEdit}
                onEditDraftChange={setEditDraft}
                onStartEdit={startEditPost}
                onCancelEdit={cancelEditPost}
                onSaveEdit={saveEditPost}
                onDeletePost={deletePost}
              />
            ))}
            </div>
            {useApi && feedView === "feed" && feedTotalCount > 0 ? (
              <p className="feed-page-stats">
                {t("home.feed.pageStats", "{shown} of {total} posts")
                  .replace("{shown}", String(posts.length))
                  .replace("{total}", String(feedTotalCount))}
              </p>
            ) : null}
            {useApi && feedView === "feed" && feedHasNextPage ? (
              <div className="feed-load-more-wrap">
                <button
                  type="button"
                  className="feed-load-more"
                  onClick={loadMoreFeed}
                  disabled={feedLoadingMore || postsLoading}
                >
                  {feedLoadingMore ? t("common.loading", "Loading…") : t("home.feed.loadMore", "Load more")}
                </button>
              </div>
            ) : null}
            </>
          ) : feedView === "tags" ? null : (
            <article className="post-card">
              <p className="muted">
                {feedLoading
                  ? t("common.loading", "Loading…")
                  : feedView === "saved"
                    ? t("home.emptySavedPosts", "No saved posts yet. Use Save on a post in your feed.")
                    : feedView === "reposts"
                      ? t("home.emptyReposts", "No reposts yet. Use Repost on a post in your feed.")
                      : useApi
                        ? t("home.emptyApiFeed", "No posts yet. Create your first post above — it will be saved to the database.")
                        : t("home.postsUnavailable", "Posts are temporarily unavailable.")}
              </p>
              {useApi ? null : (
                <button type="button" className="ghost-main" onClick={refreshFeed}>
                  {t("home.reloadFeed", "Reload feed")}
                </button>
              )}
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
