import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import { AI_ASSISTANT_CHAT_ID } from '../messaging/aiAssistantSession.js';
import './AiAssistantHomeToast.css';

const SESSION_KEY = 'linkup.aiHomePromptShown';

export default function AiAssistantHomeToast({ enabled = true, delayMs = 10000 }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;

    try {
      if (sessionStorage.getItem(SESSION_KEY) === '1') return undefined;
    } catch {
      /* ignore */
    }

    const timer = setTimeout(() => {
      setVisible(true);
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        /* ignore */
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [enabled, delayMs]);

  if (!visible) return null;

  return (
    <div className="ai-home-toast" role="status" aria-live="polite">
      <button
        type="button"
        className="ai-home-toast-close"
        onClick={() => setVisible(false)}
        aria-label={t('common.close', 'Close')}
      >
        <X size={18} />
      </button>

      <div className="ai-home-toast-icon">
        <Sparkles size={22} />
      </div>

      <div className="ai-home-toast-content">
        <strong>{t('home.aiToast.title', 'AI Assistant')}</strong>
        <p>{t('home.aiToast.message', 'Need help navigating LinkUp? I can guide you to profile, network, jobs and more.')}</p>
        <button
          type="button"
          className="ai-home-toast-action"
          onClick={() => {
            setVisible(false);
            navigate(`/app/messages/${AI_ASSISTANT_CHAT_ID}`);
          }}
        >
          {t('home.aiToast.action', 'Open chat')}
        </button>
      </div>
    </div>
  );
}
