import React, { useContext, useState } from 'react';
import Modal from '../../app/ui/Modal';
import AppContext from '../../features/appContext/AppContext';

const AddEducationModal = ({ isOpen, onClose, onAdded }) => {
  const { request } = useContext(AppContext);

  const [formData, setFormData] = useState({
    school: '',
    degree: '',
    field: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    current: false,
    description: ''
  });

  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

 const handleSubmit = (e) => {
  e.preventDefault();

  const startDate =
    formData.startYear && formData.startMonth
      ? `${formData.startYear}-${String(
          months.indexOf(formData.startMonth) + 1
        ).padStart(2, '0')}-01`
      : null;

  const endDate =
    formData.current || !formData.endYear || !formData.endMonth
      ? null
      : `${formData.endYear}-${String(
          months.indexOf(formData.endMonth) + 1
        ).padStart(2, '0')}-01`;

  const fd = new FormData();

  fd.append("institution", formData.school);
  if (formData.degree) fd.append("degree", formData.degree);
  if (formData.field) fd.append("fieldOfStudy", formData.field);

  if (startDate) fd.append("startDate", startDate);
  if (endDate) fd.append("endDate", endDate);

  request("api://user/education", {
    method: "POST",
    body: fd
  })
  .then(() => {
    onAdded?.();
    onClose();
  })
  .catch(alert);
};



  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adding education">
      <form onSubmit={handleSubmit}>
        <div className="form-hint">Mandatory field</div>

        <div className="form-group">
          <label className="form-label required">School</label>
          <input
            type="text"
            className="form-input"
            value={formData.school}
            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Degree</label>
          <input
            type="text"
            className="form-input"
            value={formData.degree}
            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Field of study</label>
          <input
            type="text"
            className="form-input"
            value={formData.field}
            onChange={(e) => setFormData({ ...formData, field: e.target.value })}
          />
        </div>

        {/* START DATE */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start date</label>
            <select
              className="form-select"
              value={formData.startMonth}
              onChange={(e) => setFormData({ ...formData, startMonth: e.target.value })}
            >
              <option value="">Month</option>
              {months.map(m => <option key={m}>{m}</option>)}
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
              {years.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* END DATE */}
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
              {months.map(m => <option key={m}>{m}</option>)}
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
              {years.map(y => <option key={y}>{y}</option>)}
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
            <span className="form-label">I currently study here</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEducationModal;
