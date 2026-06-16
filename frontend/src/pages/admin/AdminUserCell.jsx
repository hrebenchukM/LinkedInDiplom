import { getAdminProfileLabel } from '../../features/admin/useAdminProfiles.js';

export default function AdminUserCell({ profiles, userId }) {
  const label = getAdminProfileLabel(profiles, userId);

  return (
    <div className="admin-user-cell">
      <span className="admin-user-cell-name">{label}</span>
      {userId && label !== userId && (
        <span className="admin-user-cell-id">{userId}</span>
      )}
    </div>
  );
}
