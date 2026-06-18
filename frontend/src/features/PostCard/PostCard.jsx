import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Share2, Bookmark, Trash2 } from 'lucide-react';
import './PostCard.css';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import SafeImage from '../../shared/ui/SafeImage';
import AppContext from '../appContext/AppContext';
import {
  deletePost,
  deletePostReaction,
  setPostReaction,
} from '../content/contentApi.js';
import PostCommentsPanel from '../content/PostCommentsPanel.jsx';
import PostShareMenu from '../content/PostShareMenu.jsx';
import { getDisplayName } from '../profile/mapProfile.js';
import { getErrorMessage } from '../../shared/lib/apiError.js';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const PostCard = ({
  post,
  onDeleted,
  shareContacts = [],
  isSaved = false,
  onToggleSave,
  saving = false,
}) => {
  const { t } = useTranslation();
  const { token, account, user, profile } = useContext(AppContext);
  const navigate = useNavigate();
  const currentUserId =
    account?.id ??
    account?.userId ??
    profile?.user?.id ??
    profile?.user?.userId ??
    user?.id ??
    user?.userId ??
    null;
  const authorUserId =
    post.userId ?? post.authorId ?? post.user?.id ?? post.author?.id;
  const isOwnPost =
    Boolean(currentUserId && authorUserId) &&
    String(currentUserId).toLowerCase() === String(authorUserId).toLowerCase();
  const postAuthor = post.user ?? post.author ?? {
    firstName: t('post.userFallback', 'User'),
    secondName: '',
    avatarUrl: null,
    position: '',
  };

  const [liked, setLiked] = useState(Boolean(post.myReaction));
  const [reactionCount, setReactionCount] = useState(post.reactionsCount ?? 0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount ?? 0);
  const [commentError, setCommentError] = useState('');
  const [reacting, setReacting] = useState(false);
  const [reactionError, setReactionError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [shareHint, setShareHint] = useState('');

  const displayName = useMemo(
    () => getDisplayName(profile) || account?.email || t('common.guest', 'Guest'),
    [profile, account?.email, t],
  );
  const userAvatar = getAssetUrl(
    profile?.user?.avatarUrl ?? user?.avatarUrl,
    IMAGE_PLACEHOLDERS.avatar,
  );

  useEffect(() => {
    setLiked(Boolean(post.myReaction));
    setReactionCount(post.reactionsCount ?? 0);
    setCommentsCount(post.commentsCount ?? 0);
    setCommentsOpen(false);
  }, [post.id, post.myReaction, post.reactionsCount, post.commentsCount]);

  useEffect(() => {
    if (!commentError) return undefined;
    const timer = window.setTimeout(() => setCommentError(''), 3200);
    return () => window.clearTimeout(timer);
  }, [commentError]);

  const avatarSrc = getAssetUrl(
    postAuthor.avatarUrl ?? postAuthor.avatar,
    IMAGE_PLACEHOLDERS.avatar,
  );
  const mediaSrc = getAssetUrl(
    post.media?.[0]?.url || post.media?.[0]?.rawUrl || post.image,
    '',
  );

  const handleLike = async () => {
    if (!token || reacting) return;

    setReacting(true);
    setReactionError('');

    const wasLiked = liked;
    setLiked(!wasLiked);
    setReactionCount((count) => (wasLiked ? Math.max(0, count - 1) : count + 1));

    try {
      if (wasLiked) {
        await deletePostReaction(post.id);
      } else {
        await setPostReaction(post.id, 'Like');
      }
    } catch (err) {
      setLiked(wasLiked);
      setReactionCount(post.reactionsCount ?? 0);
      setReactionError(getErrorMessage(err));
    } finally {
      setReacting(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !isOwnPost || deleting || !post.id) return;

    const confirmed = window.confirm(
      t('post.deleteConfirm', 'Delete this post? This cannot be undone.'),
    );
    if (!confirmed) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await deletePost(post.id);
      onDeleted?.(post.id);
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const openAuthorProfile = () => {
    if (authorUserId) navigate(`/app/profile/${authorUserId}`);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <SafeImage
          src={avatarSrc}
          fallback={IMAGE_PLACEHOLDERS.avatar}
          alt={postAuthor.firstName || t('post.userFallback', 'User')}
          className="post-avatar"
          onClick={openAuthorProfile}
          style={authorUserId ? { cursor: 'pointer' } : undefined}
        />

        <div className="post-info">
          <h4
            className="post-author"
            onClick={openAuthorProfile}
            style={authorUserId ? { cursor: 'pointer' } : undefined}
            role={authorUserId ? 'button' : undefined}
            tabIndex={authorUserId ? 0 : undefined}
            onKeyDown={
              authorUserId
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openAuthorProfile();
                    }
                  }
                : undefined
            }
          >
            {postAuthor.firstName} {postAuthor.secondName}
          </h4>
          <p className="post-title">{postAuthor.position || ''}</p>
          <span className="post-time">
            {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
          </span>
        </div>

        {isOwnPost ? (
          <button
            type="button"
            className="post-delete-btn"
            onClick={handleDelete}
            disabled={deleting}
            aria-label={t('home.deletePost', 'Delete post')}
            title={t('home.deletePost', 'Delete post')}
          >
            <Trash2 size={18} />
          </button>
        ) : null}
      </div>

      <div className="post-content">
        <p>{post.content}</p>
      </div>

      {mediaSrc ? (
        <div className="post-image">
          <SafeImage
            src={mediaSrc}
            fallback={IMAGE_PLACEHOLDERS.cover}
            alt={t('post.mediaAlt', 'Post media')}
          />
        </div>
      ) : null}

      {reactionError ? <p className="auth-field-error">{reactionError}</p> : null}
      {deleteError ? <p className="auth-field-error">{deleteError}</p> : null}
      {commentError ? <p className="post-share-hint">{commentError}</p> : null}
      {shareHint ? <p className="post-share-hint">{shareHint}</p> : null}

      <div className="post-actions">
        <button
          type="button"
          className={`action-btn${liked ? ' active' : ''}`}
          onClick={handleLike}
          disabled={!token || reacting}
        >
          <ThumbsUp size={18} />
          <span>
            {t('post.like', 'Like')}
            {reactionCount > 0 ? ` · ${reactionCount}` : ''}
          </span>
        </button>

        <button
          type="button"
          className={`action-btn${commentsOpen ? ' active' : ''}`}
          onClick={() => setCommentsOpen((open) => !open)}
          aria-expanded={commentsOpen}
        >
          <MessageCircle size={18} />
          <span>
            {t('post.comment', 'Comment')}
            {commentsCount > 0 ? ` · ${commentsCount}` : ''}
          </span>
        </button>

        <PostShareMenu
          post={post}
          shareContacts={shareContacts}
          currentUserId={currentUserId}
          onHint={(hint) => {
            setShareHint(hint);
            window.setTimeout(() => setShareHint(''), 3200);
          }}
          trigger={({ open, toggle }) => (
            <button
              type="button"
              className={`action-btn${open ? ' active' : ''}`}
              onClick={toggle}
              aria-expanded={open}
            >
              <Share2 size={18} />
              <span>{t('common.share', 'Share')}</span>
            </button>
          )}
        />

        <button
          type="button"
          className={`action-btn${isSaved ? ' active saved' : ''}`}
          onClick={() => onToggleSave?.(post.id)}
          disabled={!token || saving || !onToggleSave}
          aria-pressed={isSaved}
        >
          <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
          <span>
            {isSaved
              ? t('home.post.saved', 'Saved')
              : t('home.post.save', 'Save')}
          </span>
        </button>
      </div>

      <PostCommentsPanel
        postId={post.id}
        open={commentsOpen}
        token={token}
        currentUserId={currentUserId}
        displayName={displayName}
        userAvatar={userAvatar}
        onCountChange={setCommentsCount}
        onError={setCommentError}
      />
    </div>
  );
};

export default PostCard;
