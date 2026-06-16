import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';

import AppContext from '../features/appContext/AppContext';
import {
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthTokens,
  isAccessTokenExpiredOrNearExpiry,
} from '../shared/api/tokens.js';
import { TOKEN_REFRESH_MARGIN_MS } from '../shared/api/config.js';
import {
  getCurrentAccount,
  logout as authLogout,
  refreshToken as authRefreshToken,
} from '../features/auth/authApi.js';
import {
  buildUserFromAccount,
  mapCurrentAccount,
  mapRefreshResponse,
} from '../features/auth/mapAccount.js';
import { getMyProfile, PROFILE_UPDATED_EVENT } from '../features/profile/profileApi.js';
import { getDisplayName } from '../features/profile/mapProfile.js';
import { clearMessagingProfileCache } from '../features/messaging/enrichMessagingProfiles.js';
import { persistRegisteredProfile } from '../shared/lib/authSession.js';
import { isDemoAccountEmail } from '../features/auth/demoAccount.js';
import {
  AI_HOME_TOAST_EVENT,
  AI_HOME_TOAST_PENDING_KEY,
  prepareDemoAiAssistantSession,
} from '../features/messaging/aiAssistantSession.js';

// public
import SplashPage from '../pages/splash/Splash';
import LandingPage from '../pages/landing/Landing';
import AuthPage from '../pages/auth/Auth';

// app
import Layout from './ui/Layout';
import HomePage from '../pages/home/HomePage';
import NetworkPage from '../pages/network/NetworkPage';
import VacanciesPage from '../pages/vacancies/VacanciesPage';
import MessagesPage from '../pages/messages/MessagesPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import ProfilePage from '../pages/profile/ProfilePage';
import PublicProfilePage from '../pages/profile/PublicProfilePage';
import PortfolioPage from '../pages/portfolio/PortfolioPage';
import GroupPage from '../pages/group/GroupPage';
import EventPage from '../pages/event/EventPage';
import CompanyPage from '../pages/company/CompanyPage';

import ProtectedRoute from './router/ProtectedRoute';
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminRolesPage from '../pages/admin/AdminRolesPage';
import AdminContentPage from '../pages/admin/AdminContentPage';
import AdminCommentsPage from '../pages/admin/AdminCommentsPage';
import AdminJobsPage from '../pages/admin/AdminJobsPage';
import AdminEventsPage from '../pages/admin/AdminEventsPage';
import AdminForbiddenPage from '../pages/admin/AdminForbiddenPage';
import PublicTransitionLayout from './layout/PublicTransitionLayout.jsx';

function RootRedirect() {
  const accessToken = getAccessToken();
  return <Navigate to={accessToken ? '/app' : '/auth'} replace />;
}

function LegacyRedirect({ to }) {
  const params = useParams();
  let path = to;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, encodeURIComponent(value));
  });
  return <Navigate to={path} replace />;
}

export default function App() {
  const [token, setToken] = useState(null);
  const [tokenReady, setTokenReady] = useState(false);
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [profile, setProfile] = useState(null);

  const applyAuthSession = useCallback(({ account: nextAccount, tokens }) => {
    if (tokens?.accessToken) {
      setAuthTokens(tokens);
      setToken(tokens.accessToken);
    }

    if (nextAccount) {
      setAccount(nextAccount);
      setUser(buildUserFromAccount(nextAccount));

      if (isDemoAccountEmail(nextAccount.email)) {
        prepareDemoAiAssistantSession();
      }
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();

    try {
      if (refreshToken) {
        await authLogout(refreshToken);
      }
    } catch {
      // Always clear local session even if backend logout fails.
    } finally {
      clearAuthTokens();
      setToken(null);
      setUser(null);
      setAccount(null);
      setProfile(null);
      window.location.href = '/auth';
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapAuthSession() {
      const storedAccessToken = getAccessToken();
      const storedRefreshToken = getRefreshToken();

      if (!storedAccessToken && !storedRefreshToken) {
        if (!cancelled) setTokenReady(true);
        return;
      }

      try {
        let activeAccessToken = storedAccessToken;

        if (
          storedRefreshToken &&
          (!activeAccessToken ||
            isAccessTokenExpiredOrNearExpiry(TOKEN_REFRESH_MARGIN_MS))
        ) {
          const refreshResponse = await authRefreshToken(storedRefreshToken);
          const refreshedTokens = mapRefreshResponse(refreshResponse);

          if (refreshedTokens?.accessToken) {
            setAuthTokens(refreshedTokens);
            activeAccessToken = refreshedTokens.accessToken;
          } else {
            throw new Error('Refresh token response did not include access token.');
          }
        } else if (activeAccessToken) {
          setToken(activeAccessToken);
        }

        const currentAccessToken = getAccessToken() || activeAccessToken;

        if (currentAccessToken) {
          const accountDto = await getCurrentAccount();
          const mapped = mapCurrentAccount(accountDto, currentAccessToken);

          if (!cancelled) {
            setToken(currentAccessToken);
            setAccount(mapped.account);
            setUser(mapped.user);
          }
        }
      } catch (error) {
        console.error('Auth bootstrap error:', error);
        clearAuthTokens();

        if (!cancelled) {
          setToken(null);
          setUser(null);
          setAccount(null);
          setProfile(null);
        }
      } finally {
        if (!cancelled) setTokenReady(true);
      }
    }

    bootstrapAuthSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        const profileData = await getMyProfile();
        if (!cancelled) {
          setProfile(profileData);
          setUser((prev) =>
            prev
              ? { ...prev, name: getDisplayName(profileData) || prev.name }
              : prev,
          );
        }
      } catch (err) {
        console.error('Profile bootstrap error:', err);
        if (!cancelled) setProfile(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;

    try {
      if (sessionStorage.getItem(AI_HOME_TOAST_PENDING_KEY) === '1') {
        window.dispatchEvent(new CustomEvent(AI_HOME_TOAST_EVENT));
      }
    } catch {
      /* ignore */
    }

    return undefined;
  }, [token]);

  useEffect(() => {
    const handleProfileUpdated = (event) => {
      const nextProfile = event.detail?.profile;
      if (!nextProfile) return;

      setProfile(nextProfile);
      setUser((prev) =>
        prev
          ? { ...prev, name: getDisplayName(nextProfile) || prev.name }
          : prev,
      );
      setAccount((prev) =>
        prev
          ? {
              ...prev,
              firstName: nextProfile.user?.firstName ?? prev.firstName,
              lastName:
                nextProfile.user?.secondName ??
                nextProfile.user?.lastName ??
                prev.lastName,
            }
          : prev,
      );

      clearMessagingProfileCache();

      const user = nextProfile.user ?? {};
      const userId = nextProfile.userId ?? user.id;
      if (userId) {
        persistRegisteredProfile({
          id: userId,
          email: user.email ?? nextProfile.login,
          firstName: user.firstName ?? '',
          lastName: user.secondName ?? user.lastName ?? '',
        });
      }
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
  }, []);

  if (!tokenReady) {
    return (
      <div className="app-boot-loader" role="status" aria-live="polite">
        <div className="app-boot-spinner" />
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        token,
        setToken,
        user,
        account,
        profile,
        setProfile,
        logout,
        applyAuthSession,
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          <Route element={<PublicTransitionLayout />}>
            <Route path="/splash" element={<SplashPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
          </Route>
          <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
          <Route path="/profile/:userId" element={<LegacyRedirect to="/app/profile/:userId" />} />
          <Route path="/notifications" element={<Navigate to="/app/notifications" replace />} />
          <Route path="/admin/dashboard" element={<Navigate to="/app/admin/dashboard" replace />} />
          <Route path="/admin/users" element={<Navigate to="/app/admin/users" replace />} />
          <Route path="/admin/:section" element={<LegacyRedirect to="/app/admin/:section" />} />

          <Route path="/home" element={<Navigate to="/app" replace />} />
          <Route path="/network" element={<Navigate to="/app/network" replace />} />
          <Route path="/vacancies" element={<Navigate to="/app/vacancies" replace />} />
          <Route path="/chat" element={<Navigate to="/app/messages" replace />} />

          <Route
            path="/app"
            element={token ? <Layout /> : <Navigate to="/auth" replace />}
          >
            <Route index element={<HomePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/:userId" element={<PublicProfilePage />} />
            <Route path="network" element={<NetworkPage />} />
            <Route path="vacancies" element={<VacanciesPage />} />

            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:chatId" element={<MessagesPage />} />

            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="portfolio/:username" element={<PortfolioPage />} />
            <Route path="groups/:id" element={<GroupPage />} />
            <Route path="event/:id" element={<EventPage />} />
            <Route path="company/:id" element={<CompanyPage />} />

            <Route path="admin/forbidden" element={<AdminForbiddenPage />} />
            <Route path="admin" element={<ProtectedRoute requireAdmin />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="roles" element={<AdminRolesPage />} />
                <Route path="content" element={<AdminContentPage />} />
                <Route path="comments" element={<AdminCommentsPage />} />
                <Route path="jobs" element={<AdminJobsPage />} />
                <Route path="events" element={<AdminEventsPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}
