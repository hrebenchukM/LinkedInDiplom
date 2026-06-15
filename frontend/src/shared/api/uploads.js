import { API_BASE_URL, UPLOADS_BASE_URL, joinUrl } from './config.js';

export function isAbsoluteUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

function isPassthroughUrl(url) {
  return typeof url === 'string' && /^(data:|blob:)/i.test(url.trim());
}

/**
 * Build a full upload URL from a backend file reference.
 * Supports bare filenames (marya.jpg), nested paths (demo/post_1.jpg),
 * and /uploads/... paths served by the .NET API.
 */
export function buildUploadUrl(relativePath) {
  if (relativePath == null || relativePath === '') return '';

  const trimmed = String(relativePath).trim();
  if (!trimmed) return '';

  if (isAbsoluteUrl(trimmed) || isPassthroughUrl(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/uploads/') || trimmed === '/uploads') {
    return joinUrl(API_BASE_URL, trimmed);
  }

  const withoutLeadingSlash = trimmed.startsWith('/')
    ? trimmed.slice(1)
    : trimmed;

  if (withoutLeadingSlash.startsWith('uploads/')) {
    return joinUrl(API_BASE_URL, `/${withoutLeadingSlash}`);
  }

  return joinUrl(UPLOADS_BASE_URL, withoutLeadingSlash);
}

/**
 * Resolve stored backend file reference to a browser-accessible URL.
 */
export function resolveUploadUrl(url) {
  if (!url) return '';
  return buildUploadUrl(url);
}

/** Alias for resolveUploadUrl — normalizes relative backend paths to absolute URLs. */
export function normalizeImageUrl(url) {
  return resolveUploadUrl(url);
}
