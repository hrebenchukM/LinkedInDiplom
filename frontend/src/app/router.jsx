import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { AuthPage } from "../pages/auth/AuthPage";
import { useAuth } from "../features/auth/AuthContext";
import { layoutChildRoutes } from "./layout/layoutRoutes";
import { AdminLayout } from "../pages/admin/AdminLayout";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "../pages/admin/AdminUsersPage";
import { AdminContentPage } from "../pages/admin/AdminContentPage";
import { AdminJobsPage } from "../pages/admin/AdminJobsPage";
import { AdminCommentsPage } from "../pages/admin/AdminCommentsPage";
import { AdminEventsPage } from "../pages/admin/AdminEventsPage";
import { AdminRolesPage } from "../pages/admin/AdminRolesPage";
import { AdminForbiddenPage } from "../pages/admin/AdminForbiddenPage";

function AuthBootstrapGate({ children }) {
  const { isReady } = useAuth();
  if (!isReady) {
    return (
      <div className="app-bootstrap" role="status" aria-live="polite">
        Loading…
      </div>
    );
  }
  return children;
}

function RequireAuth({ children }) {
  const { session, isReady } = useAuth();
  if (!isReady) return null;
  if (!session.isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { session, isReady } = useAuth();
  if (!isReady) return null;
  if (!session.user?.isAdmin) return <AdminForbiddenPage />;
  return children;
}

function WithLayout() {
  return (
    <RequireAuth>
      <AppLayout />
    </RequireAuth>
  );
}

function WithAdminLayout() {
  return (
    <RequireAuth>
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    </RequireAuth>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/home" replace /> },
  {
    path: "/auth",
    element: (
      <AuthBootstrapGate>
        <AuthPage />
      </AuthBootstrapGate>
    ),
  },
  {
    element: (
      <AuthBootstrapGate>
        <WithLayout />
      </AuthBootstrapGate>
    ),
    children: layoutChildRoutes,
  },
  {
    path: "/admin",
    element: (
      <AuthBootstrapGate>
        <WithAdminLayout />
      </AuthBootstrapGate>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboardPage /> },
      { path: "users", element: <AdminUsersPage /> },
      { path: "content", element: <AdminContentPage /> },
      { path: "comments", element: <AdminCommentsPage /> },
      { path: "jobs", element: <AdminJobsPage /> },
      { path: "events", element: <AdminEventsPage /> },
      { path: "roles", element: <AdminRolesPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/home" replace /> },
]);
