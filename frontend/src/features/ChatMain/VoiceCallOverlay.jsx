import { useEffect, useState } from 'react';
import { Mic, MicOff, PhoneOff, Volume2 } from 'lucide-react';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import './VoiceCallOverlay.css';

const NO_ANSWER_MS = 18000;

export default function VoiceCallOverlay({ contact, onClose }) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState('calling');
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase('no-answer'), NO_ANSWER_MS);
    return () => window.clearTimeout(timer);
  }, [contact?.id]);

  useEffect(() => {
    if (phase !== 'no-answer') return undefined;

    const autoCloseTimer = window.setTimeout(() => {
      onClose?.({ reason: 'no-answer' });
    }, 2200);

    return () => window.clearTimeout(autoCloseTimer);
  }, [phase, onClose]);

  const statusLabel =
    phase === 'no-answer'
      ? t('chat.callNoAnswer', 'No answer')
      : t('chat.calling', 'Calling');

  return (
    <div className="voice-call-overlay" role="dialog" aria-modal="true" aria-label={t('chat.callOverlay', 'Voice call')}>
      <div className="voice-call-overlay__backdrop" />

      <div className="voice-call-overlay__content">
        <p className="voice-call-overlay__label">{t('chat.callOverlay', 'Voice call')}</p>
        <h2 className="voice-call-overlay__name">{contact?.name || t('chat.call', 'Call')}</h2>
        <p className={`voice-call-overlay__status${phase === 'calling' ? ' voice-call-overlay__status--pulse' : ''}`}>
          {statusLabel}
        </p>

        <div className="voice-call-avatar-wrap">
          <span className="voice-call-ring voice-call-ring--1" aria-hidden="true" />
          <span className="voice-call-ring voice-call-ring--2" aria-hidden="true" />
          <span className="voice-call-ring voice-call-ring--3" aria-hidden="true" />
          <img
            src={getAssetUrl(contact?.avatar || contact?.avatarSrc, IMAGE_PLACEHOLDERS.avatar)}
            alt=""
            className="voice-call-avatar"
          />
        </div>
      </div>

      <div className="voice-call-controls">
        <button
          type="button"
          className={`voice-call-control${muted ? ' voice-call-control--active' : ''}`}
          onClick={() => setMuted((value) => !value)}
          aria-label={muted ? t('chat.callUnmute', 'Unmute') : t('chat.callMute', 'Mute')}
        >
          {muted ? <MicOff size={22} /> : <Mic size={22} />}
          <span>{muted ? t('chat.callUnmute', 'Unmute') : t('chat.callMute', 'Mute')}</span>
        </button>

        <button
          type="button"
          className="voice-call-control voice-call-control--end"
          onClick={() => onClose?.({ reason: phase === 'calling' ? 'cancelled' : phase })}
          aria-label={t('chat.callEnd', 'End call')}
        >
          <PhoneOff size={26} />
        </button>

        <button
          type="button"
          className={`voice-call-control${speaker ? ' voice-call-control--active' : ''}`}
          onClick={() => setSpeaker((value) => !value)}
          aria-label={t('chat.callSpeaker', 'Speaker')}
        >
          <Volume2 size={22} />
          <span>{t('chat.callSpeaker', 'Speaker')}</span>
        </button>
      </div>
    </div>
  );
}
