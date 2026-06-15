import React, { useContext } from 'react';
import AppContext from '../../features/appContext/AppContext';
import { fileUrl } from '../../shared/api/files';
import './SimpleProfileCard.css';

const SimpleProfileCard = () => {
  const { user, profile } = useContext(AppContext);

  if (!user || !profile?.user) return null;

  const u = profile.user;

  return (
    <div className="simple-profile-card">
      <div className="simple-profile-content">
        <img
          src={
            u.avatarUrl
              ? fileUrl(u.avatarUrl)
              : '/img/avatar-placeholder.png'
          }
          alt="Profile"
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
        + Work experience
      </button>
    </div>
  );
};

export default SimpleProfileCard;
