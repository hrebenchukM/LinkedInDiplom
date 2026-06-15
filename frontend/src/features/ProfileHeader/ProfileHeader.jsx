import React, { useState } from 'react';
import { Camera, Edit, ExternalLink } from 'lucide-react';
import '../ProfileHeader/ProfileHeader.css';
import RequestRecommendationModal from '../Modals/RequestRecommendationModal';
import { fileUrl } from '../../shared/api/files';

const ProfileHeader = ({ profile }) => {
     const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);
const { user, login, role } = profile;
 const fullName =
    (user.firstName || "") +
    (user.secondName ? " " + user.secondName : "");


  const handleBannerUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        alert(`Banner image selected: ${file.name}`);
      }
    };
    input.click();
  };
  return (
    <>
    <div className="profile-header-card">
      <div
        className="profile-banner"
        style={{
          backgroundImage: user.headerUrl
            ? `url(${user.headerUrl})`
            : undefined
        }}
      >
         <button className="camera-button" onClick={handleBannerUpload}>
            <Camera size={20} />
          </button>
      </div>
      <div className="profile-main-info">
        <div className="profile-top-section">
          <div className="profile-avatar-section">
        <img
          src={fileUrl(user.avatarUrl)}
          alt="Profile"
          className="profile-avatar"
        />



          </div>
          <button className="edit-profile-button">
            <Edit size={18} />
          </button>
        </div>
        <div className="profile-details">
          <div className="profile-name-row">
            <h1 className="profile-name">  {fullName || login}</h1>
            {user.university && (
              <div className="profile-university-badge">
                <div className="university-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#7c3aed" strokeWidth="1.5"/>
                    <path d="M5 8l2 2 4-4" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>{user.university}</span>
              </div>
            )}

          </div>
          <p className="profile-title">  {user.profileTitle || "—"}</p>
          <p className="profile-location">{user.location || "—"}</p>
          <div className="profile-links">
          {user.portfolioUrl ? (
            <a
              href={user.portfolioUrl}
              className="profile-link"
              target="_blank"
              rel="noreferrer"
            >
              Custom portfolio link
              <ExternalLink size={14} />
            </a>
          ) : (
            <a href="#" className="profile-link">
              Change your custom portfolio link
              <ExternalLink size={14} />
            </a>
          )}

          <a href="#" className="profile-link">
            Edit contact information
          </a>
        </div>

          <div className="profile-actions">
            <button className="btn-primary">Open to</button>
            <button className="btn-secondary">Add profile section</button>
            <button className="btn-secondary" onClick={() => setIsRecommendationModalOpen(true)}>Request recommendation</button>
            <button className="btn-secondary">More</button>
          </div>
        </div>
      </div>
    </div>
          <RequestRecommendationModal isOpen={isRecommendationModalOpen} onClose={() => setIsRecommendationModalOpen(false)} />
    </>
  );
};

export default ProfileHeader;
