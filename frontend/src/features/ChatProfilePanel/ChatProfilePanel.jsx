import React, { useEffect, useState } from 'react';
import './ChatProfilePanel.css';
import { fileUrl } from '../../shared/api/files';
import { getProfileByUserId } from '../profile/profileApi.js';
import { mapProfileDto, getDisplayName } from '../profile/mapProfile.js';

const ChatProfilePanel = ({ selectedUser, showProfile, onBackClick }) => {
  const [fullUser, setFullUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const userId = selectedUser?.companion?.id ?? selectedUser?.companionUserId;

  useEffect(() => {
    if (!showProfile) {
      setFullUser(null);
      return;
    }

    if (selectedUser?.companion) {
      setFullUser(selectedUser.companion);
      return;
    }

    if (!userId) return;

    let cancelled = false;
    setLoading(true);

    getProfileByUserId(userId)
      .then((profile) => {
        if (cancelled) return;
        const mapped = mapProfileDto(profile);
        setFullUser({
          ...mapped.user,
          email: mapped.user?.email,
          displayName: getDisplayName(mapped),
        });
      })
      .catch(() => {
        if (!cancelled) setFullUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showProfile, userId, selectedUser?.companion]);

  if (!showProfile) return null;

  if (loading) {
    return (
      <div className={`chat-profile ${showProfile ? 'show-profile' : ''}`}>
        <button type="button" className="profile-back-button" onClick={onBackClick}>
          ←
        </button>
        <div style={{ padding: '24px' }}>Loading profile...</div>
      </div>
    );
  }

  if (!fullUser) {
    return (
      <div className={`chat-profile ${showProfile ? 'show-profile' : ''}`}>
        <button type="button" className="profile-back-button" onClick={onBackClick}>
          ←
        </button>
        <div style={{ padding: '24px' }}>User not found</div>
      </div>
    );
  }

  return (
    <div className={`chat-profile ${showProfile ? 'show-profile' : ''}`}>
      <button type="button" className="profile-back-button" onClick={onBackClick}>
        ←
      </button>

      <div className="profile-avatar-large">
        <img
          src={fileUrl(fullUser.avatarUrl) || '/img/avatar-placeholder.png'}
          alt={fullUser.firstName}
        />
      </div>

      <h2 className="profile-name">
        {fullUser.firstName} {fullUser.secondName}
      </h2>

      {(fullUser.profileTitle || fullUser.headline) && (
        <p
          className="profile-position"
          style={{ textAlign: 'center', marginBottom: '24px' }}
        >
          {fullUser.profileTitle || fullUser.headline}
        </p>
      )}

      <div className="profile-section">
        <label>Phone Number</label>
        <p>{fullUser.phone || '—'}</p>
      </div>

      <div className="profile-section">
        <label>Email Address</label>
        <p>{fullUser.email || '—'}</p>
      </div>

      {fullUser.location ? (
        <div className="profile-section">
          <label>Location</label>
          <p>{fullUser.location}</p>
        </div>
      ) : null}

      {fullUser.portfolioUrl ? (
        <div className="profile-section">
          <label>Portfolio</label>
          <p className="profile-link">
            <a href={fullUser.portfolioUrl} target="_blank" rel="noreferrer">
              {fullUser.portfolioUrl}
            </a>
          </p>
        </div>
      ) : null}

      {fullUser.genInfo ? (
        <div className="profile-section">
          <label>About</label>
          <p style={{ whiteSpace: 'pre-line' }}>{fullUser.genInfo}</p>
        </div>
      ) : null}

      {fullUser.university ? (
        <div className="profile-section">
          <label>Education</label>
          <p className="profile-education">{fullUser.university}</p>
        </div>
      ) : null}
    </div>
  );
};

export default ChatProfilePanel;
