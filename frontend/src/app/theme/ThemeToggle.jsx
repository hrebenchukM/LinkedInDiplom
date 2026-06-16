import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useTranslation } from '../i18n/LocaleContext.jsx';
import './ThemeToggle.css';

export function ThemeToggle({ variant = 'header', className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle theme-toggle--${variant} ${className}`.trim()}
      onClick={toggleTheme}
      title={isDark ? t('theme.light', 'Light') : t('theme.dark', 'Dark')}
      aria-label={isDark ? t('theme.enableLight', 'Enable light theme') : t('theme.enableDark', 'Enable dark theme')}
      aria-pressed={isDark}
    >
      {isDark ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
      {variant === 'header' ? <span>{isDark ? t('theme.light', 'Light') : t('theme.dark', 'Dark')}</span> : null}
    </button>
  );
}

export default ThemeToggle;
