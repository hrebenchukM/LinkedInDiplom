import { useNavigate } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import SafeImage from '../../shared/ui/SafeImage';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import './SharedPostCard.css';

export default function SharedPostCard({ payload, media, isMine }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!payload) return null;

  const imageSrc = getAssetUrl(
    media?.url || media?.rawUrl || payload.imageUrl,
    '',
  );

  const authorName = payload.authorName || t('chat.sharedPost.feedAuthor', 'Feed post');
  const caption = String(payload.caption || '').trim();

  const handleOpen = () => {
    navigate('/app');
  };

  return (
    <button
      type="button"
      className={`shared-post-card${isMine ? ' shared-post-card--mine' : ''}`}
      onClick={handleOpen}
    >
      <div className="shared-post-card__header">
        <LayoutGrid size={15} aria-hidden="true" />
        <span>{t('chat.sharedPost.label', 'Shared a post')}</span>
      </div>

      <div className="shared-post-card__body">
        <div className="shared-post-card__author">
          <SafeImage
            src={payload.authorAvatar}
            fallback={IMAGE_PLACEHOLDERS.avatar}
            alt={authorName}
            className="shared-post-card__avatar"
          />
          <div className="shared-post-card__author-text">
            <strong>{authorName}</strong>
            {payload.authorTitle ? <span>{payload.authorTitle}</span> : null}
          </div>
        </div>

        {imageSrc ? (
          <div className="shared-post-card__media">
            <SafeImage
              src={imageSrc}
              fallback={IMAGE_PLACEHOLDERS.cover}
              alt={t('chat.sharedPost.mediaAlt', 'Shared post image')}
              className="shared-post-card__image"
            />
          </div>
        ) : null}

        {caption ? (
          <p className="shared-post-card__caption">
            <strong>{authorName}</strong>
            <span>{caption}</span>
          </p>
        ) : null}
      </div>
    </button>
  );
}
