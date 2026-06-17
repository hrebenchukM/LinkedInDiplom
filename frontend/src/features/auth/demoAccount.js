import { getSocialProfileTemplate } from './socialAuth.js';

const DEMO_EMAILS = new Set(
  ['google', 'facebook'].map((provider) =>
    getSocialProfileTemplate(provider).email.trim().toLowerCase(),
  ),
);

/** Preset diploma demo accounts (Google/Facebook fallback + manual email login). */
export function isDemoAccountEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  return normalized.length > 0 && DEMO_EMAILS.has(normalized);
}
