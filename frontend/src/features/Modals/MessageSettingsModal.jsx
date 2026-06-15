import React from 'react';
import Modal from '../../app/ui/Modal';
const MessageSettingsModal = ({ isOpen, onClose }) => {
  const settings = [
    { title: 'Manage Discussions', primary: true },
    { title: 'Messaging settings', primary: false },
    { title: 'Set up an office absence', primary: false }
  ];

  const handleSettingClick = (setting) => {
    console.log('Setting clicked:', setting);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {settings.map((setting, index) => (
            <button
              key={index}
              onClick={() => handleSettingClick(setting.title)}
              style={{
                padding: '16px 24px',
                border: 'none',
                background: setting.primary ? '#7c3aed' : 'white',
                color: setting.primary ? 'white' : '#1f2937',
                borderRadius: setting.primary ? '24px' : '8px',
                fontSize: '16px',
                fontWeight: setting.primary ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                if (!setting.primary) {
                  e.target.style.background = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (!setting.primary) {
                  e.target.style.background = 'white';
                }
              }}
            >
              {setting.title}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default MessageSettingsModal;
