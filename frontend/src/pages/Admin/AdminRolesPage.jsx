import { useEffect, useState } from 'react';
import { getErrorMessage } from '../../shared/lib/apiError';
import { getAdminRoles } from '../../features/admin/adminApi';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getAdminRoles()
      .then((items) => {
        if (!cancelled) setRoles(items);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <h1 className="admin-page-title">Roles</h1>
      <p className="admin-page-subtitle">Available platform roles</p>

      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-loading">Loading roles...</div>}

      {!loading && roles.length === 0 && (
        <div className="admin-empty">No roles found</div>
      )}

      {!loading && roles.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id ?? role.name}>
                  <td>{role.name}</td>
                  <td>{role.id}</td>
                  <td>
                    {role.name === 'Admin'
                      ? 'Full administrative access'
                      : role.name === 'User'
                        ? 'Standard user access'
                        : role.description || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
