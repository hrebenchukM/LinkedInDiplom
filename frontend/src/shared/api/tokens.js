export const AUTH_ACCESS_TOKEN_KEY = "authAccessToken";
export const AUTH_REFRESH_TOKEN_KEY = "authRefreshToken";

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

export function clearAuthTokens() {
  try {
    window.localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  } catch {
    // ignore storage errors
  }
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

export function applyTokenDto(tokenDto) {
  if (!tokenDto) return;
  setAuthTokens(tokenDto.accessToken || null, tokenDto.refreshToken || null);
}

/** Demo/mock tokens stored while VITE_USE_MOCK_AUTH was true — invalid for Facade.API. */
export function isLegacyMockTokenPair() {
  const access = getAccessToken();
  const refresh = getRefreshToken();
  const looksMock = (value) =>
    typeof value === "string" &&
    (value.startsWith("mock-access-") ||
      value.startsWith("mock-refresh-") ||
      value === "mock" ||
      /^mock-/i.test(value));
  return looksMock(access) || looksMock(refresh);
}
