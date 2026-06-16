import React, { useEffect, useState } from 'react';
import Modal from '../../app/ui/Modal';
import { getErrorMessage } from '../../shared/lib/apiError';
import { createVacancy } from '../jobs/jobsApi';
import { mapVacancyToCreateRequest } from '../jobs/mapJobs';
import { createMyCompany, getMyCompanies } from '../professional/professionalApi';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const PostJobModal = ({ isOpen, onClose, onPosted }) => {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
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
    setNewCompanyName('');

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
    setNewCompanyName('');
    setError('');
    setFieldErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resolveCompanyId = async () => {
    if (formData.companyId) {
      return formData.companyId;
    }

    const name = newCompanyName.trim();
    if (!name) {
      throw new Error(t('vac.modal.selectCompanyError', 'Please select a company.'));
    }

    const company = await createMyCompany({
      name,
      location: formData.location.trim() || undefined,
    });

    if (!company?.id) {
      throw new Error(t('vac.modal.companyCreateFailed', 'Could not create company.'));
    }

    setCompanies((prev) => {
      const exists = prev.some((item) => item.id === company.id);
      return exists ? prev : [...prev, company];
    });
    setFormData((prev) => ({ ...prev, companyId: company.id }));
    setNewCompanyName('');
    return company.id;
  };

  const handleCreateCompany = async () => {
    const name = newCompanyName.trim();
    if (!name) {
      setError(t('vac.modal.companyNameRequired', 'Enter a company name.'));
      return;
    }

    setCreatingCompany(true);
    setError('');

    try {
      await resolveCompanyId();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreatingCompany(false);
    }
  };

  const handleCreateCompanyKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleCreateCompany();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});

    if (!formData.title.trim()) {
      setError(t('vac.modal.jobTitleRequired', 'Enter a job title.'));
      return;
    }

    setSubmitting(true);

    try {
      const companyId = await resolveCompanyId();
      const payload = mapVacancyToCreateRequest({
        ...formData,
        companyId,
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
  const hasCompany = Boolean(formData.companyId);
  const busy = loadingCompanies || creatingCompany || submitting;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('vac.modal.postTitle', 'Post a job now')}
      footer={(
        <>
          <button
            type="button"
            className="modal-btn modal-btn--secondary"
            onClick={handleClose}
            disabled={submitting}
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            form="post-job-form"
            className="modal-btn modal-btn--primary"
            disabled={busy}
          >
            {submitting
              ? t('vac.postPublishing', 'Publishing...')
              : t('vac.modal.placeNow', 'Place now')}
          </button>
        </>
      )}
    >
      <form id="post-job-form" onSubmit={handleSubmit}>
          {loadingCompanies && (
            <p className="form-hint">{t('vac.modal.loadingCompanies', 'Loading your companies...')}</p>
          )}

          {noCompanies && !hasCompany && (
            <div className="form-group">
              <p className="form-hint">
                {t('vac.modal.noCompanies', 'Create a company page first')}
              </p>
              <label className="form-label" htmlFor="post-job-company-name">
                {t('vac.modal.newCompanyName', 'Company name')}
              </label>
              <div className="post-job-create-company">
                <input
                  id="post-job-company-name"
                  type="text"
                  className="form-input"
                  placeholder={t('vac.modal.newCompanyPlaceholder', 'e.g. LinkUp Tech')}
                  value={newCompanyName}
                  onChange={(event) => setNewCompanyName(event.target.value)}
                  onKeyDown={handleCreateCompanyKeyDown}
                  disabled={creatingCompany}
                />
                <button
                  type="button"
                  className="modal-btn modal-btn--primary"
                  onClick={handleCreateCompany}
                  disabled={creatingCompany}
                >
                  {creatingCompany
                    ? t('vac.modal.creatingCompany', 'Creating...')
                    : t('vac.modal.createCompany', 'Create company')}
                </button>
              </div>
            </div>
          )}

          {error && <p className="form-error">{error}</p>}

          {hasCompany && (
            <div className="form-group">
              <label className="form-label">{t('vac.modal.company', 'Company')}</label>
              <select
                className="form-select"
                value={formData.companyId}
                onChange={(event) =>
                  setFormData({ ...formData, companyId: event.target.value })
                }
                disabled={busy}
              >
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
          )}

          <div className="form-group">
            <label className="form-label">{t('vac.modal.jobTitle', 'Job title')}</label>
            <input
              type="text"
              className="form-input"
              placeholder={t('vac.modal.jobTitlePlaceholder', 'Add the job you are hiring for')}
              value={formData.title}
              onChange={(event) => setFormData({ ...formData, title: event.target.value })}
              disabled={busy}
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
              disabled={busy}
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
              disabled={busy}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('vac.modal.employmentType', 'Employment type')}</label>
            <select
              className="form-select"
              value={formData.jobType}
              onChange={(event) => setFormData({ ...formData, jobType: event.target.value })}
              disabled={busy}
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
              disabled={busy}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('vac.modal.salaryTo', 'Salary to')}</label>
            <input
              type="number"
              className="form-input"
              value={formData.salaryTo}
              onChange={(event) => setFormData({ ...formData, salaryTo: event.target.value })}
              disabled={busy}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('vac.modal.currency', 'Currency')}</label>
            <input
              type="text"
              className="form-input"
              value={formData.currency}
              onChange={(event) => setFormData({ ...formData, currency: event.target.value })}
              disabled={busy}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('vac.modal.description', 'Job description')}</label>
            <textarea
              className="form-textarea"
              placeholder={t('vac.modal.descriptionPlaceholder', 'Describe the role, responsibilities, and requirements...')}
              value={formData.description}
            onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            rows={5}
            disabled={busy}
            />
          </div>
      </form>
    </Modal>
  );
};

export default PostJobModal;
