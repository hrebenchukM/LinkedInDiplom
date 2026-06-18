import { Link } from "react-router-dom";
import { PostRichText } from "./PostRichText";
import { PostTagsPanel } from "./PostTagsPanel";
import { PostViewRecorder } from "./PostViewRecorder";
import { PostEngagement } from "./PostEngagement";
import { resolvePostAvatar, resolvePostImage } from "./postDisplay";

export function FeedPostCard({
  post,
  index = 0,
  feedRevision = 0,
  userAvatar,
  currentUserId,
  displayName,
  useApi,
  t,
  showHint,
  savedPostIds,
  repostedPostIds,
  onToggleSave,
  onToggleRepost,
  shareContacts,
  onSharePost,
  onHashtagClick,
  canRecordPostViews = false,
  postViewSource = "feed",
  editingPostId = null,
  editDraft = "",
  isSavingEdit = false,
  onEditDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeletePost,
}) {
  const profilePath =
    !post.isOwn && post.userId ? `/app/profile/${encodeURIComponent(String(post.userId))}` : null;

  return (
    <article
      className={`post-card${post.isOwn ? "" : " post-card--enter"}${post.isFresh ? " post-card--fresh" : ""}`}
      style={post.isOwn ? undefined : { animationDelay: `${Math.min(index, 5) * 0.07}s` }}
    >
      {canRecordPostViews && post._api && !post.isOwn ? (
        <PostViewRecorder postId={post.id} enabled source={postViewSource} />
      ) : null}
      <div className="post-head">
        {profilePath ? (
          <Link to={profilePath} className="post-head__avatar-link">
            <img className="avatar avatar-img small" src={resolvePostAvatar(post, userAvatar)} alt="" />
          </Link>
        ) : (
          <img className="avatar avatar-img small" src={resolvePostAvatar(post, userAvatar)} alt="" />
        )}
        <div className="post-head__meta">
          {profilePath ? (
            <strong>
              <Link className="post-head__author-link" to={profilePath}>
                {post.author}
              </Link>
            </strong>
          ) : (
            <strong>{post.author}</strong>
          )}
          {post.role ? <p className="post-head__role">{post.role}</p> : null}
        </div>
        {post.isOwn && useApi && post._api ? (
          <div className="post-head__actions">
            <button
              type="button"
              className="post-edit"
              onClick={() => (editingPostId === post.id ? onCancelEdit?.() : onStartEdit?.(post))}
              aria-label={t("home.editPost", "Edit post")}
              title={t("home.editPost", "Edit post")}
            >
              ✎
            </button>
            <button
              type="button"
              className="post-delete"
              onClick={() => onDeletePost?.(post.id)}
              aria-label={t("home.deletePost", "Delete post")}
              title={t("home.delete", "Delete")}
            >
              ×
            </button>
          </div>
        ) : null}
      </div>
      <div className="post-body">
        {editingPostId === post.id ? (
          <div className="post-edit-form">
            <textarea
              className="post-edit-form__input"
              rows={4}
              value={editDraft}
              onChange={(event) => onEditDraftChange?.(event.target.value)}
              disabled={isSavingEdit}
            />
            <div className="post-edit-form__actions">
              <button
                type="button"
                className="primary-mini"
                onClick={() => onSaveEdit?.(post)}
                disabled={isSavingEdit || !editDraft.trim()}
              >
                {isSavingEdit ? t("common.loading", "Loading…") : t("home.saveEdit", "Save")}
              </button>
              <button type="button" className="ghost-main" onClick={onCancelEdit} disabled={isSavingEdit}>
                {t("home.cancelEdit", "Cancel")}
              </button>
            </div>
          </div>
        ) : post.text ? (
          <PostRichText text={post.text} onHashtagClick={useApi ? onHashtagClick : undefined} />
        ) : null}
        {useApi && post._api ? (
          <PostTagsPanel
            postId={post.id}
            useApi={useApi}
            isOwn={post.isOwn}
            t={t}
            onHashtagClick={onHashtagClick}
          />
        ) : null}
        {post.video ? (
          <video className="post-media post-media--video" src={post.video} controls playsInline />
        ) : null}
        {!post.video && resolvePostImage(post) ? (
          <img
            className="post-media post-media--photo"
            src={resolvePostImage(post)}
            alt={t("home.postMedia", "Post media")}
            loading="lazy"
          />
        ) : null}
      </div>
      <PostEngagement
        post={post}
        onHint={showHint}
        t={t}
        shareContacts={shareContacts}
        onSharePost={onSharePost}
        useApi={useApi}
        savedPostIds={savedPostIds}
        repostedPostIds={repostedPostIds}
        onToggleSave={onToggleSave}
        onToggleRepost={onToggleRepost}
        currentUserId={currentUserId}
        displayName={displayName}
        userAvatar={userAvatar}
      />
    </article>
  );
}
