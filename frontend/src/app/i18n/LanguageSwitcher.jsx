import { useTranslation, SUPPORTED_LOCALES } from './LocaleContext.jsx';
import './LanguageSwitcher.css';

export default function LanguageSwitcher({ variant = 'footer' }) {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className={`language-switcher language-switcher--${variant}`}>
      {variant === 'footer' && (
        <label htmlFor="app-language-select">{t('nav.language', 'Language')}</label>
      )}
      <select
        id="app-language-select"
        className="language-switcher-select"
        value={locale}
        onChange={(event) => setLocale(event.target.value)}
        aria-label={t('nav.language', 'Language')}
      >
        {SUPPORTED_LOCALES.map((item) => (
          <option key={item.id} value={item.id}>
            {t(item.labelKey, item.id)}
          </option>
        ))}
      </select>
    </div>
  );
}
