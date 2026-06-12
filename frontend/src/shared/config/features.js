/**
 * Feature flags for merge / integration.
 * Production builds always use the real API — mock/demo paths are dev-only.
 */
const isProduction = import.meta.env.PROD;

/** In-browser mock auth — dev only; vite aliases mockAuthApi to a stub in production. */
export const USE_MOCK_AUTH =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_AUTH === "true";

/** Demo-only guest access (no JWT). Off by default; never enabled in production. */
export const ENABLE_GUEST =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_GUEST === "true";

/**
 * Diploma demo: preset Google/Facebook accounts on real API when OAuth SDK is not configured.
 * Dev — on by default (set VITE_ENABLE_DEMO_SOCIAL_FALLBACK=false to disable).
 * Production — off unless VITE_ENABLE_DEMO_SOCIAL_FALLBACK=true at build time.
 */
export const ENABLE_DEMO_SOCIAL_FALLBACK = isProduction
  ? import.meta.env.VITE_ENABLE_DEMO_SOCIAL_FALLBACK === "true"
  : import.meta.env.VITE_ENABLE_DEMO_SOCIAL_FALLBACK !== "false";

/**
 * Legacy flag for demo-only UI paths. When auth uses the real API, feature stores/pages
 * call Facade endpoints via isBackendApiEnabled() in shared/lib/backendApi.js.
 */
export const UI_USES_LOCAL_DEMO_DATA = USE_MOCK_AUTH;
