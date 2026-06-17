import React, { useState } from 'react';
import Modal from '../../app/ui/Modal';
import {
  createCertificate,
  uploadCertificateFile,
} from '../professional/professionalApi.js';
import { mapCertificateToRequest } from '../professional/mapProfessional.js';
import { getErrorMessage } from '../../shared/lib/apiError.js';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const AddCertificateModal = ({ isOpen, onClose, onAdded }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    issueMonth: '',
    issueYear: '',
    expiryMonth: '',
    expiryYear: '',
    accreditationId: '',
    organizationUrl: '',
    file: null,
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

    if (!formData.issueMonth || !formData.issueYear) {
      setError(t('profile.modal.issueDateRequired', 'Issue date is required.'));
      return;
    }

    setSubmitting(true);

    try {
      const payload = mapCertificateToRequest(formData);
      const response = await createCertificate(payload);
      const certificateId =
        response?.certificate?.id ??
        response?.Certificate?.Id ??
        response?.id ??
        response?.Id;

      if (formData.file && certificateId) {
        await uploadCertificateFile(certificateId, formData.file);
      }

      onAdded?.();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('profile.modal.addCertificate.title', 'Adding a license or certificate')}>
      <form onSubmit={handleSubmit}>
        <div className="form-hint">{t('profile.modal.mandatoryField', 'Mandatory field')}</div>

        {error ? <div className="auth-field-error">{error}</div> : null}

        <div className="form-group">
          <label className="form-label required">{t('profile.modal.addCertificate.name', 'Name')}</label>
          <input
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label required">
            {t('profile.modal.addCertificate.organization', 'Organization that issued the certificate')}
          </label>
          <input
            className="form-input"
            value={formData.organization}
            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('profile.modal.addCertificate.issueDate', 'Date of issue')}</label>
            <select
              className="form-select"
              value={formData.issueMonth}
              onChange={(e) => setFormData({ ...formData, issueMonth: e.target.value })}
            >
              <option value="">{t('profile.modal.month', 'Month')}</option>
              {months.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <select
              className="form-select"
              value={formData.issueYear}
              onChange={(e) => setFormData({ ...formData, issueYear: e.target.value })}
            >
              <option value="">{t('profile.modal.year', 'Year')}</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('profile.modal.addCertificate.expiryDate', 'Expiry date')}</label>
            <select
              className="form-select"
              value={formData.expiryMonth}
              onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
            >
              <option value="">{t('profile.modal.month', 'Month')}</option>
              {months.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <select
              className="form-select"
              value={formData.expiryYear}
              onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
            >
              <option value="">{t('profile.modal.year', 'Year')}</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t('profile.modal.addCertificate.accreditationId', 'Accreditation ID')}</label>
          <input
            className="form-input"
            value={formData.accreditationId}
            onChange={(e) => setFormData({ ...formData, accreditationId: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('profile.modal.addCertificate.organizationUrl', 'Organization URL')}</label>
          <input
            className="form-input"
            value={formData.organizationUrl}
            onChange={(e) => setFormData({ ...formData, organizationUrl: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('profile.modal.addCertificate.pdf', 'Certificate PDF')}</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] ?? null })}
          />
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

export default AddCertificateModal;
