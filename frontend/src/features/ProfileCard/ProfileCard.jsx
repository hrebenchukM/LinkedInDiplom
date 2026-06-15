import React, { useContext } from 'react';
import { Bookmark } from 'lucide-react';
import AppContext from '../../features/appContext/AppContext';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import '../ProfileCard/ProfileCard.css';

const ProfileCard = () => {
  const { user, profile } = useContext(AppContext);

  if (!user || !profile?.user) return null;
  const u = profile.user;

  return (
    <div className="profile-card">
      <div className="profile-header">
      <img
          src={getAssetUrl(profile.user.avatarUrl, IMAGE_PLACEHOLDERS.avatar)}
        alt="Profile"
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
        <h4 className="contacts-title">Contacts</h4>
        <p className="contacts-subtitle">
          Expand your network of contacts
        </p>
      </div>

      <div className="profile-divider"></div>

      <div className="profile-saved">
        <Bookmark size={16} />
        <span>Saved elements</span>
      </div>
    </div>
  );
};

export default ProfileCard;
