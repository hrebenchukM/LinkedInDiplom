import { useEffect, useState } from 'react';
import { createComment, getPostComments } from './contentApi.js';
import { mapCommentsWithAuthors } from './mapCommentsWithAuthors.js';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

export default function PostCommentsPanel({
  postId,
  open,
  token,
  currentUserId,
  displayName,
  userAvatar,
  onCountChange,
  onError,
}) {
  const { t } = useTranslation();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !postId || !token) return undefined;

    let cancelled = false;
    setLoading(true);

    getPostComments(postId, { page: 1, pageSize: 100 })
      .then(async (result) => {
        if (cancelled) return;
        const mapped = await mapCommentsWithAuthors(result.items ?? [], {
          currentUserId,
          displayName,
          userAvatar,
          memberLabel: t('profile.views.member', 'Member'),
        });
        setComments(mapped);
        onCountChange?.(mapped.length);
      })
      .catch(() => {
        if (!cancelled) {
          onError?.(t('home.hint.commentsFailed', 'Could not load comments.'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, postId, token, currentUserId, displayName, userAvatar, onCountChange, onError, t]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !token || !postId || submitting) return;

    setSubmitting(true);
    try {
      const created = await createComment(postId, { content: text });
      const [mapped] = await mapCommentsWithAuthors([created || { content: text, userId: currentUserId }], {
        currentUserId,
        displayName,
        userAvatar,
        memberLabel: t('profile.views.member', 'Member'),
      });
      setComments((prev) => {
        const next = [
          ...prev,
          mapped || {
            id: String(created?.id || Date.now()),
            author: displayName || t('common.guest', 'Guest'),
            avatar: userAvatar,
            seed: currentUserId || displayName,
            text: created?.content || text,
            _api: true,
          },
        ];
        onCountChange?.(next.length);
        return next;
      });
      setDraft('');
    } catch {
      onError?.(t('home.hint.commentFailed', 'Could not post comment.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`post-comments${open ? ' post-comments--open' : ''}`}>
      <div className="post-comments__inner">
        <div className="post-comments__body">
          <h5 className="post-comments__title">{t('home.post.commentsTitle', 'Comments')}</h5>
          <ul className="post-comments__list">
            {loading ? (
              <li className="post-comment">
                <p>{t('common.loading', 'Loading…')}</p>
              </li>
            ) : null}
            {!loading && comments.length === 0 ? (
              <li className="post-comment post-comment--empty">
                <p>{t('post.noCommentsYet', 'No comments yet. Be the first to comment.')}</p>
              </li>
            ) : null}
            {comments.map((comment) => (
              <li key={comment.id} className="post-comment">
                <img className="post-comment__avatar" src={comment.avatar} width="32" height="32" alt="" />
                <div className="post-comment__bubble">
                  <strong>{comment.author}</strong>
                  <p>{comment.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <form className="post-comments__form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="post-comments__input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t('home.post.writeComment', 'Write a comment...')}
              disabled={!token || submitting}
            />
            <button
              type="submit"
              className="post-comments__submit"
              disabled={!token || submitting || !draft.trim()}
            >
              {t('home.post.submitComment', 'Post')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
