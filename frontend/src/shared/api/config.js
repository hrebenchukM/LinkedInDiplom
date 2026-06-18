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

/** Empty in dev → same-origin /api via Vite proxy (Docker :5000). */
export const API_BASE_URL = trimTrailingSlash(readEnvString('VITE_API_BASE_URL', ''));

export const SIGNALR_HUB_URL = trimTrailingSlash(
  readEnvString('VITE_SIGNALR_HUB_URL', ''),
);

export const NOTIFICATIONS_SIGNALR_HUB_URL = trimTrailingSlash(
  readEnvString('VITE_NOTIFICATIONS_SIGNALR_HUB_URL', ''),
);

const configuredUploadsBaseUrl = readEnvString('VITE_UPLOADS_BASE_URL', '');

export const UPLOADS_BASE_URL = trimTrailingSlash(
  configuredUploadsBaseUrl || (API_BASE_URL ? `${API_BASE_URL}/uploads` : '/uploads'),
);

export const DEFAULT_PAGE_SIZE = readEnvNumber('VITE_DEFAULT_PAGE_SIZE', FALLBACK_PAGE_SIZE);

export const TOKEN_REFRESH_MARGIN_MS = readEnvNumber(
  'VITE_TOKEN_REFRESH_MARGIN_MS',
  FALLBACK_TOKEN_REFRESH_MARGIN_MS,
);

export function resolveApiOrigin() {
  if (API_BASE_URL) return API_BASE_URL;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}

export function resolveSignalRHubUrl() {
  if (SIGNALR_HUB_URL) return SIGNALR_HUB_URL;
  const origin = resolveApiOrigin();
  return origin ? `${origin}/hubs/messaging` : '/hubs/messaging';
}

export function resolveNotificationsSignalRHubUrl() {
  if (NOTIFICATIONS_SIGNALR_HUB_URL) return NOTIFICATIONS_SIGNALR_HUB_URL;
  const origin = resolveApiOrigin();
  return origin ? `${origin}/hubs/notifications` : '/hubs/notifications';
}

export function joinUrl(base, path) {
  const normalizedBase = trimTrailingSlash(base);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!normalizedBase) return normalizedPath;
  return `${normalizedBase}${normalizedPath}`;
}

if (import.meta.env.DEV) {
  console.log('API_BASE_URL:', API_BASE_URL || '(same-origin proxy)');
  console.log('SIGNALR_HUB_URL:', resolveSignalRHubUrl());
  console.log('NOTIFICATIONS_SIGNALR_HUB_URL:', resolveNotificationsSignalRHubUrl());
}
