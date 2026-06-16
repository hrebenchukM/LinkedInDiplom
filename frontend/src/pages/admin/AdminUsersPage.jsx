import { useCallback, useContext, useEffect, useState } from 'react';
import AppContext from '../../features/appContext/AppContext';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import { DEFAULT_PAGE_SIZE } from '../../shared/api/config';
import { getErrorMessage } from '../../shared/lib/apiError';
import {
  assignUserRole,
  deleteUser,
  getAdminUsers,
  lockUser,
  removeUserRole,
  restoreUser,
  unlockUser,
} from '../../features/admin/adminApi';

function StatusBadge({ user }) {
  const { t } = useTranslation();

  if (user.isDeleted) {
    return <span className="admin-badge admin-badge-deleted">{t('admin.deleted', 'Deleted')}</span>;
  }
  if (user.isLocked) {
    return <span className="admin-badge admin-badge-locked">{t('admin.locked', 'Locked')}</span>;
  }
  return <span className="admin-badge admin-badge-active">{t('admin.active', 'Active')}</span>;
}

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const { account, user } = useContext(AppContext);
  const currentUserId = account?.id ?? account?.userId ?? user?.id;

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadUsers = useCallback(async ({ pageToLoad = 1, append = false, email = search } = {}) => {
    if (pageToLoad === 1) setLoading(true);
    else setLoadingMore(true);
    setError('');

    try {
      const response = await getAdminUsers({
        page: pageToLoad,
        pageSize: DEFAULT_PAGE_SIZE,
        email: email?.trim() || undefined,
      });

      setUsers((prev) => (append ? [...prev, ...response.items] : response.items));
      setPage(response.page);
      setHasNextPage(response.hasNextPage);
    } catch (err) {
      setError(getErrorMessage(err));
      if (!append) setUsers([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadUsers({ pageToLoad: 1, append: false });
    }, 300);
    return () => clearTimeout(timeout);
  }, [loadUsers]);

  const runAction = async (action) => {
    try {
      setError('');
      await action();
      await loadUsers({ pageToLoad: 1, append: false });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleLock = (userId) => {
    if (!window.confirm(t('admin.users.confirmLock', 'Lock this user?'))) return;
    runAction(() => lockUser(userId, {}));
  };

  const handleUnlock = (userId) => {
    runAction(() => unlockUser(userId));
  };

  const handleDelete = (userId) => {
    if (!window.confirm(t('admin.users.confirmDelete', 'Delete this user?'))) return;
    runAction(() => deleteUser(userId));
  };

  const handleRestore = (userId) => {
    runAction(() => restoreUser(userId));
  };

  const handleAssignRole = (userId, roleName) => {
    runAction(() => assignUserRole(userId, roleName));
  };

  const handleRemoveRole = (userId, roleName) => {
    if (!window.confirm(t('admin.users.confirmRemoveRole', 'Remove role "{role}" from user?', { role: roleName }))) return;
    runAction(() => removeUserRole(userId, roleName));
  };

  return (
    <>
      <h1 className="admin-page-title">{t('admin.users.title', 'Users')}</h1>
      <p className="admin-page-subtitle">
        {t('admin.users.subtitle', 'Manage accounts, roles, and lock status')}
      </p>

      <div className="admin-toolbar">
        <input
          type="search"
          className="admin-input"
          placeholder={t('admin.users.searchEmail', 'Search by email')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-loading">{t('common.loading', 'Loading...')}</div>}

      {!loading && users.length === 0 && (
        <div className="admin-empty">{t('admin.users.empty', 'No users found.')}</div>
      )}

      {!loading && users.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.users.email', 'Email')}</th>
                <th>{t('admin.users.username', 'Username')}</th>
                <th>{t('admin.users.roles', 'Roles')}</th>
                <th>{t('admin.users.status', 'Status')}</th>
                <th>{t('admin.users.created', 'Created')}</th>
                <th>{t('admin.users.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => {
                const isSelf = currentUserId && item.id === currentUserId;
                const hasAdminRole = item.roles?.includes('Admin');
                const hasUserRole = item.roles?.includes('User');

                return (
                  <tr key={item.id}>
                    <td>{item.email}</td>
                    <td>{item.userName}</td>
                    <td>{item.roles?.join(', ') || '—'}</td>
                    <td><StatusBadge user={item} /></td>
                    <td>{item.createdAtLabel}</td>
                    <td>
                      <div className="admin-actions">
                        {!isSelf && !item.isDeleted && !item.isLocked && (
                          <button type="button" className="admin-btn" onClick={() => handleLock(item.id)}>
                            {t('admin.lock', 'Lock')}
                          </button>
                        )}
                        {!item.isDeleted && item.isLocked && (
                          <button type="button" className="admin-btn" onClick={() => handleUnlock(item.id)}>
                            {t('admin.unlock', 'Unlock')}
                          </button>
                        )}
                        {!isSelf && !item.isDeleted && (
                          <button type="button" className="admin-btn admin-btn-danger" onClick={() => handleDelete(item.id)}>
                            {t('admin.delete', 'Delete')}
                          </button>
                        )}
                        {item.isDeleted && (
                          <button type="button" className="admin-btn" onClick={() => handleRestore(item.id)}>
                            {t('admin.restore', 'Restore')}
                          </button>
                        )}
                        {!hasAdminRole && (
                          <button type="button" className="admin-btn" onClick={() => handleAssignRole(item.id, 'Admin')}>
                            {t('admin.users.addAdmin', 'Add Admin')}
                          </button>
                        )}
                        {!hasUserRole && (
                          <button type="button" className="admin-btn" onClick={() => handleAssignRole(item.id, 'User')}>
                            {t('admin.users.addUser', 'Add User')}
                          </button>
                        )}
                        {hasAdminRole && !isSelf && (
                          <button type="button" className="admin-btn" onClick={() => handleRemoveRole(item.id, 'Admin')}>
                            {t('admin.users.removeAdmin', 'Remove Admin')}
                          </button>
                        )}
                        {hasUserRole && (
                          <button type="button" className="admin-btn" onClick={() => handleRemoveRole(item.id, 'User')}>
                            {t('admin.users.removeUser', 'Remove User')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && hasNextPage && (
        <button
          type="button"
          className="admin-btn admin-load-more"
          onClick={() => loadUsers({ pageToLoad: page + 1, append: true })}
          disabled={loadingMore}
        >
          {loadingMore ? t('common.loading', 'Loading...') : t('common.loadMore', 'Load more')}
        </button>
      )}
    </>
  );
}
