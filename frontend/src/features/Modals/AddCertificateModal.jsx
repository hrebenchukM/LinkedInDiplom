import React, { useContext, useState } from 'react';
import Modal from '../../app/ui/Modal';
import AppContext from '../../features/appContext/AppContext';

const AddCertificateModal = ({ isOpen, onClose, onAdded }) => {
  const { request } = useContext(AppContext);

  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    issueMonth: '',
    issueYear: '',
    expiryMonth: '',
    expiryYear: '',
    accreditationId: '',
    organizationUrl: '',
    file: null
  });

  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const years = Array.from(
    { length: 50 },
    (_, i) => new Date().getFullYear() - i
  );

  const toDate = (month, year) =>
    month && year
      ? `${year}-${String(months.indexOf(month) + 1).padStart(2, '0')}-01`
      : null;



  const handleSubmit = async (e) => {
  e.preventDefault();

  const fd = new FormData();

  fd.append("name", formData.name);
  fd.append("academyName", formData.organization);

  if (formData.issueMonth && formData.issueYear) {
    fd.append("issueDate", toDate(formData.issueMonth, formData.issueYear));
  }

  if (formData.expiryMonth && formData.expiryYear) {
    fd.append("expiryDate", toDate(formData.expiryMonth, formData.expiryYear));
  }

  if (formData.accreditationId) {
    fd.append("accreditationId", formData.accreditationId);
  }

  if (formData.organizationUrl) {
    fd.append("organizationUrl", formData.organizationUrl);
  }

  if (formData.file) {
    fd.append("file", formData.file); // 🔥 ВАЖНО
  }

  await request("api://user/certificates", {
    method: "POST",
    body: fd
  });
  onAdded?.();
  onClose();
};


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adding a license or certificate"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-hint">Mandatory field</div>

        {/* NAME */}
        <div className="form-group">
          <label className="form-label required">Name</label>
          <input
            className="form-input"
            value={formData.name}
            onChange={e =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
        </div>

        {/* ORGANIZATION */}
        <div className="form-group">
          <label className="form-label required">
            Organization that issued the certificate
          </label>
          <input
            className="form-input"
            value={formData.organization}
            onChange={e =>
              setFormData({ ...formData, organization: e.target.value })
            }
            required
          />
        </div>

        {/* ISSUE DATE */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date of issue</label>
            <select
              className="form-select"
              value={formData.issueMonth}
              onChange={e =>
                setFormData({ ...formData, issueMonth: e.target.value })
              }
            >
              <option value="">Month</option>
              {months.map(m => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <select
              className="form-select"
              value={formData.issueYear}
              onChange={e =>
                setFormData({ ...formData, issueYear: e.target.value })
              }
            >
              <option value="">Year</option>
              {years.map(y => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* EXPIRY DATE */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Expiry date</label>
            <select
              className="form-select"
              value={formData.expiryMonth}
              onChange={e =>
                setFormData({ ...formData, expiryMonth: e.target.value })
              }
            >
              <option value="">Month</option>
              {months.map(m => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <select
              className="form-select"
              value={formData.expiryYear}
              onChange={e =>
                setFormData({ ...formData, expiryYear: e.target.value })
              }
            >
              <option value="">Year</option>
              {years.map(y => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ACCREDITATION ID */}
        <div className="form-group">
          <label className="form-label">Accreditation ID</label>
          <input
            className="form-input"
            value={formData.accreditationId}
            onChange={e =>
              setFormData({ ...formData, accreditationId: e.target.value })
            }
          />
        </div>

        {/* ORGANIZATION URL */}
        <div className="form-group">
          <label className="form-label">Organization URL</label>
          <input
            className="form-input"
            value={formData.organizationUrl}
            onChange={e =>
              setFormData({ ...formData, organizationUrl: e.target.value })
            }
          />
        </div>

        {/* PDF */}
        <div className="form-group">
          <label className="form-label">Certificate PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={e =>
              setFormData({ ...formData, file: e.target.files[0] })
            }
          />
        </div>

        {/* ACTIONS */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
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

export default AddCertificateModal;
