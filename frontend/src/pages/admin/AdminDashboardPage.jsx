import { useCallback, useEffect, useState } from "react";
import * as adminApi from "../../features/admin/adminApi";
import { LoadStatus } from "../../shared/ui/LoadStatus";
import { withLoadState } from "../../shared/lib/asyncLoad";
import { useUiSettings } from "../../app/providers/AppProviders";

function StatCard({ label, value }) {
  return (
    <article className="admin-stat-card">
      <div className="admin-stat-card__label">{label}</div>
      <div className="admin-stat-card__value">{value}</div>
    </article>
  );
}

export function AdminDashboardPage() {
  const { t } = useUiSettings();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const reload = useCallback(async () => {
    await withLoadState({ setIsLoading, setLoadError }, async () => {
      setStats(await adminApi.fetchStatsOverview());
    }, t("admin.dashboard.loadFailed", "Could not load admin stats."));
  }, [t]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <section>
      <div className="admin-page__head">
        <h1 className="admin-page__title">{t("admin.dashboard.title", "Dashboard")}</h1>
      </div>
      <LoadStatus isLoading={isLoading} loadError={loadError} onRetry={reload} t={t} />
      {stats ? (
        <div className="admin-stats">
          <StatCard label={t("admin.stats.users", "Users (active)")} value={stats.activeUsers} />
          <StatCard label={t("admin.stats.usersDeleted", "Users deleted")} value={stats.deletedUsers} />
          <StatCard label={t("admin.stats.posts", "Posts (active)")} value={stats.activePosts} />
          <StatCard label={t("admin.stats.postsDeleted", "Posts deleted")} value={stats.deletedPosts} />
          <StatCard label={t("admin.stats.vacancies", "Vacancies (active)")} value={stats.activeVacancies} />
          <StatCard
            label={t("admin.stats.vacanciesDeleted", "Vacancies deleted")}
            value={stats.deletedVacancies}
          />
          <StatCard label={t("admin.stats.events", "Events (active)")} value={stats.activeEvents} />
          <StatCard label={t("admin.stats.eventsUpcoming", "Upcoming events")} value={stats.upcomingEvents} />
          <StatCard
            label={t("admin.stats.recommendedQueries", "Recommended queries")}
            value={stats.totalRecommendedJobQueries}
          />
        </div>
      ) : null}
    </section>
  );
}
