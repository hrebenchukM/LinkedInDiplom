import React, { useEffect, useState } from 'react';
import Modal from '../../app/ui/Modal';
import { getErrorMessage } from '../../shared/lib/apiError';
import { createVacancy } from '../jobs/jobsApi';
import { mapVacancyToCreateRequest } from '../jobs/mapJobs';
import { getMyCompanies } from '../professional/professionalApi';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const PostJobModal = ({ isOpen, onClose, onPosted }) => {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    companyId: '',
    title: '',
    workplaceType: 'On-site',
    location: '',
    jobType: 'Full time',
    description: '',
    salaryFrom: '',
    salaryTo: '',
    currency: 'USD',
  });

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoadingCompanies(true);
    setError('');
    setFieldErrors({});

    getMyCompanies()
      .then((items) => {
        if (!cancelled) {
          setCompanies(items);
          if (items.length === 1) {
            setFormData((prev) => ({ ...prev, companyId: items[0].id }));
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingCompanies(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      companyId: companies.length === 1 ? companies[0].id : '',
      title: '',
      workplaceType: 'On-site',
      location: '',
      jobType: 'Full time',
      description: '',
      salaryFrom: '',
      salaryTo: '',
      currency: 'USD',
    });
    setError('');
    setFieldErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});

    if (!formData.companyId) {
      setError(t('vac.modal.selectCompanyError', 'Please select a company.'));
      return;
    }

    setSubmitting(true);

    try {
      const payload = mapVacancyToCreateRequest({
        ...formData,
        schedule: formData.workplaceType,
        employmentType: formData.jobType,
      });

      await createVacancy(payload);
      resetForm();
      onPosted?.();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
      if (err?.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const noCompanies = !loadingCompanies && companies.length === 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('vac.modal.postTitle', 'Post a job now')}>
      <form onSubmit={handleSubmit}>
        {loadingCompanies && (
          <p className="form-hint">{t('vac.modal.loadingCompanies', 'Loading your companies...')}</p>
        )}

        {noCompanies && (
          <p className="form-error">
            {t('vac.modal.noCompanies', 'Create a company page first')}
          </p>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="form-group">
          <label className="form-label">{t('vac.modal.company', 'Company')}</label>
          <select
            className="form-select"
            value={formData.companyId}
            onChange={(event) =>
              setFormData({ ...formData, companyId: event.target.value })
            }
            required
            disabled={noCompanies || loadingCompanies}
          >
            <option value="">{t('vac.modal.selectCompany', 'Select company')}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          {fieldErrors.companyId?.[0] && (
            <p className="form-field-error">{fieldErrors.companyId[0]}</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">{t('vac.modal.jobTitle', 'Job title')}</label>
          <input
            type="text"
            className="form-input"
            placeholder={t('vac.modal.jobTitlePlaceholder', 'Add the job you are hiring for')}
            value={formData.title}
            onChange={(event) => setFormData({ ...formData, title: event.target.value })}
            required
            disabled={noCompanies}
          />
          {fieldErrors.title?.[0] && (
            <p className="form-field-error">{fieldErrors.title[0]}</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">{t('vac.modal.workplaceType', 'Workplace type')}</label>
          <select
            className="form-select"
            value={formData.workplaceType}
            onChange={(event) =>
              setFormData({ ...formData, workplaceType: event.target.value })
            }
            disabled={noCompanies}
          >
            <option value="On-site">{t('vac.modal.workplace.onSite', 'On-site')}</option>
            <option value="Remote">{t('vac.modal.workplace.remote', 'Remote')}</option>
            <option value="Hybrid">{t('vac.modal.workplace.hybrid', 'Hybrid')}</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{t('vac.modal.region', 'Region of vacancies')}</label>
          <input
            type="text"
            className="form-input"
            placeholder={t('vac.modal.regionPlaceholder', 'Odesa, Odessa, Ukraine')}
            value={formData.location}
            onChange={(event) => setFormData({ ...formData, location: event.target.value })}
            required
            disabled={noCompanies}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('vac.modal.employmentType', 'Employment type')}</label>
          <select
            className="form-select"
            value={formData.jobType}
            onChange={(event) => setFormData({ ...formData, jobType: event.target.value })}
            disabled={noCompanies}
          >
            <option value="Full time">{t('vac.modal.employment.fullTime', 'Full time')}</option>
            <option value="Part time">{t('vac.modal.employment.partTime', 'Part time')}</option>
            <option value="Contract">{t('vac.modal.employment.contract', 'Contract')}</option>
            <option value="Freelance">{t('vac.modal.employment.freelance', 'Freelance')}</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{t('vac.modal.salaryFrom', 'Salary from')}</label>
          <input
            type="number"
            className="form-input"
            value={formData.salaryFrom}
            onChange={(event) => setFormData({ ...formData, salaryFrom: event.target.value })}
            disabled={noCompanies}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('vac.modal.salaryTo', 'Salary to')}</label>
          <input
            type="number"
            className="form-input"
            value={formData.salaryTo}
            onChange={(event) => setFormData({ ...formData, salaryTo: event.target.value })}
            disabled={noCompanies}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('vac.modal.currency', 'Currency')}</label>
          <input
            type="text"
            className="form-input"
            value={formData.currency}
            onChange={(event) => setFormData({ ...formData, currency: event.target.value })}
            disabled={noCompanies}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('vac.modal.description', 'Job description')}</label>
          <textarea
            className="form-textarea"
            placeholder={t('vac.modal.descriptionPlaceholder', 'Describe the role, responsibilities, and requirements...')}
            value={formData.description}
            onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            style={{ minHeight: '150px' }}
            disabled={noCompanies}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={noCompanies || submitting || loadingCompanies}
          >
            {submitting
              ? t('vac.postPublishing', 'Publishing...')
              : t('vac.modal.placeNow', 'Place now')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PostJobModal;
