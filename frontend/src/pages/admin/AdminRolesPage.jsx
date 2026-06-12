import { useCallback, useEffect, useState } from "react";
import * as adminApi from "../../features/admin/adminApi";
import { LoadStatus } from "../../shared/ui/LoadStatus";
import { withLoadState } from "../../shared/lib/asyncLoad";
import { useUiSettings } from "../../app/providers/AppProviders";

export function AdminRolesPage() {
  const { t } = useUiSettings();
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const reload = useCallback(async () => {
    await withLoadState({ setIsLoading, setLoadError }, async () => {
      setRoles(await adminApi.fetchAdminRoles());
    }, t("admin.roles.loadFailed", "Could not load roles."));
  }, [t]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <section>
      <div className="admin-page__head">
        <h1 className="admin-page__title">{t("admin.roles.title", "System roles")}</h1>
      </div>

      <LoadStatus isLoading={isLoading} loadError={loadError} onRetry={reload} t={t} />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("admin.roles.name", "Role name")}</th>
              <th>{t("admin.roles.id", "Role ID")}</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={2}>{t("admin.roles.empty", "No roles found.")}</td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id}>
                  <td>{role.name}</td>
                  <td><code>{role.id}</code></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="muted" style={{ marginTop: 16 }}>
        {t(
          "admin.roles.hint",
          "Assign or remove roles for a specific user on the Users page (detail drawer).",
        )}
      </p>
    </section>
  );
}
