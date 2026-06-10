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
import { clearAuthTokens, getAccessToken, getRefreshToken, isLegacyMockTokenPair } from "../../shared/api/tokens";
import * as authApi from "./authApi";
import { patchRegisteredAccount, readRegisteredAccount } from "../../shared/lib/registeredAccount";
import { mapAccountToUser, readProfileFallback } from "./mapAccount";
import { mapProfileDtoToRegisteredPatch } from "../profile/mapProfile";
import * as profileApi from "../profile/profileApi";
import { USE_MOCK_AUTH } from "../../shared/config/features";

const AuthContext = createContext(null);

function emptySession() {
  return { isAuthenticated: false, user: null };
}

async function buildUserWithProfile(account, profileFallback = {}, { applyRegistration = false } = {}) {
  if (USE_MOCK_AUTH) {
    return mapAccountToUser(account, profileFallback);
  }

  let dto = await profileApi.tryFetchMyProfile();
  if (applyRegistration) {
    const patched = await profileApi.tryApplyRegistrationProfile(profileFallback);
    if (patched) dto = patched;
    else if (!dto) dto = await profileApi.tryFetchMyProfile();
  }

  const profilePatch = dto ? mapProfileDtoToRegisteredPatch(dto) : {};
  const merged = {
    ...profileFallback,
    ...profilePatch,
    id: account?.id || profileFallback.id,
    email: account?.email || profileFallback.email,
  };
  persistRegisteredProfile(merged);
  return mapAccountToUser(account, merged);
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
    async (loginResponse, profileFallback = {}, options = {}) => {
      if (!loginResponse?.ok || loginResponse?.data?.success === false) {
        return { ok: false, error: readApiError(loginResponse?.data, "Login failed.") };
      }
      if (!loginResponse?.data?.token?.accessToken) {
        return { ok: false, error: readApiError(loginResponse?.data, "Login failed — no token received.") };
      }

      applyLoginResponse(loginResponse.data, profileFallback);
      let user;
      try {
        user = await buildUserWithProfile(loginResponse.data.account, profileFallback, options);
      } catch {
        user = mapAccountToUser(loginResponse.data.account, profileFallback);
      }
      commitSession(user);
      return { ok: true, user };
    },
    [commitSession],
  );

  const registerAndLogin = useCallback(
    async ({ email, password, profileFallback = {} }) => {
      clearAuthTokens();

      const registerPayload = USE_MOCK_AUTH
        ? { email, password, ...profileFallback }
        : { email, password };
      const registerResponse = await authApi.registerAccount(registerPayload);
      if (!registerResponse.ok || registerResponse?.data?.success === false) {
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

      return completeLogin(
        loginResponse,
        {
          ...profileFallback,
          id: registerResponse.data?.account?.id || loginResponse.data?.account?.id,
        },
        { applyRegistration: !USE_MOCK_AUTH },
      );
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
    function onAuthExpired() {
      clearSession();
      if (window.location.pathname !== "/auth") {
        window.location.replace("/auth");
      }
    }
    window.addEventListener("auth:expired", onAuthExpired);
    return () => window.removeEventListener("auth:expired", onAuthExpired);
  }, [clearSession]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = getAccessToken();
      const saved = readJson(AUTH_SESSION_KEY, emptySession());

      if (!USE_MOCK_AUTH && isLegacyMockTokenPair()) {
        clearSession();
        if (!cancelled) setIsReady(true);
        return;
      }

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

        let user;
        try {
          user = await buildUserWithProfile(meResponse.data, readProfileFallback());
        } catch {
          user = mapAccountToUser(meResponse.data, readProfileFallback());
        }
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
