import { useRef, useState } from 'react';
import { FileText, Upload, Trash2, ExternalLink } from 'lucide-react';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import { saveStoredResume, clearStoredResume } from '../profile/profileResumeStorage.js';
import './ProfileResumeSection.css';

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export default function ProfileResumeSection({
  userId,
  resumeName = '',
  resumeDataUrl = '',
  onResumeChange,
  onCompletionRefresh,
}) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const hasResume = Boolean(resumeName && resumeDataUrl);

  const handlePick = () => {
    if (loading) return;
    inputRef.current?.click();
  };

  const handleFile = (file) => {
    if (!file || !userId) return;

    if (file.size > MAX_RESUME_BYTES) {
      setError(t('profile.resume.tooLarge', 'File is too large (max 5 MB).'));
      return;
    }

    setLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dataUrl = typeof reader.result === 'string' ? reader.result : '';
        const saved = saveStoredResume(userId, {
          resumeName: file.name,
          resumeDataUrl: dataUrl,
        });
        onResumeChange?.(saved);
        onCompletionRefresh?.();
      } catch {
        setError(t('profile.resume.saveFailed', 'Could not save resume.'));
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError(t('profile.resume.readFailed', 'Could not read file.'));
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    if (!userId || loading) return;
    clearStoredResume(userId);
    onResumeChange?.({ resumeName: '', resumeDataUrl: '' });
    onCompletionRefresh?.();
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <section className="profile-resume-card">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />

      <div className="profile-resume-card__head">
        <div className="profile-resume-card__title-wrap">
          <FileText size={18} aria-hidden="true" />
          <h2>{t('profile.resume.title', 'Resume')}</h2>
        </div>
        {hasResume ? (
          <button
            type="button"
            className="profile-resume-card__ghost-btn"
            onClick={handleRemove}
            disabled={loading}
          >
            <Trash2 size={16} />
            {t('profile.resume.remove', 'Remove')}
          </button>
        ) : null}
      </div>

      <div className="profile-resume-card__row">
        {hasResume ? (
          <>
            <div className="profile-resume-card__file">
              <FileText size={16} aria-hidden="true" />
              <span>{resumeName}</span>
            </div>
            <div className="profile-resume-card__actions">
              <a
                href={resumeDataUrl}
                download={resumeName}
                className="profile-resume-card__link-btn"
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={16} />
                {t('profile.resume.download', 'Download')}
              </a>
              <button
                type="button"
                className="profile-resume-card__btn"
                onClick={handlePick}
                disabled={loading}
              >
                {t('profile.resume.replace', 'Replace')}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="profile-resume-card__hint">
              {t(
                'profile.resume.hint',
                'Add your resume so recruiters can review your experience faster.',
              )}
            </p>
            <button
              type="button"
              className="profile-resume-card__btn profile-resume-card__btn--primary"
              onClick={handlePick}
              disabled={loading}
            >
              <Upload size={16} />
              {loading
                ? t('profile.resume.uploading', 'Uploading...')
                : t('profile.resume.add', 'Add resume')}
            </button>
          </>
        )}
      </div>

      {error ? <p className="auth-field-error">{error}</p> : null}
    </section>
  );
}
