import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useUiSettings } from "../../app/providers/AppProviders";
import "./admin.css";

const adminLinks = [
  { to: "/admin/dashboard", labelKey: "admin.nav.dashboard", fallback: "Dashboard" },
  { to: "/admin/users", labelKey: "admin.nav.users", fallback: "Users" },
  { to: "/admin/content", labelKey: "admin.nav.content", fallback: "Content" },
  { to: "/admin/comments", labelKey: "admin.nav.comments", fallback: "Comments" },
  { to: "/admin/jobs", labelKey: "admin.nav.jobs", fallback: "Jobs" },
  { to: "/admin/events", labelKey: "admin.nav.events", fallback: "Events" },
  { to: "/admin/roles", labelKey: "admin.nav.roles", fallback: "Roles" },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const { t } = useUiSettings();

  return (
    <div className="admin-shell">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <h2 className="admin-sidebar__title">{t("admin.title", "Admin")}</h2>
          <nav className="admin-sidebar__nav" aria-label={t("admin.nav.label", "Admin navigation")}>
            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive ? "admin-sidebar__link admin-sidebar__link--active" : "admin-sidebar__link"
                }
              >
                {t(link.labelKey, link.fallback)}
              </NavLink>
            ))}
          </nav>
          <button type="button" className="admin-sidebar__back" onClick={() => navigate("/home")}>
            {t("admin.backToApp", "Back to app")}
          </button>
        </aside>
        <div className="admin-main">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
