import { clearAuthTokens } from "../../shared/api/tokens";
import { USE_MOCK_AUTH } from "../../shared/config/features";

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

/**
 * API-backed demo social login: register or sign in preset accounts on Facade.API.
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

export function usesMockSocialFlow() {
  return USE_MOCK_AUTH;
}
