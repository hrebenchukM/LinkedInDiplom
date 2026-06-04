import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { AuthPage } from "../pages/auth/AuthPage";
import { HomePage } from "../pages/home/HomePage";
import { NetworkPage } from "../pages/network/NetworkPage";
import { VacanciesPage } from "../pages/vacancies/VacanciesPage";
import { ChatPage } from "../pages/chat/ChatPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { useAuth } from "../features/auth/AuthContext";

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

function WithLayout() {
  return (
    <RequireAuth>
      <AppLayout />
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
    children: [
      { path: "/home", element: <HomePage /> },
      { path: "/network", element: <NetworkPage /> },
      { path: "/vacancies", element: <VacanciesPage /> },
      { path: "/chat", element: <ChatPage /> },
      { path: "/profile", element: <ProfilePage /> },
    ],
  },
  { path: "*", element: <Navigate to="/home" replace /> },
]);
