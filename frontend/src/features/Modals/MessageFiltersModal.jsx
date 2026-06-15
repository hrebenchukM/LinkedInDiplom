import React, { useState } from 'react';
import Modal from '../../app/ui/Modal';
const MessageFiltersModal = ({ isOpen, onClose }) => {
  const [selectedFilter, setSelectedFilter] = useState('Unread');

  const filters = [
    'Unread',
    'Drafts',
    'My contacts',
    'Favorites',
    'Archived',
    'Spam'
  ];

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filters.map((filter, index) => (
            <button
              key={index}
              onClick={() => handleFilterSelect(filter)}
              style={{
                padding: '16px 24px',
                border: 'none',
                background: selectedFilter === filter ? '#7c3aed' : 'white',
                color: selectedFilter === filter ? 'white' : '#1f2937',
                borderRadius: selectedFilter === filter ? '24px' : '8px',
                fontSize: '16px',
                fontWeight: selectedFilter === filter ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                if (selectedFilter !== filter) {
                  e.target.style.background = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFilter !== filter) {
                  e.target.style.background = 'white';
                }
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default MessageFiltersModal;
