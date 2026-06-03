import { getApiBaseUrl } from "./config.js";
import { getAccessToken } from "./tokens";

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

/**
 * Low-level fetch. Returns { ok, status, data } without throwing.
 * All feature modules should use this (or apiClient for throw-on-error).
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

  const response = await fetch(buildApiUrl(path), init);
  const data = await parseJsonSafe(response);
  return { ok: response.ok, status: response.status, data };
}
