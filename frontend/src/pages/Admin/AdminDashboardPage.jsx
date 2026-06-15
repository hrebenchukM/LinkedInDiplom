import { useEffect, useState } from 'react';
import { getErrorMessage } from '../../shared/lib/apiError';
import { getAdminStatsOverview } from '../../features/admin/adminApi';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    getAdminStatsOverview()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const cards = stats
    ? [
      { label: 'Users total', value: stats.totalUsers },
      { label: 'Users active', value: stats.activeUsers },
      { label: 'Users deleted', value: stats.deletedUsers },
      { label: 'Posts total', value: stats.totalPosts },
      { label: 'Posts active', value: stats.activePosts },
      { label: 'Posts deleted', value: stats.deletedPosts },
      { label: 'Vacancies total', value: stats.totalVacancies },
      { label: 'Vacancies active', value: stats.activeVacancies },
      { label: 'Vacancies deleted', value: stats.deletedVacancies },
      { label: 'Events total', value: stats.totalEvents },
      { label: 'Events upcoming', value: stats.upcomingEvents },
      { label: 'Events deleted', value: stats.deletedEvents },
    ]
    : [];

  return (
    <>
      <h1 className="admin-page-title">Dashboard</h1>
      <p className="admin-page-subtitle">Overview of platform statistics</p>

      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-loading">Loading stats...</div>}

      {!loading && stats && (
        <div className="admin-stats-grid">
          {cards.map((card) => (
            <div key={card.label} className="admin-stat-card">
              <h3>{card.label}</h3>
              <p>{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
