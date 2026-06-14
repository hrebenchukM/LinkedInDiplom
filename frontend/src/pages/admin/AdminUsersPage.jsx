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

function AdminCreateUserDrawer({ onClose, onCreated, t }) {
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "", roleName: "User" });
  const [roles, setRoles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    adminApi.fetchAdminRoles().then(setRoles).catch(() => setRoles([]));
  }, []);

  const roleOptions = roles.length > 0 ? roles : [{ id: "user", name: "User" }, { id: "admin", name: "Admin" }];

  async function handleSubmit(event) {
    event.preventDefault();
    const email = form.email.trim();
    const password = form.password;
    if (!email || !password) {
      setFormError(t("admin.users.createRequired", "Email and password are required."));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError(t("auth.error.email", "Enter a valid email."));
      return;
    }
    if (password.length < 6) {
      setFormError(t("auth.error.passwordMin", "Password must be at least 6 characters."));
      return;
    }
    if (password !== form.confirmPassword) {
      setFormError(t("auth.error.passwordMatch", "Passwords do not match."));
      return;
    }

    setBusy(true);
    setFormError("");
    try {
      const created = await adminApi.createUser({ email, password, roleName: form.roleName });
      showApiFeedback(t("admin.users.createdSuccess", "User created."), { variant: "success" });
      onCreated?.(created);
      onClose();
    } catch (error) {
      setFormError(String(error?.message || t("admin.users.createFailed", "Could not create user.")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="admin-drawer__backdrop" aria-label={t("admin.close", "Close")} onClick={onClose} />
      <aside className="admin-drawer" role="dialog" aria-labelledby="admin-create-user-title">
        <div className="admin-drawer__head">
          <h2 id="admin-create-user-title">{t("admin.users.createTitle", "Add user")}</h2>
          <button type="button" className="admin-btn" onClick={onClose}>
            {t("admin.close", "Close")}
          </button>
        </div>
        <div className="admin-drawer__body">
          <p className="muted admin-form__hint">{t("admin.users.createHint", "Creates an account via the registration API. You stay signed in as admin.")}</p>
          <form className="admin-form" onSubmit={handleSubmit}>
            <label>
              {t("admin.users.email", "Email")}
              <input
                type="email"
                autoComplete="off"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="user@example.com"
                disabled={busy}
              />
            </label>
            <label>
              {t("auth.field.password", "Password")}
              <input
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                disabled={busy}
              />
            </label>
            <label>
              {t("auth.field.confirmPassword", "Confirm password")}
              <input
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                disabled={busy}
              />
            </label>
            <label>
              {t("admin.users.roles", "Roles")}
              <select
                value={form.roleName}
                onChange={(event) => setForm((prev) => ({ ...prev, roleName: event.target.value }))}
                disabled={busy}
              >
                {roleOptions.map((role) => (
                  <option key={role.id || role.name} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
            {formError ? (
              <p className="admin-form__error" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="admin-actions">
              <button type="button" className="admin-btn" onClick={onClose} disabled={busy}>
                {t("common.cancel", "Cancel")}
              </button>
              <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
                {busy ? t("admin.users.creating", "Creating…") : t("admin.users.createSubmit", "Create user")}
              </button>
            </div>
          </form>
        </div>
      </aside>
    </>
  );
}

function AdminUserDrawer({ userId, onClose, onUpdated, t }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [roleToAdd, setRoleToAdd] = useState("User");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (!userId) return;
    await withLoadState({ setIsLoading, setLoadError }, async () => {
      const [userDto, userRoles, allRoles] = await Promise.all([
        adminApi.fetchAdminUser(userId),
        adminApi.fetchUserRoles(userId),
        adminApi.fetchAdminRoles(),
      ]);
      setUser(userDto);
      setRoles(userRoles);
      setAvailableRoles(allRoles);
      setRoleToAdd((prev) => {
        const next = allRoles.find((r) => !userRoles.includes(r.name));
        return next?.name || prev;
      });
    }, t("admin.users.detailFailed", "Could not load user details."));
  }, [userId, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function runAction(action, successMessage) {
    setBusy(true);
    try {
      await action();
      showApiFeedback(successMessage, { variant: "success" });
      await reload();
      onUpdated?.();
    } catch (error) {
      showApiFeedback(String(error?.message || t("admin.users.actionFailed", "Action failed.")), {
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  if (!userId) return null;

  const assignableRoles = availableRoles.filter((role) => !roles.includes(role.name));

  return (
    <>
      <button type="button" className="admin-drawer__backdrop" aria-label={t("admin.close", "Close")} onClick={onClose} />
      <aside className="admin-drawer" role="dialog" aria-labelledby="admin-user-drawer-title">
        <div className="admin-drawer__head">
          <h2 id="admin-user-drawer-title">{t("admin.users.detail", "User details")}</h2>
          <button type="button" className="admin-btn" onClick={onClose}>
            {t("admin.close", "Close")}
          </button>
        </div>

        <LoadStatus isLoading={isLoading} loadError={loadError} onRetry={reload} t={t} />

        {user ? (
          <div className="admin-drawer__body">
            <dl className="admin-detail-list">
              <div><dt>Email</dt><dd>{user.email || user.userName}</dd></div>
              <div><dt>ID</dt><dd><code>{user.id}</code></dd></div>
              <div><dt>{t("admin.users.status", "Status")}</dt><dd>{user.isDeleted ? t("admin.deleted", "Deleted") : user.isLocked ? t("admin.locked", "Locked") : t("admin.active", "Active")}</dd></div>
              <div><dt>{t("admin.users.created", "Created")}</dt><dd>{formatDate(user.createdAt)}</dd></div>
              <div><dt>{t("admin.users.lockoutEnd", "Lockout end")}</dt><dd>{formatDate(user.lockoutEnd)}</dd></div>
            </dl>

            <section className="admin-drawer__section">
              <h3>{t("admin.users.roles", "Roles")}</h3>
              {roles.length === 0 ? (
                <p className="muted">{t("admin.users.noRoles", "No roles assigned.")}</p>
              ) : (
                <ul className="admin-role-list">
                  {roles.map((roleName) => (
                    <li key={roleName}>
                      <span>{roleName}</span>
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger"
                        disabled={busy}
                        onClick={() =>
                          runAction(
                            () => adminApi.removeUserRole(userId, roleName),
                            t("admin.users.roleRemoved", "Role removed."),
                          )
                        }
                      >
                        {t("admin.roles.remove", "Remove")}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {assignableRoles.length > 0 ? (
                <div className="admin-toolbar">
                  <select value={roleToAdd} onChange={(event) => setRoleToAdd(event.target.value)}>
                    {assignableRoles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary"
                    disabled={busy}
                    onClick={() =>
                      runAction(
                        () => adminApi.addUserRole(userId, roleToAdd),
                        t("admin.users.roleAdded", "Role added."),
                      )
                    }
                  >
                    {t("admin.roles.add", "Add role")}
                  </button>
                </div>
              ) : null}
            </section>

            <section className="admin-drawer__section">
              <h3>{t("admin.users.actions", "Actions")}</h3>
              <div className="admin-actions">
                {user.isDeleted ? (
                  <button
                    type="button"
                    className="admin-btn"
                    disabled={busy}
                    onClick={() =>
                      runAction(
                        () => adminApi.restoreUser(userId),
                        t("admin.users.actionDone", "User updated."),
                      )
                    }
                  >
                    {t("admin.restore", "Restore")}
                  </button>
                ) : (
                  <>
                    {user.isLocked ? (
                      <button
                        type="button"
                        className="admin-btn"
                        disabled={busy}
                        onClick={() =>
                          runAction(
                            () => adminApi.unlockUser(userId),
                            t("admin.users.actionDone", "User updated."),
                          )
                        }
                      >
                        {t("admin.unlock", "Unlock")}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger"
                        disabled={busy}
                        onClick={() =>
                          runAction(
                            () =>
                              adminApi.lockUser(
                                userId,
                                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                              ),
                            t("admin.users.actionDone", "User updated."),
                          )
                        }
                      >
                        {t("admin.lock", "Lock")}
                      </button>
                    )}
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger"
                      disabled={busy}
                      onClick={() =>
                        runAction(
                          () => adminApi.deleteUser(userId),
                          t("admin.users.actionDone", "User updated."),
                        )
                      }
                    >
                      {t("admin.delete", "Delete")}
                    </button>
                  </>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </aside>
    </>
  );
}

export function AdminUsersPage() {
  const { t } = useUiSettings();
  const [email, setEmail] = useState("");
  const [isLocked, setIsLocked] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], totalCount: 0, hasNextPage: false });
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [busyUserId, setBusyUserId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const reload = useCallback(async () => {
    await withLoadState({ setIsLoading, setLoadError }, async () => {
      const data = await adminApi.fetchAdminUsers({
        page,
        pageSize: 20,
        email: email.trim(),
        isLocked: isLocked === "" ? undefined : isLocked === "true",
      });
      setResult(data);
    }, t("admin.users.loadFailed", "Could not load users."));
  }, [email, isLocked, page, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function runAction(userId, action) {
    setBusyUserId(userId);
    try {
      await action();
      showApiFeedback(t("admin.users.actionDone", "User updated."), { variant: "success" });
      await reload();
    } catch (error) {
      showApiFeedback(String(error?.message || t("admin.users.actionFailed", "Action failed.")), {
        variant: "error",
      });
    } finally {
      setBusyUserId("");
    }
  }

  return (
    <section>
      <div className="admin-page__head">
        <h1 className="admin-page__title">{t("admin.users.title", "Users")}</h1>
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => setCreateOpen(true)}>
          {t("admin.users.createTitle", "Add user")}
        </button>
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder={t("admin.users.searchEmail", "Search by email")}
          value={email}
          onChange={(event) => {
            setPage(1);
            setEmail(event.target.value);
          }}
        />
        <select
          value={isLocked}
          onChange={(event) => {
            setPage(1);
            setIsLocked(event.target.value);
          }}
          aria-label={t("admin.users.lockFilter", "Lock filter")}
        >
          <option value="">{t("admin.users.all", "All users")}</option>
          <option value="true">{t("admin.users.locked", "Locked")}</option>
          <option value="false">{t("admin.users.unlocked", "Unlocked")}</option>
        </select>
      </div>

      <LoadStatus isLoading={isLoading} loadError={loadError} onRetry={reload} t={t} />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("admin.users.email", "Email")}</th>
              <th>{t("admin.users.roles", "Roles")}</th>
              <th>{t("admin.users.status", "Status")}</th>
              <th>{t("admin.users.created", "Created")}</th>
              <th>{t("admin.users.actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={5}>{t("admin.users.empty", "No users found.")}</td>
              </tr>
            ) : (
              result.items.map((user) => (
                <tr key={user.id}>
                  <td>
                    <button type="button" className="admin-link-btn" onClick={() => setSelectedUserId(user.id)}>
                      {user.email || user.userName}
                    </button>
                    <small className="muted">{user.id}</small>
                  </td>
                  <td>{user.roles?.length ? user.roles.join(", ") : "—"}</td>
                  <td>
                    {user.isDeleted ? (
                      <span className="admin-badge admin-badge--danger">{t("admin.deleted", "Deleted")}</span>
                    ) : user.isLocked ? (
                      <span className="admin-badge admin-badge--danger">{t("admin.locked", "Locked")}</span>
                    ) : (
                      <span className="admin-badge admin-badge--ok">{t("admin.active", "Active")}</span>
                    )}
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="admin-actions">
                      <button type="button" className="admin-btn" onClick={() => setSelectedUserId(user.id)}>
                        {t("admin.users.details", "Details")}
                      </button>
                      {user.isDeleted ? (
                        <button
                          type="button"
                          className="admin-btn"
                          disabled={busyUserId === user.id}
                          onClick={() => runAction(user.id, () => adminApi.restoreUser(user.id))}
                        >
                          {t("admin.restore", "Restore")}
                        </button>
                      ) : user.isLocked ? (
                        <button
                          type="button"
                          className="admin-btn"
                          disabled={busyUserId === user.id}
                          onClick={() => runAction(user.id, () => adminApi.unlockUser(user.id))}
                        >
                          {t("admin.unlock", "Unlock")}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger"
                          disabled={busyUserId === user.id}
                          onClick={() =>
                            runAction(user.id, () =>
                              adminApi.lockUser(
                                user.id,
                                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                              ),
                            )
                          }
                        >
                          {t("admin.lock", "Lock")}
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

      {createOpen ? (
        <AdminCreateUserDrawer
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setPage(1);
            reload();
          }}
          t={t}
        />
      ) : null}

      {selectedUserId ? (
        <AdminUserDrawer
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUpdated={reload}
          t={t}
        />
      ) : null}
    </section>
  );
}
