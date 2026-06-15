import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import Modal from '../../app/ui/Modal';

const MainSkillsModal = ({ isOpen, onClose }) => {
  const [expandedCategories, setExpandedCategories] = useState(['Prototyping']);

  const skillsData = [
    {
      category: 'Prototyping',
      skills: [
        { name: 'UI/UX Designer (Freelance)', icon: '🎯' },
        { name: 'Web Designer', icon: '🌙' },
        { name: 'UI/UX Designer', icon: '🌙' },
        { name: 'UI/UX New Level', icon: '🔗' }
      ]
    },
    {
      category: 'User Experience (UX)',
      skills: [
        { name: 'UI/UX Designer (Freelance)', icon: '🎯' },
        { name: 'CreoLab Design', icon: '🔗' },
        { name: 'Cybergenia Academy', icon: '🌙' },
        { name: 'UI/UX Design', icon: '🎯' }
      ]
    },
    {
      category: 'Wireframing',
      skills: [
        { name: 'CreoLab Design', icon: '🔗' },
        { name: 'UI/UX Designer', icon: '🎯' },
        { name: 'UI/UX Design', icon: '🎯' },
        { name: 'Cybergenia Academy', icon: '🌙' }
      ]
    }
  ];

  const toggleCategory = (category) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(cat => cat !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Main Skills">
      <div>
        {skillsData.map((categoryData, index) => (
          <div
            key={index}
            style={{
              borderBottom: index < skillsData.length - 1 ? '1px solid #e5e7eb' : 'none',
              paddingBottom: '16px',
              marginBottom: '16px'
            }}
          >
            <button
              onClick={() => toggleCategory(categoryData.category)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 600,
                color: '#7c3aed'
              }}
            >
              {categoryData.category}
              {expandedCategories.includes(categoryData.category) ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {expandedCategories.includes(categoryData.category) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                {categoryData.skills.map((skill, skillIndex) => (
                  <div
                    key={skillIndex}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px',
                      borderRadius: '8px',
                      transition: 'background 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: skill.icon === '🎯' ? '#fce7f3' : skill.icon === '🌙' ? '#1f2937' : '#7c3aed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}
                    >
                      {skill.icon === '🔗' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: '14px', color: '#1f2937' }}>{skill.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default MainSkillsModal;
