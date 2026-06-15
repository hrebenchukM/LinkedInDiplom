import { API_BASE_URL, UPLOADS_BASE_URL, joinUrl } from './config.js';

export function isAbsoluteUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

/**
 * Build a full upload URL from a relative backend path.
 */
export function buildUploadUrl(relativePath) {
  if (!relativePath) return '';

  if (isAbsoluteUrl(relativePath)) {
    return relativePath;
  }

  if (relativePath.startsWith('/uploads')) {
    return joinUrl(API_BASE_URL, relativePath);
  }

  const normalizedPath = relativePath.startsWith('/')
    ? relativePath.slice(1)
    : relativePath;

  return joinUrl(UPLOADS_BASE_URL, normalizedPath);
}

/**
 * Resolve stored backend file reference to a browser-accessible URL.
 */
export function resolveUploadUrl(url) {
  if (!url) return '';
  return buildUploadUrl(url);
}
