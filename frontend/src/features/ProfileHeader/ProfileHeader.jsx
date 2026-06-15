import React, { useContext, useRef, useState } from 'react';
import { Camera, Edit, ExternalLink } from 'lucide-react';
import './ProfileHeader.css';
import RequestRecommendationModal from '../Modals/RequestRecommendationModal';
import { getAssetUrl, getProfileHeader, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import SafeImage from '../../shared/ui/SafeImage';
import { uploadAvatar, uploadHeader } from '../profile/profileApi.js';
import { getDisplayName } from '../profile/mapProfile.js';
import { getErrorMessage } from '../../shared/lib/apiError.js';
import AppContext from '../appContext/AppContext';

const ProfileHeader = ({ profile, onProfileUpdated }) => {
  const { account } = useContext(AppContext);
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  const avatarInputRef = useRef(null);
  const headerInputRef = useRef(null);

  if (!profile?.user) return null;

  const { user, login, role } = profile;
  const fullName = getDisplayName(profile);
  const headerBackground = getProfileHeader(profile);

  const handleUpload = async (file, type) => {
    if (!file || uploading) return;

    setUploading(true);
    setUploadError('');

    try {
      const updatedProfile =
        type === 'avatar'
          ? await uploadAvatar(file)
          : await uploadHeader(file);

      if (updatedProfile) {
        onProfileUpdated?.({
          ...updatedProfile,
          login: updatedProfile.login ?? account?.email ?? login,
          role,
        });
      }
    } catch (err) {
      setUploadError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const openFilePicker = (type) => {
    if (uploading) return;
    if (type === 'avatar') avatarInputRef.current?.click();
    else headerInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleUpload(e.target.files?.[0], 'avatar')}
      />
      <input
        ref={headerInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleUpload(e.target.files?.[0], 'header')}
      />

      <div className="profile-header-card">
        <div
          className="profile-banner"
          style={{
            backgroundImage: headerBackground
              ? `url(${headerBackground})`
              : undefined,
          }}
        >
          <button
            type="button"
            className="camera-button"
            onClick={() => openFilePicker('header')}
            disabled={uploading}
            aria-label="Upload header image"
          >
            <Camera size={20} />
          </button>
        </div>

        <div className="profile-main-info">
          <div className="profile-top-section">
            <div className="profile-avatar-section">
              <SafeImage
                src={user.avatarUrl}
                fallback={IMAGE_PLACEHOLDERS.avatar}
                alt="Profile"
                className="profile-avatar"
                onClick={() => openFilePicker('avatar')}
                style={{ cursor: uploading ? 'default' : 'pointer' }}
                title="Upload avatar"
              />
            </div>
            <button type="button" className="edit-profile-button">
              <Edit size={18} />
            </button>
          </div>

          <div className="profile-details">
            <div className="profile-name-row">
              <h1 className="profile-name">{fullName || login}</h1>
              {user.university && (
                <div className="profile-university-badge">
                  <div className="university-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="#7c3aed" strokeWidth="1.5" />
                      <path
                        d="M5 8l2 2 4-4"
                        stroke="#7c3aed"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span>{user.university}</span>
                </div>
              )}
            </div>

            <p className="profile-title">{user.profileTitle || user.headline || '—'}</p>
            <p className="profile-location">{user.location || '—'}</p>

            {uploadError ? <p className="auth-field-error">{uploadError}</p> : null}

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
              <button type="button" className="btn-primary">Open to</button>
              <button type="button" className="btn-secondary">Add profile section</button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsRecommendationModalOpen(true)}
              >
                Request recommendation
              </button>
              <button type="button" className="btn-secondary">More</button>
            </div>
          </div>
        </div>
      </div>

      <RequestRecommendationModal
        isOpen={isRecommendationModalOpen}
        onClose={() => setIsRecommendationModalOpen(false)}
      />
    </>
  );
};

export default ProfileHeader;
