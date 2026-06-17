import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import ProfileCompletionRing from './ProfileCompletionRing.jsx';
import './ProfileCompletion.css';

const ITEM_LABEL_KEYS = {
  avatar: 'profile.completion.item.avatar',
  cover: 'profile.completion.item.cover',
  experience: 'profile.completion.item.experience',
  education: 'profile.completion.item.education',
  skills: 'profile.completion.item.skills',
  resume: 'profile.completion.item.resume',
};

export default function ProfileCompletionPanel({ completion }) {
  const { t } = useTranslation();
  const percent = completion?.percent ?? 0;
  const items = completion?.items ?? [];

  const missing = items.filter((item) => !item.done).slice(0, 4);

  return (
    <aside className="profile-completion-panel">
      <h3 className="profile-completion-panel__title">
        {t('profile.completion.title', 'Profile strength')}
      </h3>
      <div className="profile-completion-panel__body">
        <ProfileCompletionRing percent={percent} large />
        <p className="profile-completion-panel__hint">
          {percent >= 100
            ? t('profile.completion.complete', 'Your profile looks great!')
            : t(
                'profile.completion.hint',
                'Complete your profile to get more visibility in search and recommendations.',
              )}
        </p>
      </div>
      {missing.length > 0 ? (
        <ul className="profile-completion-panel__list">
          {missing.map((item) => (
            <li key={item.key} className={item.done ? 'is-done' : ''}>
              {t(
                ITEM_LABEL_KEYS[item.key] || item.key,
                item.key,
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}
