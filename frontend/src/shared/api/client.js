import { readApiError } from "../lib/apiError";
import { showApiFeedback } from "../lib/apiFeedback";
import { apiFetch, parseJsonSafe, withAuthHeaders, buildApiUrl } from "./http";

async function request(method, path, body, options = {}) {
  const { ok, status, data } = await apiFetch(method, path, body, options);
  if (!ok) {
    const message = readApiError(data, `Request failed with status ${status}`);
    const showFeedback =
      options.feedback === true || (options.feedback !== false && method !== "GET");
    if (showFeedback) {
      showApiFeedback(message);
    }
    throw new Error(message);
  }
  if (status === 204) return null;
  return data;
}

/** Throws on HTTP error — use for module integration (profile, messaging, …). */
export const apiClient = {
  get: (path, options) => request("GET", path, undefined, options),
  post: (path, body, options) => request("POST", path, body, options),
  put: (path, body, options) => request("PUT", path, body, options),
  patch: (path, body, options) => request("PATCH", path, body, options),
  delete: (path, options) => request("DELETE", path, undefined, options),
};

export { apiFetch, parseJsonSafe, withAuthHeaders, buildApiUrl };
