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

export function AdminContentPage() {
  const { t } = useUiSettings();
  const [search, setSearch] = useState("");
  const [deletedFilter, setDeletedFilter] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], totalCount: 0, hasNextPage: false });
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState("");

  const reload = useCallback(async () => {
    await withLoadState({ setIsLoading, setLoadError }, async () => {
      const data = await adminApi.fetchAdminPosts({
        page,
        pageSize: 20,
        search: search.trim(),
        isDeleted: deletedFilter === "" ? undefined : deletedFilter === "true",
        includeDeleted: true,
      });
      setResult(data);
    }, t("admin.content.loadFailed", "Could not load posts."));
  }, [deletedFilter, page, search, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function runAction(postId, action) {
    setBusyId(postId);
    try {
      await action();
      showApiFeedback(t("admin.content.updated", "Post updated."), { variant: "success" });
      await reload();
    } catch (error) {
      showApiFeedback(String(error?.message || t("admin.content.actionFailed", "Action failed.")), {
        variant: "error",
      });
    } finally {
      setBusyId("");
    }
  }

  return (
    <section>
      <div className="admin-page__head">
        <h1 className="admin-page__title">{t("admin.content.title", "Content moderation")}</h1>
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder={t("admin.content.search", "Search posts")}
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
        />
        <select
          value={deletedFilter}
          onChange={(event) => {
            setPage(1);
            setDeletedFilter(event.target.value);
          }}
        >
          <option value="">{t("admin.content.all", "All posts")}</option>
          <option value="false">{t("admin.content.active", "Active only")}</option>
          <option value="true">{t("admin.content.deletedOnly", "Deleted only")}</option>
        </select>
      </div>

      <LoadStatus isLoading={isLoading} loadError={loadError} onRetry={reload} t={t} />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("admin.content.text", "Content")}</th>
              <th>{t("admin.content.author", "Author")}</th>
              <th>{t("admin.content.stats", "Stats")}</th>
              <th>{t("admin.content.created", "Created")}</th>
              <th>{t("admin.users.actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={5}>{t("admin.content.empty", "No posts found.")}</td>
              </tr>
            ) : (
              result.items.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div>{post.content.slice(0, 140)}{post.content.length > 140 ? "…" : ""}</div>
                    {post.isDeleted ? (
                      <span className="admin-badge admin-badge--danger">{t("admin.deleted", "Deleted")}</span>
                    ) : null}
                  </td>
                  <td>{post.userId || "—"}</td>
                  <td>
                    {post.reactionCount} / {post.commentCount}
                  </td>
                  <td>{formatDate(post.createdAt)}</td>
                  <td>
                    <div className="admin-actions">
                      {post.isDeleted ? (
                        <button
                          type="button"
                          className="admin-btn"
                          disabled={busyId === post.id}
                          onClick={() => runAction(post.id, () => adminApi.restorePost(post.id))}
                        >
                          {t("admin.restore", "Restore")}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger"
                          disabled={busyId === post.id}
                          onClick={() => runAction(post.id, () => adminApi.deletePost(post.id))}
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
    </section>
  );
}
