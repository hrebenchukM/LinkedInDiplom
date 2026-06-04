import { useUiSettings } from "../../app/providers/AppProviders";

export function AiWelcomeToast({ visible, onAccept, onDismiss }) {
  const { t } = useUiSettings();

  if (!visible) return null;

  return (
    <div className="ai-toast-stack" role="region" aria-live="polite">
      <article className="ai-toast">
        <button
          type="button"
          className="ai-toast__close"
          aria-label={t("notify.toast.dismiss", "Dismiss")}
          onClick={(event) => {
            event.stopPropagation();
            onDismiss?.();
          }}
        >
          ×
        </button>

        <button type="button" className="ai-toast__main" onClick={onAccept}>
          <span className="ai-toast__avatar" aria-hidden="true">
            AI
          </span>
          <span className="ai-toast__text">
            <span className="ai-toast__name">{t("notify.aiAssistantName", "AI Assistant")}</span>
            <span className="ai-toast__preview">
              {t("notify.toast.aiMessage", "Welcome! I can help you set up your profile and connect with the right people.")}
            </span>
          </span>
        </button>
      </article>
    </div>
  );
}
