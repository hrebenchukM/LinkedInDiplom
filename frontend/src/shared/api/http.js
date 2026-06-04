import { getApiBaseUrl } from "./config.js";
import { AUTH } from "./paths.js";
import { applyTokenDto, getAccessToken, getRefreshToken, clearAuthTokens } from "./tokens";

export function buildApiUrl(path) {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function withAuthHeaders(headers = {}) {
  const token = getAccessToken();
  if (!token) return headers;
  return { ...headers, Authorization: `Bearer ${token}` };
}

export async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

let refreshInFlight = null;

async function tryRefreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const response = await fetch(buildApiUrl(AUTH.refresh), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await parseJsonSafe(response);
      if (response.ok && data?.token?.accessToken) {
        applyTokenDto(data.token);
        return true;
      }
      clearAuthTokens();
      return false;
    })().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

/**
 * Low-level fetch. Returns { ok, status, data } without throwing.
 * Retries once after refresh on 401.
 */
export async function apiFetch(method, path, body, options = {}) {
  const init = {
    method,
    headers: withAuthHeaders({
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    }),
    ...options,
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  let response = await fetch(buildApiUrl(path), init);
  let data = await parseJsonSafe(response);

  if (response.status === 401 && !options._authRetried && getRefreshToken()) {
    const refreshed = await tryRefreshAccessToken();
    if (refreshed) {
      return apiFetch(method, path, body, { ...options, _authRetried: true });
    }
  }

  return { ok: response.ok, status: response.status, data };
}

/** Multipart upload (avatar, header). Field name must match ASP.NET `IFormFile file`. */
export async function apiUpload(method, path, file, fieldName = "file", options = {}) {
  let response = await fetch(buildApiUrl(path), {
    method,
    headers: withAuthHeaders(),
    body: (() => {
      const formData = new FormData();
      formData.append(fieldName, file);
      return formData;
    })(),
  });
  let data = await parseJsonSafe(response);

  if (response.status === 401 && !options._authRetried && getRefreshToken()) {
    const refreshed = await tryRefreshAccessToken();
    if (refreshed) {
      return apiUpload(method, path, file, fieldName, { ...options, _authRetried: true });
    }
  }

  return { ok: response.ok, status: response.status, data };
}
