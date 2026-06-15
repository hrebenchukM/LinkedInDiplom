const ROLE_CLAIM_KEYS = [
  'role',
  'roles',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
];

const USER_ID_CLAIM_KEYS = [
  'sub',
  'nameid',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
];

const EMAIL_CLAIM_KEYS = [
  'email',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
];

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');

  if (typeof atob !== 'function') {
    throw new Error('Base64 decoding is not available.');
  }

  return atob(padded);
}

export function decodeJwtPayload(token) {
  if (typeof token !== 'string' || token.split('.').length < 2) {
    return null;
  }

  try {
    const payloadPart = token.split('.')[1];
    const json = decodeBase64Url(payloadPart);
    const payload = JSON.parse(json);
    return payload && typeof payload === 'object' ? payload : null;
  } catch {
    return null;
  }
}

function pickClaim(payload, keys) {
  if (!payload) return null;

  for (const key of keys) {
    const value = payload[key];
    if (value != null && value !== '') {
      return value;
    }
  }

  return null;
}

function normalizeRoles(value) {
  if (value == null) return [];

  const list = Array.isArray(value) ? value : [value];
  return list.filter(Boolean).map(String);
}

export function getRolesFromToken(token) {
  const payload = decodeJwtPayload(token);
  if (!payload) return [];

  const roles = new Set();

  for (const key of ROLE_CLAIM_KEYS) {
    normalizeRoles(payload[key]).forEach((role) => roles.add(role));
  }

  return [...roles];
}

export function getUserIdFromToken(token) {
  const payload = decodeJwtPayload(token);
  const value = pickClaim(payload, USER_ID_CLAIM_KEYS);
  return value != null ? String(value) : null;
}

export function getEmailFromToken(token) {
  const payload = decodeJwtPayload(token);
  const value = pickClaim(payload, EMAIL_CLAIM_KEYS);
  return value != null ? String(value) : null;
}

export function hasRole(token, role) {
  if (!role) return false;
  return getRolesFromToken(token).includes(role);
}

export function isAdminToken(token) {
  return hasRole(token, 'Admin');
}
