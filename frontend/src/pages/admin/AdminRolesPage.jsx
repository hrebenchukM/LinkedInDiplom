import { useEffect, useState } from 'react';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import { getErrorMessage } from '../../shared/lib/apiError';
import { getAdminRoles } from '../../features/admin/adminApi';

export default function AdminRolesPage() {
  const { t } = useTranslation();
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
      <h1 className="admin-page-title">{t('admin.roles.title', 'System roles')}</h1>
      <p className="admin-page-subtitle">{t('admin.roles.hint', 'Assign or remove roles for a specific user on the Users page (detail drawer).')}</p>

      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-loading">{t('common.loading', 'Loading...')}</div>}

      {!loading && roles.length === 0 && (
        <div className="admin-empty">{t('admin.roles.empty', 'No roles found.')}</div>
      )}

      {!loading && roles.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.roles.name', 'Role name')}</th>
                <th>{t('admin.roles.id', 'Role ID')}</th>
                <th>{t('admin.roles.description', 'Description')}</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id ?? role.name}>
                  <td>{role.name}</td>
                  <td>{role.id}</td>
                  <td>
                    {role.name === 'Admin'
                      ? t('admin.roles.adminDesc', 'Full administrative access')
                      : role.name === 'User'
                        ? t('admin.roles.userDesc', 'Standard user access')
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
