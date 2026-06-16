import React from 'react';
import Modal from '../../app/ui/Modal';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const MessageSettingsModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const settings = [
    { key: 'chat.settings.discussions', fallback: 'Manage Discussions', primary: true },
    { key: 'chat.settings.messaging', fallback: 'Messaging settings', primary: false },
    { key: 'chat.settings.absence', fallback: 'Set up an office absence', primary: false },
  ];

  const handleSettingClick = (settingKey) => {
    console.log('Setting clicked:', settingKey);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('chat.settings', 'Settings')}>
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {settings.map((setting) => (
            <button
              key={setting.key}
              onClick={() => handleSettingClick(setting.key)}
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
                transition: 'all 0.3s',
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
              {t(setting.key, setting.fallback)}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default MessageSettingsModal;
