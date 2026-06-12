import { useEffect, useRef, useState } from "react";
import * as contentApi from "./contentApi";
import { postAvatarUrl } from "./postDisplay";

function PostActionIcon({ variant }) {
  const common = { viewBox: "0 0 24 24", fill: "currentColor", focusable: "false" };
  if (variant === "like") {
    return (
      <span className="post-action__icon" aria-hidden="true">
        <svg {...common}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </span>
    );
  }
  if (variant === "comment") {
    return (
      <span className="post-action__icon" aria-hidden="true">
        <svg {...common}>
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h3v3.5c0 .8.9 1.3 1.6.8L14 18h6c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H13.2l-4.2 3v-3H4V4h16v12z" />
        </svg>
      </span>
    );
  }
  if (variant === "save") {
    return (
      <span className="post-action__icon" aria-hidden="true">
        <svg {...common}>
          <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
        </svg>
      </span>
    );
  }
  if (variant === "repost") {
    return (
      <span className="post-action__icon" aria-hidden="true">
        <svg {...common}>
          <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
        </svg>
      </span>
    );
  }
  return (
    <span className="post-action__icon" aria-hidden="true">
      <svg {...common}>
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 11.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-5.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 5.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
      </svg>
    </span>
  );
}

export function PostEngagement({
  post,
  onHint,
  t,
  shareContacts = [],
  onSharePost,
  useApi,
  savedPostIds,
  repostedPostIds,
  onToggleSave,
  onToggleRepost,
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => Number(post.likes || 0));
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentCount, setCommentCount] = useState(() => Number(post.commentCount || 0));
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
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

  useEffect(() => {
    setCommentCount(Number(post.commentCount || 0));
  }, [post.commentCount, post.id]);

  useEffect(() => {
    if (!useApi || !post._api) return;
    contentApi.fetchMyReactionForPost(post.id).then((reaction) => {
      if (reaction?.reactionType) setLiked(true);
    });
  }, [useApi, post._api, post.id]);

  useEffect(() => {
    if (!commentsOpen || !useApi || !post._api) return;
    setCommentsLoading(true);
    contentApi
      .fetchPostComments(post.id)
      .then((list) => {
        const mapped = list.map((c) => ({
          id: String(c.id),
          author: String(c.userId || "").slice(0, 8) || "User",
          seed: c.userId,
          text: c.content,
          _api: true,
        }));
        setComments(mapped);
        setCommentCount(mapped.length);
      })
      .catch(() => onHint(t("home.hint.commentsFailed", "Could not load comments.")))
      .finally(() => setCommentsLoading(false));
  }, [commentsOpen, useApi, post._api, post.id, onHint, t]);

  const handleShareToContact = (contact) => {
    onSharePost?.(post, contact);
    setSharedTo((prev) => new Set(prev).add(contact.peerId));
  };

  const isSaved = savedPostIds?.has(String(post.id));
  const isReposted = repostedPostIds?.has(String(post.id));
  const canUseLibraryActions = useApi && post._api;
  const canEngage = useApi && post._api;

  return (
    <>
      <div className={`post-stats${liked ? " post-stats--liked" : ""}`}>
        <span className="post-stats__likes">
          <span className={`post-stats__heart${liked ? " post-stats__heart--on" : ""}`}>♥</span>
          {likeCount}
        </span>
        <button type="button" className="post-stats__comments-btn" onClick={() => setCommentsOpen((v) => !v)}>
          {commentCount} {t("home.post.comments", "comments")}
        </button>
      </div>

      <div className="post-actions">
        <div className="post-actions__bar">
          <button
            type="button"
            className={`post-action post-action--like${liked ? " post-action--liked" : ""}`}
            disabled={!canEngage}
            onClick={async () => {
              if (!canEngage) return;
              try {
                if (liked) {
                  await contentApi.removePostReaction(post.id);
                  setLiked(false);
                  setLikeCount((v) => Math.max(0, v - 1));
                } else {
                  await contentApi.upsertPostReaction(post.id, "Like");
                  setLiked(true);
                  setLikeCount((v) => v + 1);
                }
              } catch {
                onHint(t("home.hint.reactionFailed", "Could not update reaction."));
              }
            }}
          >
            <PostActionIcon variant="like" />
            <span className="post-action__label">{liked ? t("home.post.liked", "Liked") : t("home.post.like", "Like")}</span>
          </button>
          <button
            type="button"
            className={`post-action post-action--comment${commentsOpen ? " post-action--active" : ""}`}
            onClick={() => setCommentsOpen((v) => !v)}
          >
            <PostActionIcon variant="comment" />
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
              <PostActionIcon variant="share" />
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
          {canUseLibraryActions ? (
            <>
              <button
                type="button"
                className={`post-action post-action--save${isSaved ? " post-action--saved" : ""}`}
                onClick={() => onToggleSave?.(post.id)}
              >
                <PostActionIcon variant="save" />
                <span className="post-action__label">
                  {isSaved ? t("home.post.saved", "Saved") : t("home.post.save", "Save")}
                </span>
              </button>
              <button
                type="button"
                className={`post-action post-action--repost${isReposted ? " post-action--reposted" : ""}`}
                onClick={() => onToggleRepost?.(post.id)}
              >
                <PostActionIcon variant="repost" />
                <span className="post-action__label">
                  {isReposted ? t("home.post.reposted", "Reposted") : t("home.post.repost", "Repost")}
                </span>
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className={`post-comments${commentsOpen ? " post-comments--open" : ""}`}>
        <div className="post-comments__inner">
          <div className="post-comments__body">
            <h5 className="post-comments__title">{t("home.post.comments", "Comments")}</h5>
            <ul className="post-comments__list">
              {commentsLoading ? (
                <li className="post-comment">
                  <p>{t("common.loading", "Loading…")}</p>
                </li>
              ) : null}
              {comments.map((comment) => (
                <li key={comment.id} className="post-comment">
                  <img className="post-comment__avatar" src={postAvatarUrl(comment.seed)} width="32" height="32" alt="" />
                  <div className="post-comment__bubble">
                    <strong>{comment.author}</strong>
                    <p>{comment.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <form
              className="post-comments__form"
              onSubmit={async (event) => {
                event.preventDefault();
                const text = commentDraft.trim();
                if (!text || !canEngage) return;
                try {
                  const created = await contentApi.createPostComment(post.id, text);
                  setComments((prev) => [
                    ...prev,
                    {
                      id: String(created?.id || Date.now()),
                      author: "You",
                      seed: "You",
                      text: created?.content || text,
                      _api: true,
                    },
                  ]);
                  setCommentCount((value) => value + 1);
                  setCommentDraft("");
                } catch {
                  onHint(t("home.hint.commentFailed", "Could not post comment."));
                }
              }}
            >
              <input
                type="text"
                className="post-comments__input"
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                placeholder={t("home.post.writeComment", "Write a comment...")}
              />
              <button type="submit" className="post-comments__submit" disabled={!commentDraft.trim() || !canEngage}>
                {t("home.post.submitComment", "Post")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
