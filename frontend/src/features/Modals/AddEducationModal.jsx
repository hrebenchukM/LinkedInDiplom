import React, { useState } from 'react';
import Modal from '../../app/ui/Modal';
import { createEducation } from '../professional/professionalApi.js';
import { mapEducationToRequest } from '../professional/mapProfessional.js';
import { getErrorMessage } from '../../shared/lib/apiError.js';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const AddEducationModal = ({ isOpen, onClose, onAdded }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    school: '',
    degree: '',
    field: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    current: false,
    description: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.startMonth || !formData.startYear) {
      setError(t('profile.modal.startDateRequired', 'Start date is required.'));
      return;
    }

    setSubmitting(true);

    try {
      const payload = mapEducationToRequest(formData);
      await createEducation(payload);
      onAdded?.();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('profile.modal.addEducation.title', 'Adding education')}>
      <form onSubmit={handleSubmit}>
        <div className="form-hint">{t('profile.modal.mandatoryField', 'Mandatory field')}</div>

        {error ? <div className="auth-field-error">{error}</div> : null}

        <div className="form-group">
          <label className="form-label required">{t('profile.modal.addEducation.school', 'School')}</label>
          <input
            type="text"
            className="form-input"
            value={formData.school}
            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('profile.modal.addEducation.degree', 'Degree')}</label>
          <input
            type="text"
            className="form-input"
            value={formData.degree}
            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('profile.modal.addEducation.field', 'Field of study')}</label>
          <input
            type="text"
            className="form-input"
            value={formData.field}
            onChange={(e) => setFormData({ ...formData, field: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('profile.modal.addEducation.startDate', 'Start date')}</label>
            <select
              className="form-select"
              value={formData.startMonth}
              onChange={(e) => setFormData({ ...formData, startMonth: e.target.value })}
            >
              <option value="">{t('profile.modal.month', 'Month')}</option>
              {months.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <select
              className="form-select"
              value={formData.startYear}
              onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
            >
              <option value="">{t('profile.modal.year', 'Year')}</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('profile.modal.addEducation.endDate', 'End date')}</label>
            <select
              className="form-select"
              value={formData.endMonth}
              onChange={(e) => setFormData({ ...formData, endMonth: e.target.value })}
              disabled={formData.current}
            >
              <option value="">{t('profile.modal.month', 'Month')}</option>
              {months.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <select
              className="form-select"
              value={formData.endYear}
              onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
              disabled={formData.current}
            >
              <option value="">{t('profile.modal.year', 'Year')}</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', gap: 8 }}>
            <input
              type="checkbox"
              checked={formData.current}
              onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
            />
            <span className="form-label">{t('profile.modal.addEducation.currentlyStudy', 'I currently study here')}</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            {t('common.cancel', 'Cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? t('profile.saving', 'Saving...') : t('common.save', 'Save')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEducationModal;
