import { useAuth } from "../../features/auth/AuthContext";
import { isBackendApiEnabled } from "../lib/backendApi";

/** Waits for auth bootstrap before enabling Facade.API calls. */
export function useBackendApi() {
  const { session, isReady } = useAuth();
  return isBackendApiEnabled(session, isReady);
}
