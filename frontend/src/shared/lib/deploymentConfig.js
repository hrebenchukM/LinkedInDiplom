import { getApiBaseUrl } from "../api/config";

/**
 * Startup checks for production / cross-origin deployment.
 * Logs warnings to the console — does not block the app.
 */
export function validateDeploymentConfig() {
  const issues = [];
  const isProd = import.meta.env.PROD;
  const apiBase = getApiBaseUrl();
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  if (isProd) {
    if (import.meta.env.VITE_USE_MOCK_AUTH === "true") {
      issues.push({
        level: "error",
        code: "mock-auth-in-prod",
        message:
          "VITE_USE_MOCK_AUTH=true in a production build. Rebuild with mock auth disabled.",
      });
    }

    if (apiBase && origin && !apiBase.startsWith(origin)) {
      issues.push({
        level: "warn",
        code: "cross-origin-api",
        message:
          `API base (${apiBase}) differs from SPA origin (${origin}). ` +
          "Ensure backend Cors:AllowedOrigins includes this frontend URL.",
      });
    }

    if (!apiBase) {
      issues.push({
        level: "info",
        code: "same-origin-api",
        message:
          "VITE_API_BASE_URL is empty — API calls use same origin (/api). " +
          "Configure reverse proxy or set VITE_API_BASE_URL at build time.",
      });
    }
  } else if (apiBase && origin && !apiBase.startsWith(origin)) {
    issues.push({
      level: "info",
      code: "dev-cross-origin",
      message:
        `Dev SPA (${origin}) calls API at ${apiBase}. ` +
        "Backend must allow this origin in Development CORS policy.",
    });
  }

  issues.forEach((issue) => {
    const prefix = `[LinkedInDiplom config:${issue.code}]`;
    if (issue.level === "error") console.error(prefix, issue.message);
    else if (issue.level === "warn") console.warn(prefix, issue.message);
    else console.info(prefix, issue.message);
  });

  return issues;
}
