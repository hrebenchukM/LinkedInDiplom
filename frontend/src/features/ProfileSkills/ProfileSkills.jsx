import React, { useState } from 'react';
import { X } from 'lucide-react';
import AddSkillModal from '../Modals/AddSkillModal';
import './ProfileSkills.css';

const ProfileSkills = ({ skills = [], onAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasSkills = skills.length > 0;

  return (
    <>
      <div className="skills-card">
        <div className="section-header">
          <h2>Skills</h2>
          <button className="close-button" type="button">
            <X size={20} />
          </button>
        </div>

        <p className="section-description">
          Communicate your readiness for new opportunities – 50% of employers use skills data to fit their positions
        </p>

        <div className="skills-list">
          {!hasSkills && (
            <p className="skill-item muted">No skills added</p>
          )}

          {skills.map(s => (
            <p
              key={s.id}
              className={`skill-item ${!s.isMain ? 'muted' : ''}`}
            >
              {s.skill?.name}
              {s.level && <span className="skill-level"> · {s.level}</span>}
            </p>
          ))}
        </div>

        <button
          className="btn-add"
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          Add skills
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
