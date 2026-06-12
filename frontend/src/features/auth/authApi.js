import { apiFetch } from "../../shared/api/http";
import { AUTH } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";

async function request(method, path, body) {
  if (import.meta.env.DEV && USE_MOCK_AUTH) {
    const { mockAuthFetch } = await import("./mockAuthApi");
    return mockAuthFetch(method, path, body);
  }
  return apiFetch(method, path, body);
}

/**
 * Backend contract: { email, password } only.
 * Mock mode accepts extra profile fields for local demo.
 */
export function registerAccount(payload) {
  const body =
    import.meta.env.DEV && USE_MOCK_AUTH
      ? payload
      : { email: payload.email, password: payload.password };
  return request("POST", AUTH.register, body);
}

/** Backend contract: { email, password } */
export function loginAccount({ email, password }) {
  return request("POST", AUTH.login, { email, password });
}

/** Backend contract: { providerToken } — provider set server-side from route. */
export function googleLogin(providerToken) {
  return request("POST", AUTH.google, { providerToken });
}

/** Backend contract: { providerToken } — provider set server-side from route. */
export function facebookLogin(providerToken) {
  return request("POST", AUTH.facebook, { providerToken });
}

/** Backend contract: { refreshToken } */
export function logoutAccount(refreshToken) {
  return request("POST", AUTH.logout, { refreshToken });
}

/** Backend contract: { refreshToken } */
export function refreshAccessToken(refreshToken) {
  return request("POST", AUTH.refresh, { refreshToken });
}

/** Requires Authorization header. Returns AccountDto. */
export function fetchCurrentAccount() {
  return request("GET", AUTH.me);
}
