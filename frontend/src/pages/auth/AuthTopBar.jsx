import ThemeToggle from '../../app/theme/ThemeToggle.jsx';
import LanguageSwitcher from '../../app/i18n/LanguageSwitcher.jsx';
import './AuthTopBar.css';

export default function AuthTopBar() {
  return (
    <div className="auth-top-bar">
      <LanguageSwitcher variant="auth" />
      <ThemeToggle variant="auth" />
    </div>
  );
}
