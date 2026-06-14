import { useCallback, useEffect, useRef, useState } from "react";
import { useUiSettings } from "../../app/providers/AppProviders";
import { API_FEEDBACK_EVENT } from "../lib/apiFeedback";

/**
 * Unified top-of-app banner for API/auth feedback.
 * Listen: `showApiFeedback()` / `api:feedback` event; `auth:expired` shows session message.
 */
export function ApiFeedbackBanner({ sessionExpiredMessage = "Session expired. Please sign in again." }) {
  const { t } = useUiSettings();
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("error");
  const hideTimerRef = useRef(null);

  const dismiss = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setMessage("");
  }, []);

  const show = useCallback(
    (text, nextVariant = "error", durationMs = 4200) => {
      const trimmed = String(text || "").trim();
      if (!trimmed) return;
      dismiss();
      setVariant(nextVariant);
      setMessage(trimmed);
      hideTimerRef.current = window.setTimeout(() => {
        setMessage("");
        hideTimerRef.current = null;
      }, durationMs);
    },
    [dismiss],
  );

  useEffect(() => {
    const onFeedback = (event) => {
      const detail = event?.detail || {};
      show(detail.message, detail.variant || "error", detail.durationMs ?? 4200);
    };

    const onAuthExpired = () => {
      show(sessionExpiredMessage, "error", 5000);
    };

    window.addEventListener(API_FEEDBACK_EVENT, onFeedback);
    window.addEventListener("auth:expired", onAuthExpired);
    return () => {
      window.removeEventListener(API_FEEDBACK_EVENT, onFeedback);
      window.removeEventListener("auth:expired", onAuthExpired);
      dismiss();
    };
  }, [dismiss, show, sessionExpiredMessage]);

  if (!message) return null;

  return (
    <div
      className={`api-feedback-banner api-feedback-banner--${variant}`}
      role="alert"
      aria-live="assertive"
    >
      <p className="api-feedback-banner__text">{message}</p>
      <button type="button" className="api-feedback-banner__close" onClick={dismiss} aria-label={t("common.dismiss", "Dismiss")}>
        ×
      </button>
    </div>
  );
}
