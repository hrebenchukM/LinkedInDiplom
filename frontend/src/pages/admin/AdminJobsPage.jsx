import { useCallback, useEffect, useState } from "react";
import * as adminApi from "../../features/admin/adminApi";
import { LoadStatus } from "../../shared/ui/LoadStatus";
import { withLoadState } from "../../shared/lib/asyncLoad";
import { useUiSettings } from "../../app/providers/AppProviders";
import { showApiFeedback } from "../../shared/lib/apiFeedback";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

export function AdminJobsPage() {
  const { t } = useUiSettings();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], totalCount: 0, hasNextPage: false });
  const [queries, setQueries] = useState([]);
  const [newQuery, setNewQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState("");

  const reload = useCallback(async () => {
    await withLoadState({ setIsLoading, setLoadError }, async () => {
      const [vacancies, recommended] = await Promise.all([
        adminApi.fetchAdminVacancies({ page, pageSize: 20, search: search.trim(), includeDeleted: true }),
        adminApi.fetchRecommendedQueries(),
      ]);
      setResult(vacancies);
      setQueries(recommended);
    }, t("admin.jobs.loadFailed", "Could not load jobs."));
  }, [page, search, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function runVacancyAction(vacancyId, action) {
    setBusyId(vacancyId);
    try {
      await action();
      showApiFeedback(t("admin.jobs.updated", "Vacancy updated."), { variant: "success" });
      await reload();
    } catch (error) {
      showApiFeedback(String(error?.message || t("admin.jobs.actionFailed", "Action failed.")), {
        variant: "error",
      });
    } finally {
      setBusyId("");
    }
  }

  async function addQuery(event) {
    event.preventDefault();
    const query = newQuery.trim();
    if (!query) return;
    setBusyId("new-query");
    try {
      await adminApi.createRecommendedQuery(query);
      setNewQuery("");
      showApiFeedback(t("admin.jobs.queryAdded", "Recommended query added."), { variant: "success" });
      await reload();
    } catch (error) {
      showApiFeedback(String(error?.message || t("admin.jobs.queryFailed", "Could not add query.")), {
        variant: "error",
      });
    } finally {
      setBusyId("");
    }
  }

  return (
    <section>
      <div className="admin-page__head">
        <h1 className="admin-page__title">{t("admin.jobs.title", "Jobs moderation")}</h1>
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder={t("admin.jobs.search", "Search vacancies")}
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
        />
      </div>

      <LoadStatus isLoading={isLoading} loadError={loadError} onRetry={reload} t={t} />

      <h2>{t("admin.jobs.vacancies", "Vacancies")}</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("admin.jobs.titleCol", "Title")}</th>
              <th>{t("admin.jobs.location", "Location")}</th>
              <th>{t("admin.jobs.postedBy", "Posted by")}</th>
              <th>{t("admin.content.created", "Created")}</th>
              <th>{t("admin.users.actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={5}>{t("admin.jobs.empty", "No vacancies found.")}</td>
              </tr>
            ) : (
              result.items.map((vacancy) => (
                <tr key={vacancy.id}>
                  <td>
                    <div>{vacancy.title}</div>
                    {vacancy.isDeleted ? (
                      <span className="admin-badge admin-badge--danger">{t("admin.deleted", "Deleted")}</span>
                    ) : null}
                  </td>
                  <td>{vacancy.location || "—"}</td>
                  <td>{vacancy.postedBy || "—"}</td>
                  <td>{formatDate(vacancy.createdAt)}</td>
                  <td>
                    <div className="admin-actions">
                      {vacancy.isDeleted ? (
                        <button
                          type="button"
                          className="admin-btn"
                          disabled={busyId === vacancy.id}
                          onClick={() => runVacancyAction(vacancy.id, () => adminApi.restoreVacancy(vacancy.id))}
                        >
                          {t("admin.restore", "Restore")}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger"
                          disabled={busyId === vacancy.id}
                          onClick={() => runVacancyAction(vacancy.id, () => adminApi.deleteVacancy(vacancy.id))}
                        >
                          {t("admin.delete", "Delete")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        <button
          type="button"
          className="admin-btn"
          disabled={page <= 1 || isLoading}
          onClick={() => setPage((value) => Math.max(1, value - 1))}
        >
          {t("common.prev", "Previous")}
        </button>
        <span>
          {t("admin.page", "Page")} {page} · {result.totalCount} {t("admin.total", "total")}
        </span>
        <button
          type="button"
          className="admin-btn"
          disabled={!result.hasNextPage || isLoading}
          onClick={() => setPage((value) => value + 1)}
        >
          {t("common.next", "Next")}
        </button>
      </div>

      <h2 style={{ marginTop: 28 }}>{t("admin.jobs.recommended", "Recommended queries")}</h2>
      <form className="admin-toolbar" onSubmit={addQuery}>
        <input
          type="text"
          placeholder={t("admin.jobs.newQuery", "New search query")}
          value={newQuery}
          onChange={(event) => setNewQuery(event.target.value)}
        />
        <button type="submit" className="admin-btn admin-btn--primary" disabled={busyId === "new-query"}>
          {t("admin.add", "Add")}
        </button>
      </form>
      <ul>
        {queries.length === 0 ? (
          <li>{t("admin.jobs.noQueries", "No recommended queries.")}</li>
        ) : (
          queries.map((item) => (
            <li key={item.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <span>{item.query}</span>
              <button
                type="button"
                className="admin-btn admin-btn--danger"
                disabled={busyId === item.id}
                onClick={() =>
                  runVacancyAction(item.id, () => adminApi.deleteRecommendedQuery(item.id))
                }
              >
                {t("admin.delete", "Delete")}
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
