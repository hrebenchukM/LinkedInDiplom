import React, { useEffect, useState, useContext } from 'react';
import './ChatProfilePanel.css';
import AppContext from '../appContext/AppContext';
import { fileUrl } from '../../shared/api/files';

const ChatProfilePanel = ({ selectedUser, showProfile, onBackClick }) => {
  const { request } = useContext(AppContext);

  const [fullUser, setFullUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= LOAD FULL USER =================
 const userId = selectedUser?.companion?.id;

useEffect(() => {
  if (!showProfile) {
    setFullUser(null);
    return;
  }

  if (!userId) return;

  setLoading(true);

  request(`api://user/${userId}`)
    .then(res => {
      // request может вернуть { data } или сам объект
      setFullUser(res?.data ?? res);
    })
    .catch(() => {
      setFullUser(null);
    })
    .finally(() => {
      setLoading(false);
    });

}, [showProfile, userId]);


  if (!showProfile) return null;

  if (loading) {
    return (
      <div className={`chat-profile ${showProfile ? 'show-profile' : ''}`}>
        <button className="profile-back-button" onClick={onBackClick}>
          ←
        </button>
        <div style={{ padding: '24px' }}>Loading profile...</div>
      </div>
    );
  }

  if (!fullUser) {
    return (
      <div className={`chat-profile ${showProfile ? 'show-profile' : ''}`}>
        <button className="profile-back-button" onClick={onBackClick}>
          ←
        </button>
        <div style={{ padding: '24px' }}>User not found</div>
      </div>
    );
  }

  return (
    <div className={`chat-profile ${showProfile ? 'show-profile' : ''}`}>

      {/* BACK BUTTON */}
      <button className="profile-back-button" onClick={onBackClick}>
        ←
      </button>

      {/* AVATAR */}
      <div className="profile-avatar-large">
        <img
          src={fileUrl(fullUser.avatarUrl)}
          alt={fullUser.firstName}
        />
      </div>

      {/* NAME */}
      <h2 className="profile-name">
        {fullUser.firstName} {fullUser.secondName}
      </h2>

      {/* TITLE */}
      {fullUser.profileTitle && (
        <p className="profile-position" style={{ textAlign: 'center', marginBottom: '24px' }}>
          {fullUser.profileTitle}
        </p>
      )}

      {/* PHONE */}
      <div className="profile-section">
        <label>Phone Number</label>
        <p>{fullUser.phone || '—'}</p>
      </div>

      {/* EMAIL */}
      <div className="profile-section">
        <label>Email Address</label>
        <p>{fullUser.email}</p>
      </div>

      {/* LOCATION */}
      {fullUser.location && (
        <div className="profile-section">
          <label>Location</label>
          <p>{fullUser.location}</p>
        </div>
      )}

      {/* PORTFOLIO */}
      {fullUser.portfolioUrl && (
        <div className="profile-section">
          <label>Portfolio</label>
          <p className="profile-link">
            <a href={fullUser.portfolioUrl} target="_blank" rel="noreferrer">
              {fullUser.portfolioUrl}
            </a>
          </p>
        </div>
      )}

      {/* ABOUT */}
      {fullUser.genInfo && (
        <div className="profile-section">
          <label>About</label>
          <p style={{ whiteSpace: 'pre-line' }}>
            {fullUser.genInfo}
          </p>
        </div>
      )}

      {/* EDUCATION */}
      {fullUser.university && (
        <div className="profile-section">
          <label>Education</label>
          <p className="profile-education">{fullUser.university}</p>
        </div>
      )}

    </div>
  );
};

export default ChatProfilePanel;
