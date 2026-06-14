const API_FEEDBACK_EVENT = "api:feedback";

/** Show a global API error/info banner (see ApiFeedbackBanner). */
export function showApiFeedback(message, { variant = "error", durationMs = 4200 } = {}) {
  const text = String(message || "").trim();
  if (!text || typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(API_FEEDBACK_EVENT, {
      detail: { message: text, variant, durationMs },
    }),
  );
}

export { API_FEEDBACK_EVENT };
