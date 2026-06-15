import React, { useState } from 'react';

import { Maximize2, X } from 'lucide-react';
import Modal from '../../app/ui/Modal';

const NewMessageModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const recommendedPeople = [
    {
      name: 'Michael Schmidt',
      title: 'Pursuing MBA at Lead college of Management',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    },
    {
      name: 'Sana Saeed',
      title: 'Creative Director at HASH Maldives',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    },
    {
      name: 'Anna Gohnsom',
      title: 'Pursuing MBA at Lead college of Management',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    }
  ];

  const handleUserSelect = (person) => {
    setSelectedUsers([...selectedUsers, person]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New message">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button
            type="button"
            style={{
              padding: '8px',
              border: 'none',
              background: 'none',
              cursor: 'pointer'
            }}
          >
            <Maximize2 size={20} color="#6b7280" />
          </button>
        </div>

        <div className="form-group">
          <input
            type="text"
            className="form-input"
            placeholder="Keep a name or multiple names"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', borderBottom: '1px solid #e5e7eb', borderRadius: 0, padding: '12px 0' }}
          />
        </div>

        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', color: '#9ca3af', marginBottom: '16px', fontWeight: 600 }}>
            Recommended
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recommendedPeople.map((person, index) => (
              <div
                key={index}
                onClick={() => handleUserSelect(person)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'background 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <img
                  src={person.avatar}
                  alt={person.name}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px', color: '#1f2937' }}>
                    {person.name}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    {person.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NewMessageModal;
