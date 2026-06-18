import Modal from '../../app/ui/Modal';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import './VacancyDetailModal.css';

const VacancyDetailModal = ({
  isOpen,
  onClose,
  vacancy,
  posted,
  onApply,
  onWithdraw,
  onSearchSimilar,
  applying = false,
  withdrawing = false,
  applyError = '',
}) => {
  const { t } = useTranslation();

  if (!vacancy) return null;

  const companyName = vacancy.companyName ?? vacancy.company?.name ?? 'Company';
  const logoSrc = getAssetUrl(
    vacancy.companyLogo ?? vacancy.company?.logo,
    IMAGE_PLACEHOLDERS.company,
  );
  const hasApplied = Boolean(vacancy.hasApplied);
  const canApply = !vacancy.aiRecommendation && vacancy.id;

  const handleApply = async () => {
    if (!canApply || hasApplied || applying || withdrawing) return;
    await onApply?.(vacancy.id);
  };

  const handleWithdraw = async () => {
    if (!canApply || !hasApplied || applying || withdrawing) return;
    await onWithdraw?.(vacancy.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={vacancy.title}
      className="vacancy-detail-modal"
    >
      <div className="vacancy-detail-modal__content">
        <div className="vacancy-detail-modal__header">
          <img src={logoSrc} alt={companyName} className="vacancy-detail-modal__logo" />
          <div>
            <p className="vacancy-detail-modal__company">{companyName}</p>
            {vacancy.location ? (
              <p className="vacancy-detail-modal__meta">{vacancy.location}</p>
            ) : null}
            {vacancy.salary ? (
              <p className="vacancy-detail-modal__meta">{vacancy.salary}</p>
            ) : null}
            {posted ? (
              <p className="vacancy-detail-modal__meta">{posted}</p>
            ) : null}
          </div>
        </div>

        {vacancy.employmentType || vacancy.schedule || vacancy.experienceLevel ? (
          <div className="vacancy-detail-modal__tags">
            {vacancy.employmentType ? <span>{vacancy.employmentType}</span> : null}
            {vacancy.schedule ? <span>{vacancy.schedule}</span> : null}
            {vacancy.experienceLevel ? <span>{vacancy.experienceLevel}</span> : null}
          </div>
        ) : null}

        <div className="vacancy-detail-modal__description">
          {vacancy.description || vacancy.location || t('vac.detail.noDescription', 'No description provided.')}
        </div>

        {vacancy.aiRecommendation ? (
          <p className="vacancy-detail-modal__ai-note">
            {t('vac.detail.aiNote', 'AI suggestion based on your profile. Search for similar roles to apply.')}
          </p>
        ) : null}

        {applyError ? <p className="vacancy-detail-modal__error">{applyError}</p> : null}

        <div className="vacancy-detail-modal__actions">
          {canApply ? (
            <button
              type="button"
              className={`vacancy-detail-modal__apply${hasApplied ? ' is-applied' : ''}`}
              onClick={hasApplied ? handleWithdraw : handleApply}
              disabled={applying || withdrawing}
            >
              {applying
                ? t('vac.card.applying', 'Applying...')
                : withdrawing
                  ? t('vac.withdraw', 'Withdraw')
                  : hasApplied
                    ? t('vac.withdraw', 'Withdraw')
                    : t('vac.card.apply', 'Be among the candidates')}
            </button>
          ) : (
            <button
              type="button"
              className="vacancy-detail-modal__apply"
              onClick={() => {
                onSearchSimilar?.(vacancy);
                onClose?.();
              }}
            >
              {t('vac.rec.searchSimilar', 'Search similar vacancies')}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default VacancyDetailModal;
