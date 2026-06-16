import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import './ProfileCompletion.css';

export default function ProfileCompletionRing({ percent = 0, compact = false, large = false }) {
  const { t } = useTranslation();
  const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
  const radius = large ? 52 : compact ? 30 : 44;
  const stroke = large ? 8 : compact ? 5 : 7;
  const size = (radius + stroke) * 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safePercent / 100) * circumference;

  return (
    <div
      className={`profile-completion-ring${compact ? ' profile-completion-ring--compact' : ''}${large ? ' profile-completion-ring--large' : ''}`}
      aria-label={t('profile.completion.label', 'Profile completion {n}%', { n: safePercent })}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          className="profile-completion-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          className="profile-completion-ring__progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="profile-completion-ring__value">
        <strong>{safePercent}%</strong>
        {!compact ? (
          <span>{t('profile.completion.short', 'filled')}</span>
        ) : null}
      </div>
    </div>
  );
}
