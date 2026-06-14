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

export function AdminCommentsPage() {
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
      const data = await adminApi.fetchAdminComments({
        page,
        pageSize: 20,
        query: query.trim(),
        isDeleted: deletedFilter === "" ? undefined : deletedFilter === "true",
        includeDeleted: true,
      });
      setResult(data);
    }, t("admin.comments.loadFailed", "Could not load comments."));
  }, [deletedFilter, page, query, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function runAction(commentId, action) {
    setBusyId(commentId);
    try {
      await action();
      showApiFeedback(t("admin.comments.updated", "Comment updated."), { variant: "success" });
      await reload();
    } catch (error) {
      showApiFeedback(String(error?.message || t("admin.comments.actionFailed", "Action failed.")), {
        variant: "error",
      });
    } finally {
      setBusyId("");
    }
  }

  return (
    <section>
      <div className="admin-page__head">
        <h1 className="admin-page__title">{t("admin.comments.title", "Comments moderation")}</h1>
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder={t("admin.comments.search", "Search comments")}
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
          <option value="">{t("admin.comments.all", "All comments")}</option>
          <option value="false">{t("admin.comments.active", "Active only")}</option>
          <option value="true">{t("admin.comments.deletedOnly", "Deleted only")}</option>
        </select>
      </div>

      <LoadStatus isLoading={isLoading} loadError={loadError} onRetry={reload} t={t} />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("admin.comments.text", "Comment")}</th>
              <th>{t("admin.comments.author", "Author")}</th>
              <th>{t("admin.comments.post", "Post")}</th>
              <th>{t("admin.content.created", "Created")}</th>
              <th>{t("admin.users.actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={5}>{t("admin.comments.empty", "No comments found.")}</td>
              </tr>
            ) : (
              result.items.map((comment) => (
                <tr key={comment.id}>
                  <td>
                    <div>{comment.content.slice(0, 120)}{comment.content.length > 120 ? "…" : ""}</div>
                    {comment.isDeleted ? (
                      <span className="admin-badge admin-badge--danger">{t("admin.deleted", "Deleted")}</span>
                    ) : null}
                  </td>
                  <td>{comment.authorUserId || "—"}</td>
                  <td>{comment.postId || "—"}</td>
                  <td>{formatDate(comment.createdAt)}</td>
                  <td>
                    <div className="admin-actions">
                      {comment.isDeleted ? (
                        <button
                          type="button"
                          className="admin-btn"
                          disabled={busyId === comment.id}
                          onClick={() => runAction(comment.id, () => adminApi.restoreComment(comment.id))}
                        >
                          {t("admin.restore", "Restore")}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger"
                          disabled={busyId === comment.id}
                          onClick={() => runAction(comment.id, () => adminApi.deleteComment(comment.id))}
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
