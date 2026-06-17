import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

/**
 * Unified loading/error UI for data-fetch surfaces (stores + pages).
 * Expects: isLoading, loadError ("" when OK), optional onRetry.
 */
export function LoadStatus({ isLoading, loadError, onRetry, className = '' }) {
  const { t } = useTranslation();

  if (!loadError && !isLoading) return null;

  const wrapperClass = className ? `load-status ${className}` : 'load-status';

  return (
    <div className={wrapperClass}>
      {loadError ? (
        <div className="vac-people__alert" role="alert">
          <p className="vac-people__alert-text">{loadError}</p>
          {onRetry ? (
            <button type="button" className="vac-people__retry" onClick={onRetry}>
              {t('common.retry', 'Retry')}
            </button>
          ) : null}
        </div>
      ) : null}
      {isLoading ? (
        <p className="vac-people__loading">{t('common.loading', 'Loading…')}</p>
      ) : null}
    </div>
  );
}
