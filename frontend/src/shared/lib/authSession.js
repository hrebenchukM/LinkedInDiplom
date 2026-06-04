import { applyTokenDto, clearAuthTokens, setAuthTokens } from "../api/tokens";
import { readJson, writeJson } from "./storage";

export const REGISTERED_ACCOUNT_KEY = "registeredAccount";
/** React session: `{ isAuthenticated, user }` — written only by AuthContext. */
export const AUTH_SESSION_KEY = "authSession";

export function persistRegisteredProfile(fields = {}) {
  const normalized = {
    id: fields.id,
    email: String(fields.email || "").trim(),
    userName: String(fields.userName || "").trim(),
    firstName: String(fields.firstName || "").trim(),
    lastName: String(fields.lastName || "").trim(),
    avatarDataUrl: String(fields.avatarDataUrl || "").trim(),
    authProvider: fields.authProvider || null,
  };

  const prev = readJson(REGISTERED_ACCOUNT_KEY, {});
  writeJson(REGISTERED_ACCOUNT_KEY, { ...prev, ...normalized, id: normalized.id || prev.id });

  return normalized;
}

export function applyLoginResponse(loginData, profileFallback = {}) {
  const account = loginData?.account || {};
  const token = loginData?.token || null;
  applyTokenDto(token);

  return persistRegisteredProfile({
    id: account.id || profileFallback.id,
    email: account.email || profileFallback.email,
    userName: account.userName || account.username || profileFallback.userName,
    firstName: account.firstName || profileFallback.firstName,
    lastName: account.lastName || profileFallback.lastName,
    avatarDataUrl: account.avatarDataUrl || profileFallback.avatarDataUrl,
    authProvider: profileFallback.authProvider || null,
  });
}

export function clearPersistedAuthSession() {
  try {
    window.localStorage.removeItem(REGISTERED_ACCOUNT_KEY);
    window.localStorage.removeItem(AUTH_SESSION_KEY);
  } catch {
    // ignore storage errors
  }
  clearAuthTokens();
}

/** Guest/demo only — no JWT */
export function persistGuestProfile(account) {
  clearAuthTokens();
  return persistRegisteredProfile({ ...account, authProvider: "guest" });
}
