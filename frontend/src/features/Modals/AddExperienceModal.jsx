import React, { useContext, useState } from 'react';
import Modal from '../../app/ui/Modal';
import AppContext from '../../features/appContext/AppContext';

const AddExperienceModal = ({ isOpen, onClose, onAdded }) => {
  const { request } = useContext(AppContext);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    current: false,
    description: ''
  });


  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

 const handleSubmit = (e) => {
  e.preventDefault();

  const fd = new FormData();

  fd.append("position", formData.title);
  fd.append("companyName", formData.company);
  fd.append("location", formData.location);
  fd.append("employmentType", "Full-time");
  fd.append("workLocationType", "Office");
  fd.append("description", formData.description);

  if (formData.startMonth && formData.startYear) {
    fd.append(
      "startDate",
      `${formData.startYear}-${String(months.indexOf(formData.startMonth) + 1).padStart(2, "0")}-01`
    );
  }

  if (!formData.current && formData.endMonth && formData.endYear) {
    fd.append(
      "endDate",
      `${formData.endYear}-${String(months.indexOf(formData.endMonth) + 1).padStart(2, "0")}-01`
    );
  }

  request("api://user/experience", {
    method: "POST",
    body: fd
  })
  .then(() => {
    onAdded?.();
    onClose();
  })
  .catch(err => {
  console.error(err);
  alert(
    typeof err === "string"
      ? err
      : err?.data || "Operation failed"
  );
});

};

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adding work experience">
      <form onSubmit={handleSubmit}>
        <div className="form-hint">Mandatory field</div>

        <div className="form-group">
          <label className="form-label required">Title</label>
          <input
            type="text"
            className="form-input"
            placeholder="For example: Software Engineer"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label required">Company</label>
          <input
            type="text"
            className="form-input"
            placeholder="For example: Google"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Location</label>
          <input
            type="text"
            className="form-input"
            placeholder="For example: San Francisco, CA"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start date</label>
            <select
              className="form-select"
              value={formData.startMonth}
              onChange={(e) => setFormData({ ...formData, startMonth: e.target.value })}
            >
              <option value="">Month</option>
              {months.map(month => <option key={month} value={month}>{month}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <select
              className="form-select"
              value={formData.startYear}
              onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
            >
              <option value="">Year</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">End date</label>
            <select
              className="form-select"
              value={formData.endMonth}
              onChange={(e) => setFormData({ ...formData, endMonth: e.target.value })}
              disabled={formData.current}
            >
              <option value="">Month</option>
              {months.map(month => <option key={month} value={month}>{month}</option>)}
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
              <option value="">Year</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.current}
              onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
            />
            <span className="form-label" style={{ margin: 0 }}>I currently work here</span>
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            placeholder="Describe your responsibilities and achievements..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddExperienceModal;
