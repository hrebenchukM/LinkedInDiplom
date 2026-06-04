import { readApiError } from "../lib/apiError";
import { apiFetch, parseJsonSafe, withAuthHeaders, buildApiUrl } from "./http";

async function request(method, path, body) {
  const { ok, status, data } = await apiFetch(method, path, body);
  if (!ok) {
    throw new Error(readApiError(data, `Request failed with status ${status}`));
  }
  if (status === 204) return null;
  return data;
}

/** Throws on HTTP error — use for module integration (profile, messaging, …). */
export const apiClient = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};

export { apiFetch, parseJsonSafe, withAuthHeaders, buildApiUrl };
