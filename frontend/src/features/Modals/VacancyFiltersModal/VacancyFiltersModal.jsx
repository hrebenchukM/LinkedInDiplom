import React, { useState } from 'react';
import './VacancyFiltersModal.css';
import Modal from '../../../app/ui/Modal';
import { useTranslation } from '../../../app/i18n/LocaleContext.jsx';

const VacancyFiltersModal = ({ isOpen, onClose, onApplyFilters }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    location: [],
    jobType: [],
    experienceLevel: [],
    salaryRange: [0, 300000],
    sortBy: 'newest',
    sortDirection: 'desc',
  });

  const locations = [
    { value: 'Remote', key: 'vac.filters.remote' },
    { value: 'On-site', key: 'vac.filters.onSite' },
    { value: 'Hybrid', key: 'vac.filters.hybrid' },
  ];
  const jobTypes = [
    { value: 'Full-time', key: 'vac.filters.fullTime' },
    { value: 'Part-time', key: 'vac.filters.partTime' },
    { value: 'Contract', key: 'vac.filters.contract' },
    { value: 'Internship', key: 'vac.filters.internship' },
  ];
  const experienceLevels = [
    { value: 'Entry level', key: 'vac.filters.entryLevel' },
    { value: 'Mid-level', key: 'vac.filters.midLevel' },
    { value: 'Senior', key: 'vac.filters.senior' },
    { value: 'Lead', key: 'vac.filters.lead' },
  ];

  const toggleArrayValue = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const handleApply = () => {
    onApplyFilters?.({
      ...filters,
      employmentType: filters.jobType,
      schedule: filters.location,
    });
    onClose();
  };

  const handleReset = () => {
    const emptyFilters = {
      location: [],
      jobType: [],
      experienceLevel: [],
      salaryRange: [0, 300000],
      sortBy: 'newest',
      sortDirection: 'desc',
    };
    setFilters(emptyFilters);
    onApplyFilters?.(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('vac.filters.title', 'Filter Vacancies')}>
      <div className="vacancy-filters-modal">

        <div className="filter-section">
          <h3>{t('vac.filters.sortBy', 'Sort by')}</h3>
          <select
            className="form-select"
            value={filters.sortBy}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, sortBy: event.target.value }))
            }
          >
            <option value="newest">{t('vac.filters.newest', 'Newest')}</option>
            <option value="title">{t('vac.filters.sortTitle', 'Title')}</option>
            <option value="location">{t('vac.filters.sortLocation', 'Location')}</option>
            <option value="updated">{t('vac.filters.recentlyUpdated', 'Recently updated')}</option>
          </select>
        </div>

        <div className="filter-section">
          <h3>{t('vac.filters.workplaceType', 'Workplace type')}</h3>
          <div className="filter-options">
            {locations.map((location) => (
              <label key={location.value} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.location.includes(location.value)}
                  onChange={() => toggleArrayValue('location', location.value)}
                />
                <span>{t(location.key, location.value)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h3>{t('vac.filters.jobType', 'Job Type')}</h3>
          <div className="filter-options">
            {jobTypes.map((jobType) => (
              <label key={jobType.value} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.jobType.includes(jobType.value)}
                  onChange={() => toggleArrayValue('jobType', jobType.value)}
                />
                <span>{t(jobType.key, jobType.value)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h3>{t('vac.filters.experienceLevel', 'Experience Level')}</h3>
          <p className="filter-hint">{t('vac.filters.pageOnly', 'Applied on the current page only')}</p>
          <div className="filter-options">
            {experienceLevels.map((level) => (
              <label key={level.value} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.experienceLevel.includes(level.value)}
                  onChange={() => toggleArrayValue('experienceLevel', level.value)}
                />
                <span>{t(level.key, level.value)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h3>{t('vac.filters.salaryRange', 'Salary Range')}</h3>
          <p className="filter-hint">{t('vac.filters.pageOnly', 'Applied on the current page only')}</p>
          <div className="salary-range">
            <input
              type="number"
              placeholder={t('vac.filters.min', 'Min')}
              value={filters.salaryRange[0]}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  salaryRange: [
                    Number(event.target.value) || 0,
                    prev.salaryRange[1],
                  ],
                }))
              }
            />
            <span>—</span>
            <input
              type="number"
              placeholder={t('vac.filters.max', 'Max')}
              value={filters.salaryRange[1]}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  salaryRange: [
                    prev.salaryRange[0],
                    Number(event.target.value) || 300000,
                  ],
                }))
              }
            />
          </div>
        </div>

        <div className="filter-actions">
          <button
            type="button"
            className="filter-btn-secondary"
            onClick={handleReset}
          >
            {t('vac.filters.reset', 'Reset')}
          </button>
          <button
            type="button"
            className="filter-btn-primary"
            onClick={handleApply}
          >
            {t('vac.filters.apply', 'Apply')}
          </button>
        </div>

      </div>
    </Modal>
  );
};

export default VacancyFiltersModal;
