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
