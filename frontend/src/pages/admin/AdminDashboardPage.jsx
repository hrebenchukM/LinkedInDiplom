import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import { getErrorMessage } from '../../shared/lib/apiError';
import { getAdminStatsOverview } from '../../features/admin/adminApi';

function StatSection({ title, cards }) {
  return (
    <section className="admin-stat-section">
      <h2 className="admin-stat-section-title">{title}</h2>
      <div className="admin-stats-grid">
        {cards.map((card) => (
          <div key={card.label} className="admin-stat-card">
            <h3>{card.label}</h3>
            <p>{card.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
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

  const quickLinks = useMemo(
    () => [
      { to: '/app/admin/users', label: t('admin.dashboard.manageUsers', 'Manage users') },
      { to: '/app/admin/content', label: t('admin.dashboard.moderatePosts', 'Moderate posts') },
      { to: '/app/admin/comments', label: t('admin.dashboard.moderateComments', 'Moderate comments') },
      { to: '/app/admin/jobs', label: t('admin.dashboard.manageVacancies', 'Manage vacancies') },
      { to: '/app/admin/events', label: t('admin.dashboard.manageEvents', 'Manage events') },
    ],
    [t],
  );

  const sections = useMemo(
    () =>
      stats
        ? [
          {
            title: t('admin.stats.usersSection', 'Users'),
            cards: [
              { label: t('admin.total', 'Total'), value: stats.totalUsers },
              { label: t('admin.active', 'Active'), value: stats.activeUsers },
              { label: t('admin.deleted', 'Deleted'), value: stats.deletedUsers },
            ],
          },
          {
            title: t('admin.stats.contentSection', 'Content'),
            cards: [
              { label: t('admin.stats.posts', 'Posts (active)'), value: stats.totalPosts },
              { label: t('admin.active', 'Active'), value: stats.activePosts },
              { label: t('admin.stats.postsDeleted', 'Posts deleted'), value: stats.deletedPosts },
            ],
          },
          {
            title: t('admin.stats.jobsSection', 'Jobs'),
            cards: [
              { label: t('admin.stats.vacancies', 'Vacancies (active)'), value: stats.totalVacancies },
              { label: t('admin.active', 'Active'), value: stats.activeVacancies },
              { label: t('admin.stats.vacanciesDeleted', 'Vacancies deleted'), value: stats.deletedVacancies },
            ],
          },
          {
            title: t('admin.stats.eventsSection', 'Events'),
            cards: [
              { label: t('admin.stats.events', 'Events (active)'), value: stats.totalEvents },
              { label: t('admin.stats.eventsUpcoming', 'Upcoming events'), value: stats.upcomingEvents },
              { label: t('admin.deleted', 'Deleted'), value: stats.deletedEvents },
            ],
          },
        ]
        : [],
    [stats, t],
  );

  return (
    <>
      <h1 className="admin-page-title">{t('admin.dashboard.title', 'Dashboard')}</h1>
      <p className="admin-page-subtitle">
        {t('admin.dashboard.subtitle', 'Overview of platform statistics and moderation tools')}
      </p>

      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-loading">{t('common.loading', 'Loading...')}</div>}

      {!loading && stats && (
        <>
          <div className="admin-dashboard-sections">
            {sections.map((section) => (
              <StatSection key={section.title} title={section.title} cards={section.cards} />
            ))}
          </div>

          <section className="admin-quick-links">
            <h2 className="admin-stat-section-title">
              {t('admin.dashboard.quickActions', 'Quick actions')}
            </h2>
            <div className="admin-quick-links-grid">
              {quickLinks.map((link) => (
                <Link key={link.to} to={link.to} className="admin-quick-link">
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
