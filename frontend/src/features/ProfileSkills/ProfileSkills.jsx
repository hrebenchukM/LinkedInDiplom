import { useState } from 'react';
import { X } from 'lucide-react';
import AddSkillModal from '../Modals/AddSkillModal';
import { deleteSkill } from '../professional/professionalApi.js';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import './ProfileSkills.css';

const ProfileSkills = ({ skills = [], onAdded }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [removeError, setRemoveError] = useState('');
  const hasSkills = skills.length > 0;

  const handleRemove = async (skillId) => {
    if (!skillId || removingId) return;

    setRemoveError('');
    setRemovingId(skillId);

    try {
      await deleteSkill(skillId);
      await onAdded?.();
    } catch {
      setRemoveError(t('profile.skills.removeFailed', 'Failed to remove skill.'));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <div className="skills-card">
        <div className="section-header">
          <h2>{t('profile.skills.title', 'Skills')}</h2>
        </div>

        {!hasSkills ? (
          <p className="skills-empty">{t('profile.skills.empty', 'No skills added')}</p>
        ) : (
          <div className="skills-chips">
            {skills.map((skill) => (
              <span
                key={skill.id ?? skill.skillId}
                className={`skills-chip${skill.isMain ? ' skills-chip--main' : ''}`}
              >
                <span className="skills-chip__label">
                  {skill.skill?.name}
                  {skill.level ? (
                    <span className="skills-chip__level"> · {skill.level}</span>
                  ) : null}
                </span>
                <button
                  type="button"
                  className="skills-chip__remove"
                  onClick={() => handleRemove(skill.id)}
                  disabled={removingId === skill.id}
                  aria-label={t('profile.skills.remove', 'Remove skill')}
                  title={t('profile.skills.remove', 'Remove skill')}
                >
                  <X size={14} aria-hidden />
                </button>
              </span>
            ))}
          </div>
        )}

        {removeError ? (
          <p className="skills-error" role="alert">
            {removeError}
          </p>
        ) : null}

        <button
          className="btn-add"
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          {t('profile.skills.add', 'Add skills')}
        </button>
      </div>

      <AddSkillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdded={() => {
          onAdded?.();
          setIsModalOpen(false);
        }}
      />
    </>
  );
};

export default ProfileSkills;
