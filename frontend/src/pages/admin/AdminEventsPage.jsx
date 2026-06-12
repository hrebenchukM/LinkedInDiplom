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

export function AdminEventsPage() {
  const { t } = useUiSettings();
  const [query, setQuery] = useState("");
  const [deletedFilter, setDeletedFilter] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], totalCount: 0, hasNextPage: false });
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState("");

  const reload = useCallback(async () => {
    await withLoadState({ setIsLoading, setLoadError }, async () => {
      const data = await adminApi.fetchAdminEvents({
        page,
        pageSize: 20,
        query: query.trim(),
        isDeleted: deletedFilter === "" ? undefined : deletedFilter === "true",
        includeDeleted: true,
      });
      setResult(data);
    }, t("admin.events.loadFailed", "Could not load events."));
  }, [deletedFilter, page, query, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function runAction(eventId, action) {
    setBusyId(eventId);
    try {
      await action();
      showApiFeedback(t("admin.events.updated", "Event updated."), { variant: "success" });
      await reload();
    } catch (error) {
      showApiFeedback(String(error?.message || t("admin.events.actionFailed", "Action failed.")), {
        variant: "error",
      });
    } finally {
      setBusyId("");
    }
  }

  return (
    <section>
      <div className="admin-page__head">
        <h1 className="admin-page__title">{t("admin.events.title", "Events moderation")}</h1>
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder={t("admin.events.search", "Search events")}
          value={query}
          onChange={(event) => {
            setPage(1);
            setQuery(event.target.value);
          }}
        />
        <select
          value={deletedFilter}
          onChange={(event) => {
            setPage(1);
            setDeletedFilter(event.target.value);
          }}
        >
          <option value="">{t("admin.events.all", "All events")}</option>
          <option value="false">{t("admin.events.active", "Active only")}</option>
          <option value="true">{t("admin.events.deletedOnly", "Deleted only")}</option>
        </select>
      </div>

      <LoadStatus isLoading={isLoading} loadError={loadError} onRetry={reload} t={t} />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("admin.events.titleCol", "Title")}</th>
              <th>{t("admin.events.organizer", "Organizer")}</th>
              <th>{t("admin.events.start", "Start")}</th>
              <th>{t("admin.events.location", "Location")}</th>
              <th>{t("admin.users.actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={5}>{t("admin.events.empty", "No events found.")}</td>
              </tr>
            ) : (
              result.items.map((event) => (
                <tr key={event.id}>
                  <td>
                    <div>{event.title}</div>
                    {event.isDeleted ? (
                      <span className="admin-badge admin-badge--danger">{t("admin.deleted", "Deleted")}</span>
                    ) : null}
                  </td>
                  <td>{event.organizerUserId || "—"}</td>
                  <td>{formatDate(event.startAt)}</td>
                  <td>{event.isOnline ? t("admin.events.online", "Online") : event.location || "—"}</td>
                  <td>
                    <div className="admin-actions">
                      {event.isDeleted ? (
                        <button
                          type="button"
                          className="admin-btn"
                          disabled={busyId === event.id}
                          onClick={() => runAction(event.id, () => adminApi.restoreEvent(event.id))}
                        >
                          {t("admin.restore", "Restore")}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger"
                          disabled={busyId === event.id}
                          onClick={() => runAction(event.id, () => adminApi.deleteEvent(event.id))}
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
        <button type="button" className="admin-btn" disabled={page <= 1 || isLoading} onClick={() => setPage((v) => Math.max(1, v - 1))}>
          {t("common.prev", "Previous")}
        </button>
        <span>
          {t("admin.page", "Page")} {page} · {result.totalCount} {t("admin.total", "total")}
        </span>
        <button type="button" className="admin-btn" disabled={!result.hasNextPage || isLoading} onClick={() => setPage((v) => v + 1)}>
          {t("common.next", "Next")}
        </button>
      </div>
    </section>
  );
}
