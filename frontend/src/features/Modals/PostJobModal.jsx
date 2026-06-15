import React, { useEffect, useState } from 'react';
import Modal from '../../app/ui/Modal';
import { getErrorMessage } from '../../shared/lib/apiError';
import { createVacancy } from '../jobs/jobsApi';
import { mapVacancyToCreateRequest } from '../jobs/mapJobs';
import { getMyCompanies } from '../professional/professionalApi';

const PostJobModal = ({ isOpen, onClose, onPosted }) => {
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
      setError('Please select a company.');
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Post a job now">
      <form onSubmit={handleSubmit}>
        {loadingCompanies && (
          <p className="form-hint">Loading your companies...</p>
        )}

        {noCompanies && (
          <p className="form-error">
            Сначала создайте компанию/страницу компании
          </p>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="form-group">
          <label className="form-label">Company</label>
          <select
            className="form-select"
            value={formData.companyId}
            onChange={(event) =>
              setFormData({ ...formData, companyId: event.target.value })
            }
            required
            disabled={noCompanies || loadingCompanies}
          >
            <option value="">Select company</option>
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
          <label className="form-label">Job title</label>
          <input
            type="text"
            className="form-input"
            placeholder="Add the job you are hiring for"
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
          <label className="form-label">Workplace type</label>
          <select
            className="form-select"
            value={formData.workplaceType}
            onChange={(event) =>
              setFormData({ ...formData, workplaceType: event.target.value })
            }
            disabled={noCompanies}
          >
            <option value="On-site">On-site</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Region of vacancies</label>
          <input
            type="text"
            className="form-input"
            placeholder="Odesa, Odessa, Ukraine"
            value={formData.location}
            onChange={(event) => setFormData({ ...formData, location: event.target.value })}
            required
            disabled={noCompanies}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Employment type</label>
          <select
            className="form-select"
            value={formData.jobType}
            onChange={(event) => setFormData({ ...formData, jobType: event.target.value })}
            disabled={noCompanies}
          >
            <option value="Full time">Full time</option>
            <option value="Part time">Part time</option>
            <option value="Contract">Contract</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Salary from</label>
          <input
            type="number"
            className="form-input"
            value={formData.salaryFrom}
            onChange={(event) => setFormData({ ...formData, salaryFrom: event.target.value })}
            disabled={noCompanies}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Salary to</label>
          <input
            type="number"
            className="form-input"
            value={formData.salaryTo}
            onChange={(event) => setFormData({ ...formData, salaryTo: event.target.value })}
            disabled={noCompanies}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Currency</label>
          <input
            type="text"
            className="form-input"
            value={formData.currency}
            onChange={(event) => setFormData({ ...formData, currency: event.target.value })}
            disabled={noCompanies}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Job description</label>
          <textarea
            className="form-textarea"
            placeholder="Describe the role, responsibilities, and requirements..."
            value={formData.description}
            onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            style={{ minHeight: '150px' }}
            disabled={noCompanies}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={noCompanies || submitting || loadingCompanies}
          >
            {submitting ? 'Posting...' : 'Place now'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PostJobModal;
