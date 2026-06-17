import {
  getEmailFromToken,
  getRolesFromToken,
  getUserIdFromToken,
  isAdminToken,
} from '../../shared/lib/jwtClaims.js';

function normalizeRoles(roles, accessToken) {
  if (Array.isArray(roles) && roles.length > 0) {
    return roles.map(String);
  }

  if (accessToken) {
    return getRolesFromToken(accessToken);
  }

  return [];
}

function extractTokens(payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (payload.token && typeof payload.token === 'object') {
    const token = payload.token;
    return {
      accessToken: token.accessToken ?? token.AccessToken ?? null,
      refreshToken: token.refreshToken ?? token.RefreshToken ?? null,
      expiresAt: token.expiresAt ?? token.ExpiresAt ?? null,
    };
  }

  const accessToken = payload.accessToken ?? payload.AccessToken ?? null;
  if (accessToken) {
    return {
      accessToken,
      refreshToken: payload.refreshToken ?? payload.RefreshToken ?? null,
      expiresAt: payload.expiresAt ?? payload.ExpiresAt ?? null,
    };
  }

  return null;
}

export function mapAccountDto(account, accessToken) {
  const id =
    account?.id ??
    account?.Id ??
    (accessToken ? getUserIdFromToken(accessToken) : null);

  const email =
    account?.email ??
    account?.Email ??
    (accessToken ? getEmailFromToken(accessToken) : null);

  const userName =
    account?.userName ??
    account?.UserName ??
    email ??
    '';

  const roles = normalizeRoles(
    account?.roles ?? account?.Roles,
    accessToken,
  );

  return {
    id,
    email,
    userName,
    roles,
    isAdmin: roles.includes('Admin') || (accessToken ? isAdminToken(accessToken) : false),
  };
}

export function mapAuthResponse(response) {
  const tokens = extractTokens(response);
  const accountSource = response?.account ?? response?.Account ?? null;

  return {
    account: mapAccountDto(accountSource, tokens?.accessToken),
    tokens,
  };
}

export function mapRefreshResponse(response) {
  return extractTokens(response);
}

export function buildUserFromAccount(account) {
  if (!account) return null;

  return {
    id: account.id,
    email: account.email,
    name: account.userName || account.email,
    roles: account.roles ?? [],
    isAdmin: Boolean(account.isAdmin),
  };
}

export function mapCurrentAccount(accountDto, accessToken) {
  const account = mapAccountDto(accountDto, accessToken);
  return {
    account,
    user: buildUserFromAccount(account),
  };
}
