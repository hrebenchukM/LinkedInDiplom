/**
 * Feature flags for merge / integration.
 * Backend team: keep VITE_USE_MOCK_AUTH=false in real environments.
 */
export const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === "true";

/** Demo-only guest access (no JWT). Off by default for backend merge. */
export const ENABLE_GUEST = import.meta.env.VITE_ENABLE_GUEST === "true";

/** Home, network, chat, vacancies, profile still use local demo data until wired to API. */
export const UI_USES_LOCAL_DEMO_DATA = true;
