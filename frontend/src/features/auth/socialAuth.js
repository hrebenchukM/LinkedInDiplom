import { clearAuthTokens } from "../../shared/api/tokens";
import { decodeJwtPayload } from "../../shared/lib/jwtClaims";
import { ENABLE_DEMO_SOCIAL_FALLBACK, USE_MOCK_AUTH } from "../../shared/config/features";
import {
  acquireProviderToken,
  isOAuthSdkConfigured,
} from "./oauthSdk";

/**
 * Social sign-in flows (priority in AuthPage):
 * 1. USE_MOCK_AUTH — offline mock tokens in browser
 * 2. OAuth SDK — id_token / access_token → POST /api/auth/google|facebook
 * 3. apiDemoSocialLogin — diploma fallback: preset accounts on real API (no SDK)
 */

/** Shared password for preset Google/Facebook demo accounts (dev / diploma demo). */
export const DEMO_SOCIAL_PASSWORD =
  import.meta.env.VITE_DEMO_SOCIAL_PASSWORD || "LinkUpDemo2024!";

export function getSocialProfileTemplate(provider) {
  if (provider === "google") {
    return {
      email: "andrii.rotar@gmail.com",
      userName: "andrii.rotar",
      firstName: "Andrii",
      lastName: "Rotar",
      avatarDataUrl: "/auth/assets/andrii-rotar-avatar.png",
    };
  }
  return {
    email: "timur.yamchuk@facebook.com",
    userName: "timur.yamchuk",
    firstName: "Timur",
    lastName: "Yamchuk",
    avatarDataUrl: "/auth/assets/timur-yamchuk-avatar.png",
  };
}

export function usesMockSocialFlow() {
  return USE_MOCK_AUTH;
}

export function canUseOAuthSdk(provider) {
  return !USE_MOCK_AUTH && isOAuthSdkConfigured(provider);
}

/** Preset API accounts when OAuth client IDs are not configured (diploma / local demo). */
export function shouldUseDemoSocialFallback(provider) {
  return !USE_MOCK_AUTH && !isOAuthSdkConfigured(provider) && ENABLE_DEMO_SOCIAL_FALLBACK;
}

export function profileFromGoogleIdToken(idToken) {
  const payload = decodeJwtPayload(idToken);
  if (!payload) return { authProvider: "google" };

  return {
    authProvider: "google",
    email: payload.email,
    userName: payload.email?.split("@")[0],
    firstName: payload.given_name,
    lastName: payload.family_name,
    name: payload.name,
    avatarDataUrl: payload.picture,
  };
}

export function profileFromProviderToken(provider, providerToken) {
  if (provider === "google") return profileFromGoogleIdToken(providerToken);
  return { authProvider: provider };
}

/**
 * Load Google/Facebook SDK and return token for Facade.API external login.
 * Google → id_token; Facebook → access_token.
 */
export function requestProviderToken(provider) {
  return acquireProviderToken(provider);
}

/**
 * Diploma fallback — no OAuth SDK required.
 * Signs in (or registers) preset Google/Facebook demo users on Facade.API via email/password.
 * Returns the same shape as registerAndLogin / loginWithPassword from AuthContext.
 */
export async function apiDemoSocialLogin(provider, { loginWithPassword, registerAndLogin }) {
  const template = getSocialProfileTemplate(provider);
  const profileFallback = {
    ...template,
    authProvider: provider,
  };

  clearAuthTokens();

  const loginResult = await loginWithPassword({
    email: template.email,
    password: DEMO_SOCIAL_PASSWORD,
    profileFallback,
  });
  if (loginResult.ok) {
    return loginResult;
  }

  return registerAndLogin({
    email: template.email,
    password: DEMO_SOCIAL_PASSWORD,
    profileFallback,
  });
}
