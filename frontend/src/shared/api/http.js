import { API_BASE_URL, joinUrl, TOKEN_REFRESH_MARGIN_MS } from './config.js';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpiredOrNearExpiry,
  setAuthTokens,
} from './tokens.js';
import { ApiError, logApiError, parseApiError } from '../lib/apiError.js';
import { API_PATHS } from './paths.js';
import { mapRefreshResponse } from '../../features/auth/mapAccount.js';

const AUTH_PATHS_NO_REFRESH = new Set([
  API_PATHS.auth.login,
  API_PATHS.auth.register,
  API_PATHS.auth.refresh,
  API_PATHS.auth.logout,
]);

let refreshInFlight = null;

function isAbsoluteUrl(path) {
  return /^https?:\/\//i.test(path);
}

function appendQueryParams(url, query) {
  if (!query) return url;

  const params =
    query instanceof URLSearchParams
      ? query
      : new URLSearchParams(
          Object.entries(query).flatMap(([key, value]) => {
            if (value == null || value === '') return [];
            if (Array.isArray(value)) {
              return value
                .filter((item) => item != null && item !== '')
                .map((item) => [key, String(item)]);
            }
            return [[key, String(value)]];
          }),
        );

  const queryString = params.toString();
  if (!queryString) return url;

  return `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
}

export function buildUrl(path, query) {
  if (!path) {
    throw new Error('Request path is required.');
  }

  let baseUrl;
  if (isAbsoluteUrl(path)) {
    baseUrl = path;
  } else if (API_BASE_URL) {
    baseUrl = joinUrl(API_BASE_URL, path.startsWith('/') ? path : `/${path}`);
  } else {
    baseUrl = path.startsWith('/') ? path : `/${path}`;
  }

  return appendQueryParams(baseUrl, query);
}

async function parseResponseBody(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!text) {
    return null;
  }

  if (
    contentType.includes('application/json') ||
    text.trim().startsWith('{') ||
    text.trim().startsWith('[')
  ) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

function buildHeaders(options = {}, body, accessTokenOverride) {
  const headers = new Headers(options.headers || {});

  const isFormData =
    typeof FormData !== 'undefined' && body instanceof FormData;

  if (!isFormData && body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = accessTokenOverride ?? getAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

function serializeBody(body) {
  if (body == null) return undefined;

  if (
    typeof FormData !== 'undefined' &&
    (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer)
  ) {
    return body;
  }

  return JSON.stringify(body);
}

function normalizePath(path) {
  if (!path || typeof path !== 'string') return '';
  return path.split('?')[0];
}

function shouldSkipRefresh(path) {
  const normalized = normalizePath(path);
  return AUTH_PATHS_NO_REFRESH.has(normalized);
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    try {
      const url = buildUrl(API_PATHS.auth.refresh);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const body = await parseResponseBody(response);

      if (!response.ok) {
        clearAuthTokens();
        return false;
      }

      const tokens = mapRefreshResponse(body);
      if (!tokens?.accessToken) {
        clearAuthTokens();
        return false;
      }

      setAuthTokens(tokens);
      return true;
    } catch {
      clearAuthTokens();
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function executeRequest(method, path, options = {}) {
  const { query, body, ...fetchOptions } = options;
  const url = buildUrl(path, query);
  const payload = serializeBody(body);
  const headers = buildHeaders(fetchOptions, payload);

  const response = await fetch(url, {
    ...fetchOptions,
    method,
    headers,
    body: payload,
  });

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const apiError = parseApiError(response, parsedBody, {
      url,
      method,
    });

    if (import.meta.env.DEV) {
      logApiError(apiError, `${method} ${path}`);
    }

    throw apiError;
  }

  return parsedBody;
}

export async function request(method, path, options = {}, isRetry = false) {
  if (
    !shouldSkipRefresh(path) &&
    getRefreshToken() &&
    isAccessTokenExpiredOrNearExpiry(TOKEN_REFRESH_MARGIN_MS)
  ) {
    await refreshAccessToken();
  }

  try {
    return await executeRequest(method, path, options);
  } catch (error) {
    if (
      !isRetry &&
      error instanceof ApiError &&
      error.status === 401 &&
      !shouldSkipRefresh(path) &&
      getRefreshToken()
    ) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request(method, path, options, true);
      }
    }

    throw error;
  }
}

export function get(path, options = {}) {
  return request('GET', path, options);
}

export function post(path, body, options = {}) {
  return request('POST', path, { ...options, body });
}

export function put(path, body, options = {}) {
  return request('PUT', path, { ...options, body });
}

export function patch(path, body, options = {}) {
  return request('PATCH', path, { ...options, body });
}

export function del(path, options = {}) {
  return request('DELETE', path, options);
}

export function upload(path, formData, options = {}) {
  return request('POST', path, { ...options, body: formData });
}

export { ApiError, refreshAccessToken };
