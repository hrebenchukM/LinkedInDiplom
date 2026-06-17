import React, { useContext, useEffect, useRef, useState } from 'react';
import { Camera, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import './ProfileHeader.css';
import RequestRecommendationModal from '../Modals/RequestRecommendationModal';
import { getAssetUrl, getProfileHeader, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import SafeImage from '../../shared/ui/SafeImage';
import {
  deleteAvatar,
  deleteHeader,
  publishProfileUpdate,
  updateMyProfile,
  uploadAvatar,
  uploadHeader,
} from '../profile/profileApi.js';
import {
  getDisplayName,
  getProfileAvatar,
  getProfileMediaVersion,
  mapProfileToUpdateRequest,
  mergeProfileUpdate,
} from '../profile/mapProfile.js';
import { getErrorMessage } from '../../shared/lib/apiError.js';
import AppContext from '../appContext/AppContext';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const ProfileHeader = ({ profile, onProfileUpdated }) => {
  const { t } = useTranslation();
  const { account, profile: contextProfile, setProfile } = useContext(AppContext);
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [firstNameDraft, setFirstNameDraft] = useState('');
  const [lastNameDraft, setLastNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);

  const avatarInputRef = useRef(null);
  const headerInputRef = useRef(null);

  const user = profile?.user;
  const login = profile?.login;
  const role = profile?.role;

  useEffect(() => {
    if (!user) return;
    setFirstNameDraft(user.firstName ?? '');
    setLastNameDraft(user.secondName ?? user.lastName ?? '');
  }, [user?.firstName, user?.secondName, user?.lastName]);

  if (!user) return null;

  const fullName = getDisplayName(profile);
  const mediaVersion = getProfileMediaVersion(profile);
  const headerBackground = getAssetUrl(getProfileHeader(profile), '', mediaVersion);
  const avatarSrc = getAssetUrl(getProfileAvatar(profile) || user.avatarUrl, IMAGE_PLACEHOLDERS.avatar, mediaVersion);
  const hasCustomAvatar = Boolean(getProfileAvatar(profile));
  const hasCustomCover = Boolean(getProfileHeader(profile));

  const handleUpload = async (file, type, inputElement) => {
    if (!file || uploading) return;

    setUploading(type);
    setUploadError('');
    setUploadSuccess('');

    try {
      const uploadOptions = {
        currentProfile: contextProfile ?? profile,
        setProfile,
        accountEmail: account?.email ?? login,
      };

      const updatedProfile =
        type === 'avatar'
          ? await uploadAvatar(file, uploadOptions)
          : await uploadHeader(file, uploadOptions);

      if (updatedProfile) {
        const enriched = {
          ...updatedProfile,
          login: updatedProfile.login ?? account?.email ?? login,
          role,
        };
        onProfileUpdated?.(enriched);
        setUploadSuccess(
          type === 'avatar'
            ? t('profile.header.avatarSaved', 'Profile photo updated')
            : t('profile.header.coverSaved', 'Cover photo updated'),
        );
      }
    } catch (err) {
      setUploadError(getErrorMessage(err));
    } finally {
      setUploading(null);
      if (inputElement) inputElement.value = '';
    }
  };

  const handleDelete = async (type) => {
    if (uploading) return;

    setUploading(`delete-${type}`);
    setUploadError('');
    setUploadSuccess('');

    try {
      const uploadOptions = {
        currentProfile: contextProfile ?? profile,
        setProfile,
        accountEmail: account?.email ?? login,
      };

      const updatedProfile =
        type === 'avatar'
          ? await deleteAvatar(uploadOptions)
          : await deleteHeader(uploadOptions);

      if (updatedProfile) {
        const enriched = {
          ...updatedProfile,
          login: updatedProfile.login ?? account?.email ?? login,
          role,
        };
        onProfileUpdated?.(enriched);
        setUploadSuccess(
          type === 'avatar'
            ? t('profile.header.avatarDeleted', 'Profile photo removed')
            : t('profile.header.coverDeleted', 'Cover photo removed'),
        );
      }
    } catch (err) {
      setUploadError(getErrorMessage(err));
    } finally {
      setUploading(null);
    }
  };

  const openFilePicker = (type) => {
    if (uploading) return;
    if (type === 'avatar') avatarInputRef.current?.click();
    else headerInputRef.current?.click();
  };

  const cancelNameEdit = () => {
    setFirstNameDraft(user.firstName ?? '');
    setLastNameDraft(user.secondName ?? user.lastName ?? '');
    setIsEditingName(false);
  };

  const handleSaveName = async (event) => {
    event.preventDefault();
    if (savingName || uploading) return;

    const firstName = firstNameDraft.trim();
    const lastName = lastNameDraft.trim();
    if (!firstName) {
      setUploadError(t('profile.header.firstNameRequired', 'First name is required'));
      return;
    }

    setSavingName(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const payload = mapProfileToUpdateRequest({ firstName });
      if (lastName) {
        payload.lastName = lastName;
      }

      const updated = await updateMyProfile(
        payload,
        'patch',
        account?.email ?? login,
      );
      const merged = mergeProfileUpdate(contextProfile ?? profile, updated);
      const enriched = {
        ...merged,
        login: merged.login ?? account?.email ?? login,
        role,
      };
      publishProfileUpdate(enriched, setProfile);
      onProfileUpdated?.(enriched);
      setIsEditingName(false);
      setUploadSuccess(t('profile.header.nameSaved', 'Name updated'));
    } catch (err) {
      setUploadError(getErrorMessage(err));
    } finally {
      setSavingName(false);
    }
  };

  return (
    <>
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleUpload(e.target.files?.[0], 'avatar', e.target)}
      />
      <input
        ref={headerInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleUpload(e.target.files?.[0], 'header', e.target)}
      />

      <div className={`profile-header-card${uploading ? ' profile-header-card--uploading' : ''}`}>
        <div
          className="profile-banner"
          style={
            headerBackground
              ? { backgroundImage: `url("${headerBackground}")` }
              : undefined
          }
        >
          <div className="profile-banner__actions">
            <button
              type="button"
              className="camera-button camera-button--cover"
              onClick={() => openFilePicker('header')}
              disabled={Boolean(uploading)}
              aria-label={
                hasCustomCover
                  ? t('profile.header.change', 'Change cover')
                  : t('profile.header.addCover', 'Add cover')
              }
            >
              <Camera size={18} />
              <span>
                {hasCustomCover
                  ? t('profile.header.change', 'Change cover')
                  : t('profile.header.addCover', 'Add cover')}
              </span>
            </button>
            {hasCustomCover ? (
              <button
                type="button"
                className="camera-button camera-button--cover camera-button--delete"
                onClick={() => handleDelete('header')}
                disabled={Boolean(uploading)}
                aria-label={t('profile.header.deleteCover', 'Remove cover')}
              >
                <Trash2 size={16} />
                <span>{t('profile.header.deleteCover', 'Remove cover')}</span>
              </button>
            ) : null}
          </div>
        </div>

        <div className="profile-main-info">
          <div className="profile-top-section">
            <div className="profile-avatar-section">
              <SafeImage
                src={avatarSrc}
                fallback={IMAGE_PLACEHOLDERS.avatar}
                alt={t('nav.profile', 'My profile')}
                className="profile-avatar"
              />
              <div className="profile-avatar-actions">
                <button
                  type="button"
                  className="camera-button camera-button--avatar"
                  onClick={() => openFilePicker('avatar')}
                  disabled={Boolean(uploading)}
                  aria-label={t('profile.header.changeAvatar', 'Change photo')}
                >
                  <Camera size={16} />
                </button>
                {hasCustomAvatar ? (
                  <button
                    type="button"
                    className="camera-button camera-button--avatar camera-button--delete"
                    onClick={() => handleDelete('avatar')}
                    disabled={Boolean(uploading)}
                    aria-label={t('profile.header.deleteAvatar', 'Remove photo')}
                  >
                    <Trash2 size={14} />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-name-row">
              {isEditingName ? (
                <form className="profile-name-form" onSubmit={handleSaveName}>
                  <div className="profile-name-form__fields">
                    <label className="profile-name-form__field">
                      <span>{t('profile.header.firstName', 'First name')}</span>
                      <input
                        type="text"
                        className="profile-name-form__input"
                        value={firstNameDraft}
                        onChange={(event) => setFirstNameDraft(event.target.value)}
                        disabled={savingName}
                        autoFocus
                        maxLength={100}
                      />
                    </label>
                    <label className="profile-name-form__field">
                      <span>{t('profile.header.lastName', 'Last name')}</span>
                      <input
                        type="text"
                        className="profile-name-form__input"
                        value={lastNameDraft}
                        onChange={(event) => setLastNameDraft(event.target.value)}
                        disabled={savingName}
                        maxLength={100}
                      />
                    </label>
                  </div>
                  <div className="profile-name-form__actions">
                    <button
                      type="submit"
                      className="btn-primary profile-name-form__save"
                      disabled={savingName || !firstNameDraft.trim()}
                    >
                      {savingName
                        ? t('common.loading', 'Loading…')
                        : t('common.save', 'Save')}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary profile-name-form__cancel"
                      onClick={cancelNameEdit}
                      disabled={savingName}
                    >
                      {t('common.cancel', 'Cancel')}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="profile-name">{fullName || login}</h1>
                  <button
                    type="button"
                    className="profile-name-edit"
                    onClick={() => {
                      setUploadError('');
                      setUploadSuccess('');
                      setIsEditingName(true);
                    }}
                    disabled={Boolean(uploading)}
                    aria-label={t('profile.header.editName', 'Edit name')}
                    title={t('profile.header.editName', 'Edit name')}
                  >
                    <Pencil size={16} />
                  </button>
                </>
              )}
              {user.university ? (
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
              ) : null}
            </div>

            {(user.profileTitle || user.headline) ? (
              <p className="profile-title">{user.profileTitle || user.headline}</p>
            ) : null}
            {user.location ? (
              <p className="profile-location">{user.location}</p>
            ) : null}

            {uploading ? (
              <p className="profile-upload-status">
                {uploading === 'avatar'
                  ? t('profile.header.uploadingAvatar', 'Uploading photo...')
                  : uploading === 'header'
                    ? t('profile.header.uploadingCover', 'Uploading cover...')
                    : uploading === 'delete-avatar'
                      ? t('profile.header.deletingAvatar', 'Removing photo...')
                      : t('profile.header.deletingCover', 'Removing cover...')}
              </p>
            ) : null}
            {savingName ? (
              <p className="profile-upload-status">
                {t('profile.header.savingName', 'Saving name...')}
              </p>
            ) : null}
            {uploadError ? <p className="auth-field-error">{uploadError}</p> : null}
            {uploadSuccess ? <p className="profile-upload-success">{uploadSuccess}</p> : null}

            <div className="profile-links">
              {user.portfolioUrl ? (
                <a
                  href={user.portfolioUrl}
                  className="profile-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('userProfile.portfolio', 'Portfolio')}
                  <ExternalLink size={14} />
                </a>
              ) : null}
            </div>

            <div className="profile-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsRecommendationModalOpen(true)}
              >
                {t('profile.requestRecommendation', 'Request recommendation')}
              </button>
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
