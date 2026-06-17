import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import {
  AI_ASSISTANT_CHAT_ID,
  AI_HOME_TOAST_EVENT,
  AI_HOME_TOAST_PENDING_KEY,
  AI_HOME_TOAST_SHOWN_KEY,
} from '../messaging/aiAssistantSession.js';
import './AiAssistantHomeToast.css';

function readPendingFlag() {
  try {
    return sessionStorage.getItem(AI_HOME_TOAST_PENDING_KEY) === '1';
  } catch {
    return false;
  }
}

function shouldShowToast(isDemo) {
  if (readPendingFlag()) return true;

  try {
    return !isDemo && sessionStorage.getItem(AI_HOME_TOAST_SHOWN_KEY) !== '1';
  } catch {
    return !isDemo;
  }
}

function markToastHandled(isDemo) {
  try {
    sessionStorage.removeItem(AI_HOME_TOAST_PENDING_KEY);
    if (!isDemo) {
      sessionStorage.setItem(AI_HOME_TOAST_SHOWN_KEY, '1');
    }
  } catch {
    /* ignore */
  }
}

export default function AiAssistantHomeToast({
  enabled = true,
  isDemo = false,
  delayMs = 10000,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const scheduleToast = useCallback(() => {
    if (!enabled || !shouldShowToast(isDemo)) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setVisible(true);
      markToastHandled(isDemo);
      timerRef.current = null;
    }, delayMs);
  }, [delayMs, enabled, isDemo]);

  useEffect(() => {
    scheduleToast();

    const onPrompt = () => scheduleToast();
    window.addEventListener(AI_HOME_TOAST_EVENT, onPrompt);

    return () => {
      window.removeEventListener(AI_HOME_TOAST_EVENT, onPrompt);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [scheduleToast]);

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
        <p>
          {t(
            'home.aiToast.message',
            'Need help navigating LinkUp? I can guide you to profile, network, jobs and more.',
          )}
        </p>
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
