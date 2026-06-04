import { USE_MOCK_AUTH } from "../config/features";

/** True when the SPA should call Facade.API instead of local demo data. */
export function isBackendApiEnabled(session) {
  return !USE_MOCK_AUTH && Boolean(session?.isAuthenticated) && !session?.user?.isGuest;
}
