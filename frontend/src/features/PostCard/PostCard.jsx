import { useContext, useEffect, useState } from 'react';
import { ThumbsUp, MessageCircle, Share2, Send } from 'lucide-react';
import './PostCard.css';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import SafeImage from '../../shared/ui/SafeImage';
import AppContext from '../appContext/AppContext';
import {
  deletePostReaction,
  setPostReaction,
} from '../content/contentApi.js';
import { getErrorMessage } from '../../shared/lib/apiError.js';

const PostCard = ({ post, onNavigate }) => {
  const { token } = useContext(AppContext);
  const user = post.user ?? post.author ?? {
    firstName: 'User',
    secondName: '',
    avatarUrl: null,
    position: '',
  };

  const [liked, setLiked] = useState(Boolean(post.myReaction));
  const [reactionCount, setReactionCount] = useState(post.reactionsCount ?? 0);
  const [reacting, setReacting] = useState(false);
  const [reactionError, setReactionError] = useState('');

  useEffect(() => {
    setLiked(Boolean(post.myReaction));
    setReactionCount(post.reactionsCount ?? 0);
  }, [post.id, post.myReaction, post.reactionsCount]);

  const avatarSrc = getAssetUrl(
    user.avatarUrl ?? user.avatar,
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

  return (
    <div className="post-card">
      <div className="post-header">
        <SafeImage
          src={avatarSrc}
          fallback={IMAGE_PLACEHOLDERS.avatar}
          alt={user.firstName || 'User'}
          className="post-avatar"
          onClick={() => onNavigate?.('portfolio')}
          style={{ cursor: 'pointer' }}
        />

        <div className="post-info">
          <h4 className="post-author">
            {user.firstName} {user.secondName}
          </h4>
          <p className="post-title">{user.position || ''}</p>
          <span className="post-time">
            {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
          </span>
        </div>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
      </div>

      {mediaSrc ? (
        <div className="post-image">
          <SafeImage
            src={mediaSrc}
            fallback={IMAGE_PLACEHOLDERS.cover}
            alt="Post media"
          />
        </div>
      ) : null}

      {reactionError ? <p className="auth-field-error">{reactionError}</p> : null}

      <div className="post-actions">
        <button
          type="button"
          className={`action-btn${liked ? ' active' : ''}`}
          onClick={handleLike}
          disabled={!token || reacting}
        >
          <ThumbsUp size={18} />
          <span>
            Like
            {reactionCount > 0 ? ` · ${reactionCount}` : ''}
          </span>
        </button>

        <button type="button" className="action-btn">
          <MessageCircle size={18} />
          <span>
            Comment
            {post.commentsCount > 0 ? ` · ${post.commentsCount}` : ''}
          </span>
        </button>

        <button type="button" className="action-btn">
          <Share2 size={18} />
          <span>Share</span>
        </button>

        <button type="button" className="action-btn">
          <Send size={18} />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
