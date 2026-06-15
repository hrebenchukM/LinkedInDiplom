import React, { useState } from 'react';
import { Globe, Crown, ChevronRight } from 'lucide-react';
import '../PortfolioGeneralInfo/PortfolioGeneralInfo.css';
import MainSkillsModal from '../Modals/MainSkillsModal';

const PortfolioGeneralInfo = ({ user, skills = [] }) => {
  const [isMainSkillsModalOpen, setIsMainSkillsModalOpen] = useState(false);

  if (!user) return null;

  // main skills (isMain === 1)
  const mainSkills = skills
    .filter(s => s.isMain)
    .map(s => s.skill?.name)
    .join(' • ');

  return (
    <div className="general-info-card">
      <h2>General Information</h2>

      {/* short headline */}
      <p className="general-description">
        {user.profileTitle}
        {user.headline ? ` | ${user.headline}` : ''}
      </p>

      {/* main text (gen_info from DB) */}
      {user.genInfo?.split('\n\n').map((p, i) => (
        <p key={i} className="general-description">
          {p}
        </p>
      ))}

      {/* portfolio urls */}
      {user.portfolioUrl && (
        <div className="web-info">
          <Globe size={20} />
          <div className="web-content">
            <p className="web-label">Your urls</p>
            <a
              href={user.portfolioUrl}
              target="_blank"
              rel="noreferrer"
              className="web-link"
            >
              {user.portfolioUrl}
            </a>
          </div>
          <button
            className="copy-button"
            onClick={() => navigator.clipboard.writeText(user.portfolioUrl)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="5" y="5" width="9" height="9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M3 11V3h8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </button>
        </div>
      )}

      {/* main skills */}
      {mainSkills && (
        <button
          className="main-skills-section"
          onClick={() => setIsMainSkillsModalOpen(true)}
        >
          <Crown size={24} className="skills-icon" />
          <div className="skills-content">
            <p className="skills-label">Main skills</p>
            <p className="skills-list">{mainSkills}</p>
          </div>
          <ChevronRight size={24} className="skills-arrow" />
        </button>
      )}

      <MainSkillsModal
        isOpen={isMainSkillsModalOpen}
        onClose={() => setIsMainSkillsModalOpen(false)}
        skills={skills}
      />
    </div>
  );
};

export default PortfolioGeneralInfo;
