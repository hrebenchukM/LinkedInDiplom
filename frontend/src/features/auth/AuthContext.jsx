import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { readApiError } from "../../shared/lib/apiError";
import {
  AUTH_SESSION_KEY,
  applyLoginResponse,
  clearPersistedAuthSession,
  persistGuestProfile,
  persistRegisteredProfile,
} from "../../shared/lib/authSession";
import { readJson, writeJson } from "../../shared/lib/storage";
import { getAccessToken, getRefreshToken } from "../../shared/api/tokens";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import * as authApi from "./authApi";
import { patchRegisteredAccount, readRegisteredAccount } from "../../shared/lib/registeredAccount";
import { mapAccountToUser, readProfileFallback } from "./mapAccount";

const AuthContext = createContext(null);

function emptySession() {
  return { isAuthenticated: false, user: null };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readJson(AUTH_SESSION_KEY, emptySession()));
  const [isReady, setIsReady] = useState(false);

  const commitSession = useCallback((user) => {
    const next = { isAuthenticated: true, user };
    setSession(next);
    writeJson(AUTH_SESSION_KEY, next);
    return user;
  }, []);

  const clearSession = useCallback(() => {
    clearPersistedAuthSession();
    const next = emptySession();
    setSession(next);
    writeJson(AUTH_SESSION_KEY, next);
  }, []);

  const completeLogin = useCallback(
    (loginResponse, profileFallback = {}) => {
      if (!loginResponse?.ok || !loginResponse?.data?.token?.accessToken) {
        return { ok: false, error: readApiError(loginResponse?.data, "Login failed.") };
      }

      applyLoginResponse(loginResponse.data, profileFallback);
      const user = mapAccountToUser(loginResponse.data.account, profileFallback);
      commitSession(user);
      return { ok: true, user };
    },
    [commitSession],
  );

  const registerAndLogin = useCallback(
    async ({ email, password, profileFallback = {} }) => {
      const registerPayload = USE_MOCK_AUTH
        ? { email, password, ...profileFallback }
        : { email, password };
      const registerResponse = await authApi.registerAccount(registerPayload);
      if (!registerResponse.ok) {
        return { ok: false, error: readApiError(registerResponse.data, "Registration failed.") };
      }

      const loginResponse = await authApi.loginAccount({ email, password });
      if (!loginResponse.ok) {
        return {
          ok: false,
          error: readApiError(
            loginResponse.data,
            "Account created, but sign-in failed. Try logging in.",
          ),
        };
      }

      return completeLogin(loginResponse, {
        ...profileFallback,
        id: registerResponse.data?.account?.id || loginResponse.data?.account?.id,
      });
    },
    [completeLogin],
  );

  const loginWithPassword = useCallback(
    async ({ email, password, profileFallback = {} }) => {
      const loginResponse = await authApi.loginAccount({ email, password });
      if (!loginResponse.ok) {
        return { ok: false, error: readApiError(loginResponse.data, "Invalid email or password.") };
      }
      return completeLogin(loginResponse, profileFallback);
    },
    [completeLogin],
  );

  const loginAsGuest = useCallback(() => {
    const profile = persistGuestProfile({
      id: "guest",
      email: "guest@linkup.local",
      userName: "guest",
      firstName: "Guest",
      lastName: "",
    });
    const user = mapAccountToUser(profile, { isGuest: true, authProvider: "guest" });
    commitSession(user);
    return user;
  }, [commitSession]);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken && !USE_MOCK_AUTH) {
      try {
        await authApi.logoutAccount(refreshToken);
      } catch {
        // clear local session even if API logout fails
      }
    }
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = getAccessToken();
      const saved = readJson(AUTH_SESSION_KEY, emptySession());

      if (!token) {
        if (saved.isAuthenticated) {
          clearPersistedAuthSession();
          if (!cancelled) setSession(emptySession());
        }
        if (!cancelled) setIsReady(true);
        return;
      }

      if (saved.isAuthenticated && saved.user) {
        if (!cancelled) setSession(saved);
      }

      try {
        const meResponse = await authApi.fetchCurrentAccount();
        if (cancelled) return;

        if (!meResponse.ok) {
          clearSession();
          setIsReady(true);
          return;
        }

        const profile = readProfileFallback();
        persistRegisteredProfile({
          id: meResponse.data?.id,
          email: meResponse.data?.email,
          ...profile,
        });
        const user = mapAccountToUser(meResponse.data, profile);
        commitSession(user);
      } catch {
        if (!cancelled) clearSession();
      }

      if (!cancelled) setIsReady(true);
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [clearSession, commitSession]);

  const syncUserProfile = useCallback(
    (patch) => {
      const merged = patchRegisteredAccount(patch);
      if (!session.isAuthenticated || !session.user) return merged;
      const user = mapAccountToUser({ ...session.user, ...merged }, merged);
      commitSession(user);
      return merged;
    },
    [session, commitSession],
  );

  const value = useMemo(
    () => ({
      session,
      isReady,
      registerAndLogin,
      loginWithPassword,
      loginAsGuest,
      logout,
      syncUserProfile,
      readRegisteredAccount,
      /** Demo/mock only (social login). Sets tokens when accessToken is provided. */
      login(userData) {
        if (userData?.accessToken) {
          applyLoginResponse(
            {
              account: userData,
              token: { accessToken: userData.accessToken, refreshToken: userData.refreshToken },
            },
            userData,
          );
        } else {
          persistRegisteredProfile(userData);
        }
        const user = mapAccountToUser(userData, userData);
        commitSession(user);
      },
    }),
    [session, isReady, registerAndLogin, loginWithPassword, loginAsGuest, logout, syncUserProfile, commitSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
