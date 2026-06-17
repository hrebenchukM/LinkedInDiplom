import Modal from '../../app/ui/Modal';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import { CHAT_FILTER_OPTIONS } from '../messaging/chatListFilters.js';
import './MessageFiltersModal.css';

const MessageFiltersModal = ({ isOpen, onClose, activeFilter, onSelectFilter }) => {
  const { t } = useTranslation();

  const handleFilterSelect = (filterId) => {
    onSelectFilter?.(filterId);
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('chat.filters', 'Filters')}
      className="message-filters-modal"
    >
      <div className="message-filters">
        <div className="message-filters__list">
          {CHAT_FILTER_OPTIONS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`message-filters__btn${activeFilter === filter.id ? ' is-active' : ''}`}
              onClick={() => handleFilterSelect(filter.id)}
            >
              <span>{t(filter.key, filter.id)}</span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default MessageFiltersModal;
