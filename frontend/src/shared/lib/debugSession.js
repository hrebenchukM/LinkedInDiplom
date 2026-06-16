const DEBUG_ENDPOINT = 'http://127.0.0.1:7789/ingest/77ecd818-f22e-49f9-975c-5bffaddb226d';
const DEBUG_SESSION = '306ecf';

export function debugLog(location, message, data = {}, hypothesisId = 'general', runId = 'pre-fix') {
  if (!import.meta.env.DEV) return;

  const payload = {
    sessionId: DEBUG_SESSION,
    location,
    message,
    data,
    hypothesisId,
    runId,
    timestamp: Date.now(),
  };

  // #region agent log
  fetch(DEBUG_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': DEBUG_SESSION,
    },
    body: JSON.stringify(payload),
  }).catch(() => {});

  fetch('/__agent_debug/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
  // #endregion
}

export function describeButton(button) {
  if (!button) return null;

  const label =
    button.getAttribute('aria-label') ||
    button.textContent?.trim().replace(/\s+/g, ' ').slice(0, 120) ||
    '';

  return {
    tag: button.tagName,
    type: button.getAttribute('type') || null,
    className: button.className?.slice?.(0, 160) || '',
    label,
    disabled: button.disabled,
    hasOnClick: typeof button.onclick === 'function',
    path: window.location.pathname,
  };
}
