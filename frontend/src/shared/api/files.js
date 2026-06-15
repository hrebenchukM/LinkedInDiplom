import {
  buildUploadUrl,
  isAbsoluteUrl,
  normalizeImageUrl,
  resolveUploadUrl,
} from './uploads.js';

const avatarPlaceholderSvg = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect fill="#e5e7eb" width="128" height="128"/><circle cx="64" cy="48" r="24" fill="#9ca3af"/><ellipse cx="64" cy="104" rx="40" ry="28" fill="#9ca3af"/></svg>',
);

const companyPlaceholderSvg = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect fill="#eef2ff" width="128" height="128" rx="16"/><rect x="28" y="52" width="72" height="48" fill="#6366f1" rx="4"/><rect x="40" y="32" width="48" height="28" fill="#818cf8" rx="4"/></svg>',
);

const coverPlaceholderSvg = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="240" viewBox="0 0 640 240"><rect fill="#dbeafe" width="640" height="240"/><rect x="0" y="160" width="640" height="80" fill="#93c5fd"/></svg>',
);

export const IMAGE_PLACEHOLDERS = {
  avatar: `data:image/svg+xml,${avatarPlaceholderSvg}`,
  company: `data:image/svg+xml,${companyPlaceholderSvg}`,
  cover: `data:image/svg+xml,${coverPlaceholderSvg}`,
  event: `data:image/svg+xml,${coverPlaceholderSvg}`,
};

/**
 * Resolve backend media path to an absolute URL, with optional fallback.
 */
export function getAssetUrl(url, fallback = '') {
  const resolved = normalizeImageUrl(url);
  return resolved || fallback;
}

/**
 * Resolve backend file reference to a public URL.
 * Uses .NET static files under /uploads (see backend FileStorage config).
 */
export function fileUrl(name) {
  if (!name) return null;
  return getAssetUrl(name) || null;
}

export function getProfileHeader(profile) {
  const user = profile?.user ?? profile;
  const raw = user?.headerUrl ?? user?.HeaderUrl ?? profile?.headerUrl;
  return raw ? resolveUploadUrl(raw) : '';
}

export function getBackgroundImageStyle(url) {
  const resolved = getAssetUrl(url);
  return resolved ? { backgroundImage: `url("${resolved}")` } : undefined;
}

export {
  buildUploadUrl,
  isAbsoluteUrl,
  normalizeImageUrl,
  resolveUploadUrl,
};
