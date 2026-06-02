import { apiFetch } from "../../shared/api/http";
import { AUTH } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import { mockAuthFetch } from "./mockAuthApi";

async function request(method, path, body) {
  if (USE_MOCK_AUTH) {
    return mockAuthFetch(method, path, body);
  }
  return apiFetch(method, path, body);
}

/**
 * Backend contract: { email, password } only.
 * Mock mode accepts extra profile fields for local demo.
 */
export function registerAccount(payload) {
  if (USE_MOCK_AUTH) {
    return request("POST", AUTH.register, payload);
  }
  return request("POST", AUTH.register, {
    email: payload.email,
    password: payload.password,
  });
}

/** Backend contract: { email, password } */
export function loginAccount({ email, password }) {
  return request("POST", AUTH.login, { email, password });
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
