import { ThumbsUp, MessageCircle, Share2, Send } from 'lucide-react';
import './PostCard.css';
import { fileUrl } from '../../shared/api/files';
const PostCard = ({ post, onNavigate }) => {
  const user = post.user; // пришёл через JOIN users

  return (
    <div className="post-card">
      <div className="post-header">
      <img
              src={fileUrl(user.avatarUrl)}
              alt={user.firstName || 'User'}
              className="post-avatar"
              onClick={() => onNavigate?.('portfolio')}
              style={{ cursor: 'pointer' }}
            />

        <div className="post-info">
          <h4 className="post-author">
            {user?.firstName} {user?.secondName}
          </h4>
          <p className="post-title">
            {user?.position || ''}
          </p>
          <span className="post-time">
            {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
      </div>
 {/* ===== POST IMAGE (FROM post.media) ===== */}
      {post.media?.length > 0 && (
        <div className="post-image">
          <img
            src={fileUrl(post.media[0].url)}
            alt="Post media"
          />
        </div>
      )}

      <div className="post-actions">
        <button className="action-btn">
          <ThumbsUp size={18} />
          <span>Like</span>
        </button>

        <button className="action-btn">
          <MessageCircle size={18} />
          <span>Comment</span>
        </button>

        <button className="action-btn">
          <Share2 size={18} />
          <span>Share</span>
        </button>

        <button className="action-btn">
          <Send size={18} />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
