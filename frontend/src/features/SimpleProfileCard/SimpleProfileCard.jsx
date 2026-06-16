import React, { useContext } from 'react';
import AppContext from '../../features/appContext/AppContext';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import './SimpleProfileCard.css';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const SimpleProfileCard = () => {
  const { t } = useTranslation();
  const { user, profile } = useContext(AppContext);

  if (!user || !profile?.user) return null;

  const u = profile.user;

  return (
    <div className="simple-profile-card">
      <div className="simple-profile-content">
        <img
          src={getAssetUrl(u.avatarUrl, IMAGE_PLACEHOLDERS.avatar)}
          alt={t('simpleProfile.alt', 'Profile')}
          className="simple-profile-avatar"
        />

        <h3 className="simple-profile-name">
          {u.firstName} {u.secondName}
        </h3>

        <p className="simple-profile-title">
          {u.profileTitle || u.headline || '—'}
          {profile.company?.name && ` • ${profile.company.name}`}
        </p>
      </div>

      <div className="simple-profile-divider"></div>

      <button className="work-experience-btn">
        {t('simpleProfile.addExperience', '+ Work experience')}
      </button>
    </div>
  );
};

export default SimpleProfileCard;
