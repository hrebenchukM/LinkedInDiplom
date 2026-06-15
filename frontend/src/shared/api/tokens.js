const ACCESS_TOKEN_KEY = 'linkedin_access_token';
const REFRESH_TOKEN_KEY = 'linkedin_refresh_token';
const ACCESS_EXPIRES_AT_KEY = 'linkedin_access_expires_at';

/** @deprecated Legacy Java JWT key — cleared on setAuthTokens/clearAuthTokens for migration. */
const LEGACY_TOKEN_KEY = 'token';

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    if (value == null || value === '') {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // ignore storage failures (private mode, etc.)
  }
}

export function getAccessToken() {
  return readStorage(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token) {
  writeStorage(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  writeStorage(ACCESS_TOKEN_KEY, null);
}

export function getRefreshToken() {
  return readStorage(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token) {
  writeStorage(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken() {
  writeStorage(REFRESH_TOKEN_KEY, null);
}

export function getTokenExpiresAt() {
  const raw = readStorage(ACCESS_EXPIRES_AT_KEY);
  if (!raw) return null;

  const timestamp = Date.parse(raw);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function setTokenExpiresAt(expiresAt) {
  if (expiresAt == null || expiresAt === '') {
    writeStorage(ACCESS_EXPIRES_AT_KEY, null);
    return;
  }

  const value =
    expiresAt instanceof Date
      ? expiresAt.toISOString()
      : typeof expiresAt === 'number'
        ? new Date(expiresAt).toISOString()
        : String(expiresAt);

  writeStorage(ACCESS_EXPIRES_AT_KEY, value);
}

export function setAuthTokens({ accessToken, refreshToken, expiresAt }) {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
  setTokenExpiresAt(expiresAt);

  // Drop legacy Java token key so old and new auth do not coexist.
  writeStorage(LEGACY_TOKEN_KEY, null);
}

export function clearAuthTokens() {
  clearAccessToken();
  clearRefreshToken();
  writeStorage(ACCESS_EXPIRES_AT_KEY, null);
  writeStorage(LEGACY_TOKEN_KEY, null);
}

export function isAccessTokenExpiredOrNearExpiry(marginMs = 0) {
  const expiresAt = getTokenExpiresAt();
  if (expiresAt == null) {
    // No expiry metadata — treat as not expired (Stage 2 refresh will set expiresAt).
    return false;
  }

  return Date.now() + marginMs >= expiresAt;
}
