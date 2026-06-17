import React, { useState } from 'react';
import { Globe, Crown, ChevronRight } from 'lucide-react';
import '../PortfolioGeneralInfo/PortfolioGeneralInfo.css';
import MainSkillsModal from '../Modals/MainSkillsModal';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const PortfolioGeneralInfo = ({ user, skills = [] }) => {
  const { t } = useTranslation();
  const [isMainSkillsModalOpen, setIsMainSkillsModalOpen] = useState(false);

  if (!user) return null;

  const mainSkills = skills
    .filter(s => s.isMain)
    .map(s => s.skill?.name)
    .join(' • ');

  return (
    <div className="general-info-card">
      <h2>{t('portfolio.generalInfo.title', 'General Information')}</h2>

      <p className="general-description">
        {user.profileTitle}
        {user.headline ? ` | ${user.headline}` : ''}
      </p>

      {user.genInfo?.split('\n\n').map((p, i) => (
        <p key={i} className="general-description">
          {p}
        </p>
      ))}

      {user.portfolioUrl && (
        <div className="web-info">
          <Globe size={20} />
          <div className="web-content">
            <p className="web-label">{t('portfolio.generalInfo.urls', 'Your urls')}</p>
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

      {mainSkills && (
        <button
          className="main-skills-section"
          onClick={() => setIsMainSkillsModalOpen(true)}
        >
          <Crown size={24} className="skills-icon" />
          <div className="skills-content">
            <p className="skills-label">{t('portfolio.generalInfo.mainSkills', 'Main skills')}</p>
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
