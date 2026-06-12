import { AUTH } from "./paths";
import { applyTokenDto, getRefreshToken, getTokenExpiresAt } from "./tokens";
import { buildApiUrl, parseJsonSafe } from "./http";

const REFRESH_BUFFER_MS = 60_000;
const MIN_DELAY_MS = 5_000;

let refreshTimerId = null;

export function cancelProactiveTokenRefresh() {
  if (refreshTimerId != null) {
    window.clearTimeout(refreshTimerId);
    refreshTimerId = null;
  }
}

async function runProactiveRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return;

  try {
    const response = await fetch(buildApiUrl(AUTH.refresh), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await parseJsonSafe(response);
    if (response.ok && data?.token?.accessToken) {
      applyTokenDto(data.token);
      return;
    }
  } catch {
    // reactive 401 refresh may still recover
  }

  scheduleProactiveTokenRefresh();
}

/** Schedule refresh ~1 min before stored expiresAt. */
export function scheduleProactiveTokenRefresh() {
  cancelProactiveTokenRefresh();

  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) return;

  const expiresMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresMs)) return;

  const delay = Math.max(expiresMs - Date.now() - REFRESH_BUFFER_MS, MIN_DELAY_MS);
  refreshTimerId = window.setTimeout(() => {
    refreshTimerId = null;
    void runProactiveRefresh();
  }, delay);
}
