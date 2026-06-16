import React, { useContext } from 'react';
import { Bookmark } from 'lucide-react';
import AppContext from '../../features/appContext/AppContext';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import { getProfileMediaVersion } from '../profile/mapProfile.js';
import '../ProfileCard/ProfileCard.css';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const ProfileCard = ({ activeFeedTab = 'all', onSavedClick }) => {
  const { t } = useTranslation();
  const { user, profile } = useContext(AppContext);

  if (!user || !profile?.user) return null;
  const u = profile.user;

  const avatarVersion = getProfileMediaVersion(profile);

  return (
    <div className="profile-card">
      <div className="profile-header">
      <img
          src={getAssetUrl(profile.user.avatarUrl, IMAGE_PLACEHOLDERS.avatar, avatarVersion)}
        alt={t('profileCard.alt', 'Profile')}
        className="profile-avatar"
      />


        <h3 className="profile-name">
          {u.firstName} {u.secondName}
        </h3>

        <p className="profile-title">
           {profile.user.profileTitle || profile.user.headline || '—'}
          {profile.company?.name && ` • ${profile.company.name}`}
        </p>
      </div>

      <div className="profile-divider"></div>

      <div className="profile-contacts">
        <h4 className="contacts-title">{t('profileCard.contacts', 'Contacts')}</h4>
        <p className="contacts-subtitle">
          {t('profileCard.contactsSub', 'Expand your network of contacts')}
        </p>
      </div>

      <div className="profile-divider"></div>

      <button
        type="button"
        className={`profile-saved${activeFeedTab === 'saved' ? ' profile-saved--active' : ''}`}
        onClick={onSavedClick}
      >
        <Bookmark size={16} />
        <span>{t('home.feedTab.saved', 'Saved')}</span>
      </button>
    </div>
  );
};

export default ProfileCard;
