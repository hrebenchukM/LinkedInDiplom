import React, { useState } from 'react';
import Modal from '../../app/ui/Modal';
import {
  createSkill,
  resolveSkillIdByName,
} from '../professional/professionalApi.js';
import { mapSkillToRequest } from '../professional/mapProfessional.js';
import { getErrorMessage, getUserFriendlyErrorMessage } from '../../shared/lib/apiError.js';

const AddSkillModal = ({ isOpen, onClose, onAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    level: 'intermediate',
    isMain: false,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const skillId = await resolveSkillIdByName(formData.name);

      if (!skillId) {
        setError('Skill not found in catalog. Try another name from the skills list.');
        return;
      }

      const payload = mapSkillToRequest(formData, skillId);
      await createSkill(payload);
      onAdded?.();
      onClose();
    } catch (err) {
      console.warn('Add skill error:', err);
      setError(getUserFriendlyErrorMessage(err, getErrorMessage(err)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add skill">
      <form onSubmit={handleSubmit}>
        <div className="form-hint">Mandatory field</div>

        {error ? <div className="auth-field-error">{error}</div> : null}

        <div className="form-group">
          <label className="form-label required">Skill</label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Java, React, SQL"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Level</label>
          <select
            className="form-select"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', gap: 8 }}>
            <input
              type="checkbox"
              checked={formData.isMain}
              onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
            />
            <span className="form-label">Main skill</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSkillModal;
