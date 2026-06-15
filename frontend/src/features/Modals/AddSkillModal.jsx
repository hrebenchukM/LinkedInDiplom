import React, { useContext, useState } from 'react';
import Modal from '../../app/ui/Modal';
import AppContext from '../../features/appContext/AppContext';

const AddSkillModal = ({ isOpen, onClose, onAdded }) => {
  const { request } = useContext(AppContext);

  const [formData, setFormData] = useState({
    name: '',
    level: 'intermediate',
    isMain: false
  });

 const handleSubmit = async (e) => {
  e.preventDefault();

  const form = new FormData();
  form.append("name", formData.name.trim());
  form.append("level", formData.level);
  form.append("isMain", formData.isMain);

  try {
    await request("api://user/skills", {
      method: "POST",
      body: form  
    });

    onAdded?.();
    onClose();
  }
  catch (err) {
    alert(err?.data || "Unexpected error");
  }
};


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add skill">
      <form onSubmit={handleSubmit}>
        <div className="form-hint">Mandatory field</div>

        {/* SKILL NAME */}
        <div className="form-group">
          <label className="form-label required">Skill</label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={e =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="e.g. Java, React, SQL"
            required
          />
        </div>

        {/* LEVEL */}
        <div className="form-group">
          <label className="form-label">Level</label>
          <select
            className="form-select"
            value={formData.level}
            onChange={e =>
              setFormData({ ...formData, level: e.target.value })
            }
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* MAIN SKILL */}
        <div className="form-group">
          <label style={{ display: 'flex', gap: 8 }}>
            <input
              type="checkbox"
              checked={formData.isMain}
              onChange={e =>
                setFormData({ ...formData, isMain: e.target.checked })
              }
            />
            <span className="form-label">Main skill</span>
          </label>
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

export default AddSkillModal;
