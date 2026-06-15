const DEFAULT_API_BASE_URL = 'https://localhost:7011';
const DEFAULT_SIGNALR_HUB_URL = 'https://localhost:7011/hubs/messaging';
const FALLBACK_PAGE_SIZE = 10;
const FALLBACK_TOKEN_REFRESH_MARGIN_MS = 60_000;

function trimTrailingSlash(value) {
  if (!value) return '';
  return value.replace(/\/+$/, '');
}

function readEnvString(key, fallback) {
  const value = import.meta.env[key];
  if (value == null || value === '') {
    return fallback;
  }
  return String(value).trim();
}

function readEnvNumber(key, fallback) {
  const raw = import.meta.env[key];
  if (raw == null || raw === '') {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const API_BASE_URL = trimTrailingSlash(
  readEnvString('VITE_API_BASE_URL', DEFAULT_API_BASE_URL),
);

export const SIGNALR_HUB_URL = trimTrailingSlash(
  readEnvString('VITE_SIGNALR_HUB_URL', DEFAULT_SIGNALR_HUB_URL),
);

const configuredUploadsBaseUrl = readEnvString('VITE_UPLOADS_BASE_URL', '');

export const UPLOADS_BASE_URL = trimTrailingSlash(
  configuredUploadsBaseUrl || `${API_BASE_URL}/uploads`,
);

export const DEFAULT_PAGE_SIZE = readEnvNumber(
  'VITE_DEFAULT_PAGE_SIZE',
  FALLBACK_PAGE_SIZE,
);

export const TOKEN_REFRESH_MARGIN_MS = readEnvNumber(
  'VITE_TOKEN_REFRESH_MARGIN_MS',
  FALLBACK_TOKEN_REFRESH_MARGIN_MS,
);

/**
 * Join base URL and path without duplicate slashes.
 */
export function joinUrl(base, path) {
  const normalizedBase = trimTrailingSlash(base);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

if (import.meta.env.DEV) {
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('SIGNALR_HUB_URL:', SIGNALR_HUB_URL);
}
