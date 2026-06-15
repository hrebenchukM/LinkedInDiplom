import { Eye, Plus } from 'lucide-react';
import '../ProfileAnalytics/ProfileAnalytics.css';

const Users = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const Briefcase = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const ProfileAnalytics = ({ analytics }) => {
  // ⛔ ничего не рендерим, пока данных нет
  if (!analytics) return null;

  const profileViews = analytics.profileViews ?? 0;
  const postViews = analytics.postViews ?? 0;

  return (
    <div className="analytics-card">
      <div className="analytics-header">
        <h2>Analytics</h2>
        <div className="analytics-privacy">
          <Eye size={16} />
          <span>Only you can see this</span>
        </div>
      </div>

      <div className="analytics-stats">
        <div className="stat-item">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <p className="stat-number">
              {profileViews} profile views
            </p>
            <p className="stat-description">
              To attract viewers, update your profile
            </p>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <Briefcase />
          </div>
          <div className="stat-content">
            <p className="stat-number">
              {postViews} post views
            </p>
            <p className="stat-description">
              To attract more followers, start a post
            </p>
          </div>
        </div>
      </div>

      <button className="show-analytics-button" type="button">
        <span>Show all analytics</span>
        <Plus size={18} />
      </button>
    </div>
  );
};

export default ProfileAnalytics;
