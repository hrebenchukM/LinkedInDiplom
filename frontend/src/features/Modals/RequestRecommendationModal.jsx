import React, { useState } from 'react';
import Modal from '../../app/ui/Modal';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import { debugLog } from '../../shared/lib/debugSession.js';

const RequestRecommendationModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // #region agent log
      debugLog(
        'RequestRecommendationModal.jsx:handleSubmit',
        'recommendation request submitted',
        { queryLength: query.length },
        'A',
        'post-fix',
      );
    // #endregion

    setNotice(
      t(
        'profile.modal.requestRecommendation.sent',
        'Request saved locally. Full recommendation flow is coming soon.',
      ),
    );
    setSearchQuery('');
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('profile.modal.requestRecommendation.title', 'Request for recommendation')}>
      <form onSubmit={handleSubmit}>
        <p style={{ fontSize: '16px', color: '#1f2937', marginBottom: '16px' }}>
          {t('profile.modal.requestRecommendation.personalize', 'Help us personalize the question')}
        </p>

        <div className="form-hint" style={{ marginBottom: '20px' }}>
          {t('profile.modal.mandatoryField', 'Mandatory field')}
        </div>

        <div className="form-group">
          <label className="form-label required">
            {t('profile.modal.requestRecommendation.who', 'Who to send the request to?')}
          </label>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#7c3aed' }}>
              {t('profile.modal.requestRecommendation.searchPeople', 'Search for people *')}
            </span>
          </div>
          <input
            type="text"
            className="form-input"
            placeholder={t('profile.modal.requestRecommendation.namePlaceholder', 'Name')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            required
          />
        </div>

        {notice ? <p className="profile-upload-success">{notice}</p> : null}

        <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
          <button type="submit" className="btn btn-primary">
            {t('profile.modal.requestRecommendation.continue', 'Continued')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RequestRecommendationModal;
