import React, { useEffect, useState } from 'react';
import Modal from '../../app/ui/Modal';
import {
  createSkill,
  resolveSkillIdByName,
  searchSkillsCatalog,
} from '../professional/professionalApi.js';
import { mapSkillToRequest } from '../professional/mapProfessional.js';
import { getErrorMessage, getUserFriendlyErrorMessage } from '../../shared/lib/apiError.js';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const AddSkillModal = ({ isOpen, onClose, onAdded }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    level: 'intermediate',
    isMain: false,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setSuggestions([]);
      return undefined;
    }

    const query = formData.name.trim();
    if (query.length < 1) {
      setSuggestions([]);
      return undefined;
    }

    let cancelled = false;

    (async () => {
      try {
        const items = await searchSkillsCatalog(query, 12);
        if (cancelled) return;
        setSuggestions(items.map((item) => item.name).filter(Boolean));
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [formData.name, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const skillId = await resolveSkillIdByName(formData.name);

      if (!skillId) {
        setError(t('profile.skills.notInCatalog', 'Skill not found in catalog. Try another name.'));
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
    <Modal isOpen={isOpen} onClose={onClose} title={t('profile.modal.addSkill.title', 'Add skill')}>
      <form onSubmit={handleSubmit}>
        <div className="form-hint">{t('profile.modal.mandatoryField', 'Mandatory field')}</div>

        {error ? <div className="auth-field-error">{error}</div> : null}

        <div className="form-group">
          <label className="form-label required">{t('profile.modal.addSkill.skill', 'Skill')}</label>
          <input
            type="text"
            className="form-input"
            list="skill-catalog-suggestions"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t('profile.modal.addSkill.placeholder', 'e.g. Java, React, SQL')}
            required
          />
          <datalist id="skill-catalog-suggestions">
            {suggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label className="form-label">{t('profile.modal.addSkill.level', 'Level')}</label>
          <select
            className="form-select"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
          >
            <option value="beginner">{t('profile.modal.addSkill.levelBeginner', 'Beginner')}</option>
            <option value="intermediate">{t('profile.modal.addSkill.levelIntermediate', 'Intermediate')}</option>
            <option value="advanced">{t('profile.modal.addSkill.levelAdvanced', 'Advanced')}</option>
          </select>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', gap: 8 }}>
            <input
              type="checkbox"
              checked={formData.isMain}
              onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
            />
            <span className="form-label">{t('profile.modal.addSkill.mainSkill', 'Main skill')}</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            {t('common.cancel', 'Cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? t('profile.saving', 'Saving...') : t('common.save', 'Save')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSkillModal;
