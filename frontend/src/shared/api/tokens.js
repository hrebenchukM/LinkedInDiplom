import { decodeJwtPayload } from "../lib/jwtClaims";

export const AUTH_ACCESS_TOKEN_KEY = "authAccessToken";
export const AUTH_REFRESH_TOKEN_KEY = "authRefreshToken";
export const AUTH_TOKEN_EXPIRES_AT_KEY = "authTokenExpiresAt";

function resolveExpiresAtIso(tokenDto) {
  const raw = tokenDto?.expiresAt ?? tokenDto?.ExpiresAt;
  if (raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  const accessToken = tokenDto?.accessToken ?? tokenDto?.AccessToken;
  const payload = decodeJwtPayload(accessToken);
  if (payload?.exp) {
    return new Date(payload.exp * 1000).toISOString();
  }

  return null;
}

export function setAuthTokens(accessToken, refreshToken) {
  try {
    if (accessToken) {
      window.localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, accessToken);
    } else {
      window.localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
    }
    if (refreshToken) {
      window.localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
    } else {
      window.localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export function setTokenExpiresAt(iso) {
  try {
    if (iso) {
      window.localStorage.setItem(AUTH_TOKEN_EXPIRES_AT_KEY, iso);
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_EXPIRES_AT_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export function getTokenExpiresAt() {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_EXPIRES_AT_KEY) || "";
  } catch {
    return "";
  }
}

export function clearAuthTokens() {
  try {
    window.localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_TOKEN_EXPIRES_AT_KEY);
  } catch {
    // ignore storage errors
  }
  import("./tokenRefreshScheduler.js").then((module) => module.cancelProactiveTokenRefresh());
}

export function getAccessToken() {
  try {
    return window.localStorage.getItem(AUTH_ACCESS_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function getRefreshToken() {
  try {
    return window.localStorage.getItem(AUTH_REFRESH_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

/** True for mock/demo tokens that must not be used against Facade.API. */
export function looksLikeMockToken(value) {
  return (
    typeof value === "string" &&
    (value.startsWith("mock-access-") ||
      value.startsWith("mock-refresh-") ||
      value === "mock" ||
      /^mock-/i.test(value))
  );
}

/** Normalize AuthTokenDto from API (camelCase or PascalCase). */
export function normalizeAuthTokenDto(raw) {
  if (!raw || typeof raw !== "object") return null;
  const accessToken = String(raw.accessToken ?? raw.AccessToken ?? "").trim();
  if (!accessToken) return null;
  const refreshToken = String(raw.refreshToken ?? raw.RefreshToken ?? "").trim();
  const expiresAt = raw.expiresAt ?? raw.ExpiresAt ?? null;
  return { accessToken, refreshToken: refreshToken || null, expiresAt };
}

/** Read token block from login/refresh response body. */
export function extractAuthTokenFromResponse(data) {
  const token = data?.token ?? data?.Token;
  return normalizeAuthTokenDto(token);
}

export function applyTokenDto(tokenDto) {
  const normalized = normalizeAuthTokenDto(tokenDto) ?? tokenDto;
  if (!normalized?.accessToken) return;
  setAuthTokens(normalized.accessToken, normalized.refreshToken || null);
  setTokenExpiresAt(resolveExpiresAtIso(normalized));
  queueMicrotask(() => {
    import("./tokenRefreshScheduler.js").then((module) => module.scheduleProactiveTokenRefresh());
  });
}

/** Demo/mock tokens stored while VITE_USE_MOCK_AUTH was true — invalid for Facade.API. */
export function isLegacyMockTokenPair() {
  const access = getAccessToken();
  const refresh = getRefreshToken();
  return looksLikeMockToken(access) || looksLikeMockToken(refresh);
}
