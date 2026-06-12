/** ASP.NET ClaimTypes.Role and common JWT aliases. */
const ROLE_CLAIM_KEYS = [
  "role",
  "roles",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
];

export const ADMIN_ROLE_NAME = "Admin";

/** Decode JWT payload (no signature check — UI hints only). */
export function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function normalizeClaimValues(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map(String);
  return [String(value)];
}

export function getRolesFromJwtPayload(payload) {
  if (!payload || typeof payload !== "object") return [];

  const roles = new Set();
  for (const key of ROLE_CLAIM_KEYS) {
    if (!(key in payload)) continue;
    normalizeClaimValues(payload[key]).forEach((role) => {
      const trimmed = role.trim();
      if (trimmed) roles.add(trimmed);
    });
  }
  return [...roles];
}

export function getRolesFromAccessToken(token) {
  return getRolesFromJwtPayload(decodeJwtPayload(token));
}

export function isAdminFromRoles(roles) {
  return Array.isArray(roles) && roles.includes(ADMIN_ROLE_NAME);
}

export function getAuthFlagsFromAccessToken(token) {
  const roles = getRolesFromAccessToken(token);
  return { roles, isAdmin: isAdminFromRoles(roles) };
}

/** Merge role claims from the current access token into the SPA user model. */
export function applyTokenRolesToUser(user, accessToken) {
  if (!user || user.isGuest || !accessToken) {
    return user;
  }
  const { roles, isAdmin } = getAuthFlagsFromAccessToken(accessToken);
  return { ...user, roles, isAdmin };
}
