import { useCallback, useEffect, useMemo, useState } from "react";
import * as contentApi from "../../features/content/contentApi";
import { FeedPostCard } from "../../features/content/FeedPostCard";
import { loadUserPostsFromApi } from "../../features/content/loadUserPosts";
import { postAvatarUrl, resolvePostImage } from "../../features/content/postDisplay";
import { useChatStore } from "../../features/chat/ChatStore";
import { useBackendApi } from "../../shared/hooks/useBackendApi";
import { readRegisteredAccount } from "../../shared/lib/registeredAccount";
import { LoadStatus } from "../../shared/ui/LoadStatus";
import { MESSAGING_CONTACTS } from "../../shared/constants/messagingContacts";

const PAGE_SIZE = 10;

function buildShareContacts(chats) {
  const canonicalPeerId =
    typeof window.canonicalPeerId === "function"
      ? window.canonicalPeerId
      : (value) => String(value || "").trim().toLowerCase();
  const loadHomeChats = typeof window.loadHomeChats === "function" ? window.loadHomeChats : () => [];
  const contacts = [];
  const seen = new Set();

  loadHomeChats().forEach((chat) => {
    const peerId = canonicalPeerId(chat?.id);
    if (!peerId || seen.has(peerId)) return;
    seen.add(peerId);
    contacts.push({
      peerId,
      name: String(chat.name || peerId).trim() || peerId,
      avatar: chat.avatar || postAvatarUrl(chat.seed || chat.name || peerId),
      seed: chat.seed || chat.name || peerId,
    });
  });

  chats.forEach((chat) => {
    const peerId = canonicalPeerId(chat.id || chat.peer);
    if (!peerId || seen.has(peerId)) return;
    seen.add(peerId);
    contacts.push({
      peerId,
      name: chat.peer,
      avatar: postAvatarUrl(chat.peer),
      seed: chat.peer,
    });
  });

  Object.entries(MESSAGING_CONTACTS).forEach(([id, meta]) => {
    const peerId = canonicalPeerId(id);
    if (!peerId || seen.has(peerId)) return;
    seen.add(peerId);
    contacts.push({
      peerId,
      name: meta.name,
      avatar: meta.avatar || postAvatarUrl(meta.seed || meta.name),
      seed: meta.seed || meta.name,
    });
  });

  return contacts;
}

export function UserProfilePosts({ userId, session, t }) {
  const useApi = useBackendApi();
  const { chats, sharePostToContact } = useChatStore();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [savedPostIds, setSavedPostIds] = useState(() => new Set());
  const [repostedPostIds, setRepostedPostIds] = useState(() => new Set());
  const [actionHint, setActionHint] = useState("");

  const displayName = session.user?.name || t("common.guest", "Guest");
  const userAvatar = useMemo(() => {
    const fromSession = String(session.user?.avatarDataUrl || "").trim();
    if (fromSession) return fromSession;
    const account = readRegisteredAccount();
    return String(account.avatarDataUrl || "").trim() || postAvatarUrl(displayName);
  }, [displayName, session.user?.avatarDataUrl]);

  const showHint = useCallback((text) => {
    setActionHint(text);
    window.setTimeout(() => setActionHint(""), 2200);
  }, []);

  const shareContacts = useMemo(() => buildShareContacts(chats), [chats]);

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

  const loadPosts = useCallback(
    async ({ page: nextPage = 1, append = false } = {}) => {
      if (!useApi || !userId) return;
      if (!append) setIsLoading(true);
      setLoadError("");
      try {
        const result = await loadUserPostsFromApi(
          userId,
          session.user?.id,
          displayName,
          userAvatar,
          { page: nextPage, pageSize: PAGE_SIZE },
        );
        setPosts((prev) => {
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
        setPage(result.page);
        setHasNextPage(result.hasNextPage);
        setTotalCount(result.totalCount);
      } catch {
        setLoadError(t("userProfile.posts.loadFailed", "Could not load posts."));
        if (!append) setPosts([]);
      } finally {
        if (!append) setIsLoading(false);
      }
    },
    [useApi, userId, session.user?.id, displayName, userAvatar, t],
  );

  useEffect(() => {
    loadPosts({ page: 1 });
    reloadEngagementIds();
  }, [loadPosts, reloadEngagementIds]);

  const handleSharePost = (post, contact) => {
    sharePostToContact({
      peer: contact.name,
      peerId: contact.peerId,
      post: { ...post, image: resolvePostImage(post) },
    });
    showHint(t("home.hint.postShared", "Post shared with {name}").replace("{name}", contact.name));
  };

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
    } catch (error) {
      showHint(error?.message || t("home.hint.saveFailed", "Could not save post."));
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
    } catch (error) {
      showHint(error?.message || t("home.hint.repostFailed", "Could not repost."));
    }
  };

  const loadMore = async () => {
    if (!hasNextPage || loadingMore) return;
    setLoadingMore(true);
    try {
      await loadPosts({ page: page + 1, append: true });
    } finally {
      setLoadingMore(false);
    }
  };

  if (!useApi) return null;

  return (
    <article className="lk-card lk-card--section user-profile-posts">
      <h3 className="lk-row-title">{t("userProfile.posts.heading", "Posts")}</h3>
      {actionHint ? <p className="lk-muted">{actionHint}</p> : null}
      <LoadStatus isLoading={isLoading} loadError={loadError} onRetry={() => loadPosts({ page: 1 })} t={t} />
      {posts.length > 0 ? (
        <div className="feed-posts user-profile-posts__list">
          {posts.map((post, index) => (
            <FeedPostCard
              key={post.id}
              post={post}
              index={index}
              userAvatar={userAvatar}
              currentUserId={session.user?.id}
              displayName={displayName}
              useApi={useApi}
              t={t}
              showHint={showHint}
              savedPostIds={savedPostIds}
              repostedPostIds={repostedPostIds}
              onToggleSave={handleToggleSave}
              onToggleRepost={handleToggleRepost}
              shareContacts={shareContacts}
              onSharePost={handleSharePost}
              canRecordPostViews
              postViewSource="profile"
            />
          ))}
        </div>
      ) : !isLoading && !loadError ? (
        <p className="lk-line lk-muted">{t("userProfile.posts.empty", "No public posts yet.")}</p>
      ) : null}
      {totalCount > 0 ? (
        <p className="feed-page-stats">
          {t("home.feed.pageStats", "{shown} of {total} posts")
            .replace("{shown}", String(posts.length))
            .replace("{total}", String(totalCount))}
        </p>
      ) : null}
      {hasNextPage ? (
        <div className="feed-load-more-wrap">
          <button type="button" className="feed-load-more" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? t("common.loading", "Loading…") : t("home.feed.loadMore", "Load more")}
          </button>
        </div>
      ) : null}
    </article>
  );
}
