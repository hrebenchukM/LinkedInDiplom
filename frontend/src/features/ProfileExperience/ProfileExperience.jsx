import { useState } from 'react';
import { X } from 'lucide-react';
import '../ProfileExperience/ProfileExperience.css';
import AddExperienceModal from '../Modals/AddExperienceModal';
import { fileUrl } from '../../shared/api/files';

const Briefcase = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const ProfileExperience = ({ items = [], onAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasExperiences = items.length > 0;

  return (
    <>
      <div className="experience-card">
        <div className="section-header">
          <h2>Experience</h2>
          <button className="close-button">
            <X size={20} />
          </button>
        </div>

        {/* EMPTY STATE */}
        {!hasExperiences && (
          <div className="experience-empty">
            <Briefcase size={24} />
            <h3>Add your first experience</h3>
            <p>Tell people about your professional background</p>
          </div>
        )}

        {/* LIST */}
        {items.map(block => {
          if (!block.experience) return null;

          return (
            <div key={block.experience.id} className="experience-item">
              <div className="experience-icon">
                {block.company?.logoUrl
                  ? (
                    <img
                      src={fileUrl(block.company.logoUrl)}
                      alt={block.company?.name}
                    />
                  )
                  : <Briefcase size={24} />
                }
              </div>

              <div className="experience-content">
                <h3>{block.experience.position}</h3>
                <p className="experience-org">
                  {block.company?.name ?? 'Company'} · {block.experience.employmentType}
                </p>
                <p className="experience-date">
                  {block.experience.startDate} – {block.experience.endDate ?? 'Now'}
                </p>
              </div>
            </div>
          );
        })}

        <button className="btn-add" onClick={() => setIsModalOpen(true)}>
          Add experience
        </button>
      </div>

<AddExperienceModal
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

export default ProfileExperience;
