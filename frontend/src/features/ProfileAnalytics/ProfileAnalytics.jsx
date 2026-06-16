import { useState } from 'react';
import { Eye, Plus, Minus } from 'lucide-react';
import '../ProfileAnalytics/ProfileAnalytics.css';
import { useTranslation, getDateLocale } from '../../app/i18n/LocaleContext.jsx';
import { getProfileViewRecords } from '../profile/profileApi.js';

const Users = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const Briefcase = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

function formatViewDate(value, dateLocale) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(dateLocale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const ProfileAnalytics = ({ analytics }) => {
  const { t, locale } = useTranslation();
  const dateLocale = getDateLocale(locale);
  const [expanded, setExpanded] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [viewRecords, setViewRecords] = useState([]);
  const [detailsError, setDetailsError] = useState('');

  if (!analytics) return null;

  const profileViews = analytics.profileViews ?? 0;
  const postViews = analytics.postViews ?? 0;

  const handleToggleDetails = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);
    setDetailsError('');

    if (viewRecords.length > 0) return;

    setLoadingDetails(true);
    try {
      const records = await getProfileViewRecords();
      setViewRecords(records);
    } catch {
      setDetailsError(t('profile.analytics.loadFailed', 'Could not load analytics details.'));
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="analytics-card">
      <div className="analytics-header">
        <h2>{t('profile.analytics.title', 'Analytics')}</h2>
        <div className="analytics-privacy">
          <Eye size={16} />
          <span>{t('profile.analytics.private', 'Only you can see this')}</span>
        </div>
      </div>

      <div className="analytics-stats">
        <div className="stat-item">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <p className="stat-number">
              {t('profile.analytics.profileViews', '{n} profile views', { n: profileViews })}
            </p>
            <p className="stat-description">
              {t('profile.analytics.profileViewsHint', 'To attract viewers, update your profile')}
            </p>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <Briefcase />
          </div>
          <div className="stat-content">
            <p className="stat-number">
              {t('profile.analytics.postViews', '{n} post views', { n: postViews })}
            </p>
            <p className="stat-description">
              {t('profile.analytics.postViewsHint', 'To attract more followers, start a post')}
            </p>
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="analytics-details">
          {loadingDetails ? (
            <p className="analytics-details__status">{t('common.loading', 'Loading…')}</p>
          ) : null}
          {detailsError ? <p className="auth-field-error">{detailsError}</p> : null}
          {!loadingDetails && !detailsError && viewRecords.length === 0 ? (
            <p className="analytics-details__status">
              {t('profile.analytics.noViews', 'No profile views yet.')}
            </p>
          ) : null}
          {!loadingDetails && viewRecords.length > 0 ? (
            <ul className="analytics-details__list">
              {viewRecords.slice(0, 10).map((view) => (
                <li key={view.id ?? `${view.viewedAt}-${view.source}`}>
                  <span>{formatViewDate(view.viewedAt, dateLocale)}</span>
                  <span>{view.source || t('profile.analytics.sourceUnknown', 'profile')}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <button
        className="show-analytics-button"
        type="button"
        onClick={handleToggleDetails}
        aria-expanded={expanded}
      >
        <span>
          {expanded
            ? t('profile.analytics.hideAll', 'Hide analytics')
            : t('profile.analytics.showAll', 'Show all analytics')}
        </span>
        {expanded ? <Minus size={18} /> : <Plus size={18} />}
      </button>
    </div>
  );
};

export default ProfileAnalytics;
