import React, { useState } from 'react';
import { Bookmark, X } from 'lucide-react';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import '../VacancyCard/VacancyCard.css';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import SafeImage from '../../shared/ui/SafeImage';

const VacancyCard = ({
  vacancy,
  company,
  logo,
  position,
  location,
  salary,
  posted,
  status,
  onApply,
  onToggleFavorite,
  actionError,
  favoriteError,
}) => {
  const { t } = useTranslation();
  const [applying, setApplying] = useState(false);

  const data = vacancy ?? {
    id: null,
    companyName: company,
    companyLogo: logo,
    title: position,
    location,
    salary,
    hasApplied: false,
    isFavorite: false,
  };

  const logoSrc = getAssetUrl(
    data.companyLogo || data.company?.logo || logo,
    IMAGE_PLACEHOLDERS.company,
  );
  const companyName = data.companyName || company || 'Company';
  const title = data.title || position || '';
  const locationText = data.location || location || '';
  const salaryText = data.salary || salary || t('vac.card.salaryUnknown', 'Salary not specified');
  const postedText = posted || '';
  const statusText = data.hasApplied
    ? t('vac.card.applied', 'Applied')
    : (status || t('vac.card.apply', 'Be among the candidates'));

  const handleApply = async (event) => {
    event.preventDefault();
    if (!onApply || !data.id || data.hasApplied || applying) return;

    setApplying(true);
    try {
      await onApply(data.id);
    } finally {
      setApplying(false);
    }
  };

  const handleFavorite = (event) => {
    event.preventDefault();
    if (!onToggleFavorite || !data.id) return;
    onToggleFavorite(data.id, Boolean(data.isFavorite));
  };

  return (
    <div className="vacancy-card">
      <div className="vacancy-header">
        <div className="vacancy-top">
          <SafeImage
            src={logoSrc}
            fallback={IMAGE_PLACEHOLDERS.company}
            alt={companyName}
            className="vacancy-logo"
          />
          <h3 className="vacancy-company">{companyName}</h3>
        </div>
        {onToggleFavorite ? (
          <button
            type="button"
            className={`vacancy-dismiss ${data.isFavorite ? 'is-favorite' : ''}`}
            onClick={handleFavorite}
            aria-label={
              data.isFavorite
                ? t('vac.card.removeFavorite', 'Remove from favorites')
                : t('vac.card.save', 'Save vacancy')
            }
          >
            <Bookmark size={20} fill={data.isFavorite ? 'currentColor' : 'none'} />
          </button>
        ) : (
          <button type="button" className="vacancy-dismiss" aria-label={t('common.dismissAction', 'Dismiss')}>
            <X size={20} />
          </button>
        )}
      </div>

      <div className="vacancy-details">
        <h4 className="vacancy-position">{title}</h4>
        {locationText ? <p className="vacancy-location">{locationText}</p> : null}
        <p className="vacancy-salary">{salaryText}</p>
        {(actionError || favoriteError) ? (
          <p className="vacancy-action-error">{actionError || favoriteError}</p>
        ) : null}
      </div>

      <div className="vacancy-footer">
        <span className="vacancy-posted">{postedText}</span>
        <span className="vacancy-separator">•</span>
        {onApply ? (
          <button
            type="button"
            className={`vacancy-status-btn ${data.hasApplied ? 'is-applied' : ''}`}
            onClick={handleApply}
            disabled={data.hasApplied || applying}
          >
            {applying ? t('vac.card.applying', 'Applying...') : statusText}
          </button>
        ) : (
          <a href="#" className="vacancy-status">{statusText}</a>
        )}
      </div>
    </div>
  );
};

export default VacancyCard;
