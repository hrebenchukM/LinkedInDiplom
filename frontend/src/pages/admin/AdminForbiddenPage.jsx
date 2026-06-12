import { useNavigate } from "react-router-dom";
import "./admin.css";
import { useUiSettings } from "../../app/providers/AppProviders";

export function AdminForbiddenPage() {
  const navigate = useNavigate();
  const { t } = useUiSettings();

  return (
    <div className="admin-forbidden">
      <div className="admin-forbidden__card">
        <p className="admin-forbidden__code">403</p>
        <h1>{t("admin.forbidden.title", "Access denied")}</h1>
        <p className="muted">
          {t(
            "admin.forbidden.text",
            "This section is available only to users with the Admin role.",
          )}
        </p>
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => navigate("/home")}>
          {t("admin.forbidden.back", "Go to Home")}
        </button>
      </div>
    </div>
  );
}
