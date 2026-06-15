import { useCallback, useContext, useEffect, useState } from 'react';
import AppContext from '../../features/appContext/AppContext';
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
  if (user.isDeleted) {
    return <span className="admin-badge admin-badge-deleted">Deleted</span>;
  }
  if (user.isLocked) {
    return <span className="admin-badge admin-badge-locked">Locked</span>;
  }
  return <span className="admin-badge admin-badge-active">Active</span>;
}

export default function AdminUsersPage() {
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
        includeDeleted: true,
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
  }, [search]);

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
    if (!window.confirm('Lock this user?')) return;
    runAction(() => lockUser(userId, {}));
  };

  const handleUnlock = (userId) => {
    runAction(() => unlockUser(userId));
  };

  const handleDelete = (userId) => {
    if (!window.confirm('Delete this user?')) return;
    runAction(() => deleteUser(userId));
  };

  const handleRestore = (userId) => {
    runAction(() => restoreUser(userId));
  };

  const handleAssignRole = (userId, roleName) => {
    runAction(() => assignUserRole(userId, roleName));
  };

  const handleRemoveRole = (userId, roleName) => {
    if (!window.confirm(`Remove role "${roleName}" from user?`)) return;
    runAction(() => removeUserRole(userId, roleName));
  };

  return (
    <>
      <h1 className="admin-page-title">Users</h1>
      <p className="admin-page-subtitle">Manage accounts, roles, and lock status</p>

      <div className="admin-toolbar">
        <input
          type="search"
          className="admin-input"
          placeholder="Search by email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-loading">Loading users...</div>}

      {!loading && users.length === 0 && (
        <div className="admin-empty">No users found</div>
      )}

      {!loading && users.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Username</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
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
                            Lock
                          </button>
                        )}
                        {!item.isDeleted && item.isLocked && (
                          <button type="button" className="admin-btn" onClick={() => handleUnlock(item.id)}>
                            Unlock
                          </button>
                        )}
                        {!isSelf && !item.isDeleted && (
                          <button type="button" className="admin-btn admin-btn-danger" onClick={() => handleDelete(item.id)}>
                            Delete
                          </button>
                        )}
                        {item.isDeleted && (
                          <button type="button" className="admin-btn" onClick={() => handleRestore(item.id)}>
                            Restore
                          </button>
                        )}
                        {!hasAdminRole && (
                          <button type="button" className="admin-btn" onClick={() => handleAssignRole(item.id, 'Admin')}>
                            Add Admin
                          </button>
                        )}
                        {!hasUserRole && (
                          <button type="button" className="admin-btn" onClick={() => handleAssignRole(item.id, 'User')}>
                            Add User
                          </button>
                        )}
                        {hasAdminRole && !isSelf && (
                          <button type="button" className="admin-btn" onClick={() => handleRemoveRole(item.id, 'Admin')}>
                            Remove Admin
                          </button>
                        )}
                        {hasUserRole && (
                          <button type="button" className="admin-btn" onClick={() => handleRemoveRole(item.id, 'User')}>
                            Remove User
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
          {loadingMore ? 'Loading...' : 'Load more'}
        </button>
      )}
    </>
  );
}
