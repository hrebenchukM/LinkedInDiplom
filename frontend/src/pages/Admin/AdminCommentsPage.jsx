import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '../../shared/api/config';
import { getErrorMessage } from '../../shared/lib/apiError';
import {
  deleteAdminComment,
  getAdminComments,
  restoreAdminComment,
} from '../../features/admin/adminApi';

export default function AdminCommentsPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadItems = useCallback(async ({
    pageToLoad = 1,
    append = false,
    deletedFilter = filter,
  } = {}) => {
    if (pageToLoad === 1) setLoading(true);
    else setLoadingMore(true);
    setError('');

    const isDeleted = deletedFilter === 'deleted'
      ? true
      : deletedFilter === 'active'
        ? false
        : undefined;

    try {
      const response = await getAdminComments({
        page: pageToLoad,
        pageSize: DEFAULT_PAGE_SIZE,
        isDeleted,
        includeDeleted: deletedFilter === 'all',
      });

      setItems((prev) => (append ? [...prev, ...response.items] : response.items));
      setPage(response.page);
      setHasNextPage(response.hasNextPage);
    } catch (err) {
      setError(getErrorMessage(err));
      if (!append) setItems([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter]);

  useEffect(() => {
    loadItems({ pageToLoad: 1, append: false });
  }, [filter]);

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteAdminComment(commentId);
      await loadItems({ pageToLoad: 1, append: false });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleRestore = async (commentId) => {
    try {
      await restoreAdminComment(commentId);
      await loadItems({ pageToLoad: 1, append: false });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <>
      <h1 className="admin-page-title">Comments</h1>
      <p className="admin-page-subtitle">Moderate comments</p>

      <div className="admin-toolbar">
        <select className="admin-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-loading">Loading comments...</div>}
      {!loading && items.length === 0 && <div className="admin-empty">No comments found</div>}

      {!loading && items.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Post ID</th>
                <th>Author</th>
                <th>Content</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.postId}</td>
                  <td>{item.authorUserId}</td>
                  <td>{item.contentPreview}</td>
                  <td>
                    <span className={`admin-badge ${item.isDeleted ? 'admin-badge-deleted' : 'admin-badge-active'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.createdAtLabel}</td>
                  <td>
                    <div className="admin-actions">
                      {!item.isDeleted ? (
                        <button type="button" className="admin-btn admin-btn-danger" onClick={() => handleDelete(item.id)}>
                          Delete
                        </button>
                      ) : (
                        <button type="button" className="admin-btn" onClick={() => handleRestore(item.id)}>
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && hasNextPage && (
        <button
          type="button"
          className="admin-btn admin-load-more"
          onClick={() => loadItems({ pageToLoad: page + 1, append: true })}
          disabled={loadingMore}
        >
          {loadingMore ? 'Loading...' : 'Load more'}
        </button>
      )}
    </>
  );
}
