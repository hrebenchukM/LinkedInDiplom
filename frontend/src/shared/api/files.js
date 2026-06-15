import { resolveUploadUrl } from './uploads.js';

/**
 * Resolve backend file reference to a public URL.
 * Uses .NET static files under /uploads (see backend FileStorage config).
 */
export function fileUrl(name) {
  if (!name) return null;
  return resolveUploadUrl(name) || null;
}

export function getProfileHeader(profile) {
  const user = profile?.user ?? profile;
  const raw = user?.headerUrl ?? user?.HeaderUrl ?? profile?.headerUrl;
  return raw ? resolveUploadUrl(raw) : '';
}

export { resolveUploadUrl, buildUploadUrl, isAbsoluteUrl } from './uploads.js';
