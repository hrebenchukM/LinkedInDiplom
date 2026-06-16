import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import './admin.css';

export default function AdminForbiddenPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="container">
      <div className="admin-forbidden">
        <h1>{t('admin.forbidden.title', 'Access denied')}</h1>
        <p>{t('admin.forbidden.text', 'This section is available only to users with the Admin role.')}</p>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => navigate('/app')}
        >
          {t('admin.backToApp', 'Back to app')}
        </button>
      </div>
    </div>
  );
}
