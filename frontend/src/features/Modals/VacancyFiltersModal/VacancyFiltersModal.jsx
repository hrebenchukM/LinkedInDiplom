import React, { useState } from 'react';
import './VacancyFiltersModal.css';
import Modal from '../../../app/ui/Modal';

const VacancyFiltersModal = ({ isOpen, onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    location: [],
    jobType: [],
    experienceLevel: [],
    salaryRange: [0, 300000],
    sortBy: 'newest',
    sortDirection: 'desc',
  });

  const locations = ['Remote', 'On-site', 'Hybrid'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const experienceLevels = ['Entry level', 'Mid-level', 'Senior', 'Lead'];

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
    <Modal isOpen={isOpen} onClose={onClose} title="Filter Vacancies">
      <div className="vacancy-filters-modal">

        <div className="filter-section">
          <h3>Sort by</h3>
          <select
            className="form-select"
            value={filters.sortBy}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, sortBy: event.target.value }))
            }
          >
            <option value="newest">Newest</option>
            <option value="title">Title</option>
            <option value="location">Location</option>
            <option value="updated">Recently updated</option>
          </select>
        </div>

        <div className="filter-section">
          <h3>Workplace type</h3>
          <div className="filter-options">
            {locations.map((location) => (
              <label key={location} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.location.includes(location)}
                  onChange={() => toggleArrayValue('location', location)}
                />
                <span>{location}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h3>Job Type</h3>
          <div className="filter-options">
            {jobTypes.map((jobType) => (
              <label key={jobType} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.jobType.includes(jobType)}
                  onChange={() => toggleArrayValue('jobType', jobType)}
                />
                <span>{jobType}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h3>Experience Level</h3>
          <p className="filter-hint">Applied on the current page only</p>
          <div className="filter-options">
            {experienceLevels.map((level) => (
              <label key={level} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.experienceLevel.includes(level)}
                  onChange={() => toggleArrayValue('experienceLevel', level)}
                />
                <span>{level}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h3>Salary Range</h3>
          <p className="filter-hint">Applied on the current page only</p>
          <div className="salary-range">
            <input
              type="number"
              placeholder="Min"
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
              placeholder="Max"
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
