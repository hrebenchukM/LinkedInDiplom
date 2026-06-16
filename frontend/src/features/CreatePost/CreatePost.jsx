import React, { useState ,useContext} from 'react';
import { Image, Video, Calendar } from 'lucide-react';
import '../CreatePost/CreatePost.css';
import CreatePostModal from '../Modals/CreatePostModal';
import AppContext from '../../features/appContext/AppContext';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import { getProfileMediaVersion } from '../profile/mapProfile.js';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const CreatePost = ({ onPostCreated }) => {
  const { t } = useTranslation();
  const { user, profile } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user || !profile?.user) return null;

  const u = profile.user;
  const avatarVersion = getProfileMediaVersion(profile);

const modalUser = {
  name: `${u.firstName} ${u.secondName}`.trim(),
  avatar: u.avatarUrl ? getAssetUrl(u.avatarUrl, '', avatarVersion) : null
};
  return (
    <>
    <div className="create-post">
      <div className="create-post-input">
<img
  src={getAssetUrl(u?.avatarUrl ?? u?.avatar, IMAGE_PLACEHOLDERS.avatar, avatarVersion)}
  alt={t('common.profileAlt', 'Profile')}
  className="create-post-avatar"
/>

        <input
            type="text"
            placeholder={t('home.composer.placeholder', 'Start your post')}
            className="create-post-textbox"
            onClick={() => setIsModalOpen(true)}
            readOnly
          />
      </div>

      <div className="create-post-actions">
        <button type="button" className="post-action-btn" onClick={() => setIsModalOpen(true)}>
          <Image size={20} color="#7C3AED" />
          <span>{t('home.imagePost', 'Photo')}</span>
        </button>
        <button type="button" className="post-action-btn" onClick={() => setIsModalOpen(true)}>
          <Video size={20} color="#7C3AED" />
          <span>{t('home.composer.video', 'Video')}</span>
        </button>
        <button type="button" className="post-action-btn" onClick={() => setIsModalOpen(true)}>
          <Calendar size={20} color="#7C3AED" />
          <span>{t('home.composer.event', 'Event')}</span>
        </button>
      </div>
    </div>
        <CreatePostModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onPostCreated={onPostCreated}
  user={modalUser}
/>

    </>
  );
};

export default CreatePost;
