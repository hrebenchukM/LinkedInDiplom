/** Override at runtime: localStorage.setItem("apiBaseUrl", "http://localhost:5000") */
export function getApiBaseUrl() {
  try {
    const override = window.localStorage.getItem("apiBaseUrl");
    if (override) return String(override).replace(/\/$/, "");
  } catch {
    // ignore
  }

  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (fromEnv !== undefined && String(fromEnv).trim() !== "") {
    return String(fromEnv).replace(/\/$/, "");
  }

  return "";
}
