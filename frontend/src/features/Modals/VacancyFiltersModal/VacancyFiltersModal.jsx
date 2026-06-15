import React, { useState } from 'react';
import './VacancyFiltersModal.css';
import Modal from '../../../app/ui/Modal';

const VacancyFiltersModal = ({ isOpen, onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    location: [],
    jobType: [],
    experienceLevel: [],
    salaryRange: [0, 300000]
  });

  const locations = ['Remote', 'On-site', 'Hybrid'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const experienceLevels = ['Entry level', 'Mid-level', 'Senior', 'Lead'];

  const toggleArrayValue = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const handleApply = () => {
    onApplyFilters({ ...filters }); // 👉 передаём фильтры наверх
    onClose();
  };

  const handleReset = () => {
    const emptyFilters = {
      location: [],
      jobType: [],
      experienceLevel: [],
      salaryRange: [0, 300000]
    };
    setFilters(emptyFilters);
    onApplyFilters(null); // 👉 полный сброс фильтра
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filter Vacancies">
      <div className="vacancy-filters-modal">

        {/* ===== LOCATION ===== */}
        <div className="filter-section">
          <h3>Location</h3>
          <div className="filter-options">
            {locations.map(l => (
              <label key={l} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.location.includes(l)}
                  onChange={() => toggleArrayValue('location', l)}
                />
                <span>{l}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ===== JOB TYPE ===== */}
        <div className="filter-section">
          <h3>Job Type</h3>
          <div className="filter-options">
            {jobTypes.map(t => (
              <label key={t} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.jobType.includes(t)}
                  onChange={() => toggleArrayValue('jobType', t)}
                />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ===== EXPERIENCE LEVEL ===== */}
        <div className="filter-section">
          <h3>Experience Level</h3>
          <div className="filter-options">
            {experienceLevels.map(e => (
              <label key={e} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.experienceLevel.includes(e)}
                  onChange={() => toggleArrayValue('experienceLevel', e)}
                />
                <span>{e}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ===== SALARY ===== */}
        <div className="filter-section">
          <h3>Salary Range</h3>
          <div className="salary-range">
            <input
              type="number"
              placeholder="Min"
              value={filters.salaryRange[0]}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  salaryRange: [
                    Number(e.target.value) || 0,
                    prev.salaryRange[1]
                  ]
                }))
              }
            />
            <span>—</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.salaryRange[1]}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  salaryRange: [
                    prev.salaryRange[0],
                    Number(e.target.value) || 300000
                  ]
                }))
              }
            />
          </div>
        </div>

        {/* ===== ACTIONS ===== */}
        <div className="filter-actions">
          <button
            type="button"
            className="filter-btn-secondary"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            type="button"
            className="filter-btn-primary"
            onClick={handleApply}
          >
            Apply
          </button>
        </div>

      </div>
    </Modal>
  );
};

export default VacancyFiltersModal;
