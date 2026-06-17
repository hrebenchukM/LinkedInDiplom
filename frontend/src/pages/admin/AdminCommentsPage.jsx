import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import { DEFAULT_PAGE_SIZE } from '../../shared/api/config';
import { getErrorMessage } from '../../shared/lib/apiError';
import {
  deleteAdminComment,
  getAdminComments,
  restoreAdminComment,
} from '../../features/admin/adminApi';
import { useAdminProfiles } from '../../features/admin/useAdminProfiles';
import AdminUserCell from './AdminUserCell';

export default function AdminCommentsPage() {
  const { t } = useTranslation();
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

  const authorIds = useMemo(() => items.map((item) => item.authorUserId), [items]);
  const profiles = useAdminProfiles(authorIds);

  useEffect(() => {
    loadItems({ pageToLoad: 1, append: false });
  }, [loadItems]);

  const handleDelete = async (commentId) => {
    if (!window.confirm(t('admin.comments.confirmDelete', 'Delete this comment?'))) return;
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
      <h1 className="admin-page-title">{t('admin.comments.title', 'Comments moderation')}</h1>
      <p className="admin-page-subtitle">{t('admin.nav.comments', 'Comments')}</p>

      <div className="admin-toolbar">
        <select className="admin-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">{t('admin.comments.all', 'All comments')}</option>
          <option value="active">{t('admin.comments.active', 'Active only')}</option>
          <option value="deleted">{t('admin.comments.deletedOnly', 'Deleted only')}</option>
        </select>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-loading">{t('common.loading', 'Loading...')}</div>}
      {!loading && items.length === 0 && (
        <div className="admin-empty">{t('admin.comments.empty', 'No comments found.')}</div>
      )}

      {!loading && items.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.comments.post', 'Post')}</th>
                <th>{t('admin.comments.author', 'Author')}</th>
                <th>{t('admin.comments.text', 'Comment')}</th>
                <th>{t('admin.users.status', 'Status')}</th>
                <th>{t('admin.content.created', 'Created')}</th>
                <th>{t('admin.users.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="admin-id-cell">{item.postId}</td>
                  <td><AdminUserCell profiles={profiles} userId={item.authorUserId} /></td>
                  <td>{item.contentPreview}</td>
                  <td>
                    <span className={`admin-badge ${item.isDeleted ? 'admin-badge-deleted' : 'admin-badge-active'}`}>
                      {item.isDeleted ? t('admin.deleted', 'Deleted') : t('admin.active', 'Active')}
                    </span>
                  </td>
                  <td>{item.createdAtLabel}</td>
                  <td>
                    <div className="admin-actions">
                      {!item.isDeleted ? (
                        <button type="button" className="admin-btn admin-btn-danger" onClick={() => handleDelete(item.id)}>
                          {t('admin.delete', 'Delete')}
                        </button>
                      ) : (
                        <button type="button" className="admin-btn" onClick={() => handleRestore(item.id)}>
                          {t('admin.restore', 'Restore')}
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
          {loadingMore ? t('common.loading', 'Loading...') : t('common.loadMore', 'Load more')}
        </button>
      )}
    </>
  );
}
