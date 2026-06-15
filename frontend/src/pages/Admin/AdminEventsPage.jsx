import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '../../shared/api/config';
import { getErrorMessage } from '../../shared/lib/apiError';
import {
  deleteAdminEvent,
  getAdminEvents,
  restoreAdminEvent,
} from '../../features/admin/adminApi';

export default function AdminEventsPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadItems = useCallback(async ({
    pageToLoad = 1,
    append = false,
    deletedFilter = filter,
    searchValue = search,
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
      const response = await getAdminEvents({
        page: pageToLoad,
        pageSize: DEFAULT_PAGE_SIZE,
        isDeleted,
        includeDeleted: deletedFilter === 'all',
        query: searchValue?.trim() || undefined,
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
  }, [filter, search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadItems({ pageToLoad: 1, append: false });
    }, 300);
    return () => clearTimeout(timeout);
  }, [filter, search]);

  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await deleteAdminEvent(eventId);
      await loadItems({ pageToLoad: 1, append: false });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleRestore = async (eventId) => {
    try {
      await restoreAdminEvent(eventId);
      await loadItems({ pageToLoad: 1, append: false });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <>
      <h1 className="admin-page-title">Events</h1>
      <p className="admin-page-subtitle">Moderate events</p>

      <div className="admin-toolbar">
        <select className="admin-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="deleted">Deleted</option>
        </select>
        <input
          type="search"
          className="admin-input"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-loading">Loading events...</div>}
      {!loading && items.length === 0 && <div className="admin-empty">No events found</div>}

      {!loading && items.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Organizer</th>
                <th>Start</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.organizerUserId}</td>
                  <td>{item.startAtLabel}</td>
                  <td>{item.location || (item.isOnline ? 'Online' : '—')}</td>
                  <td>
                    <span className={`admin-badge ${item.isDeleted ? 'admin-badge-deleted' : 'admin-badge-active'}`}>
                      {item.status}
                    </span>
                  </td>
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
