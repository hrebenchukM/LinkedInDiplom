import { useState } from 'react';
import AddSkillModal from '../Modals/AddSkillModal';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import './ProfileSkills.css';

const ProfileSkills = ({ skills = [], onAdded }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasSkills = skills.length > 0;

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
                {skill.skill?.name}
                {skill.level ? <span className="skills-chip__level"> · {skill.level}</span> : null}
              </span>
            ))}
          </div>
        )}

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
