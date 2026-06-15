import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { MoreHorizontal, Edit, SmilePlus } from 'lucide-react';
import '../MessagesPanel/MessagesPanel.css';
import messagesIllustration from '../../shared/assets/illustrations/messages.png';
import NewMessageModal from '../Modals/NewMessageModal';
import AppContext from '../appContext/AppContext';
import { fileUrl } from '../../shared/api/files';

const MessagesPanel = ({ onSelectChat }) => {
const { request, profile } = useContext(AppContext);

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('sorted');
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [rawChats, setRawChats] = useState([]);

  
  // ================= LOAD CHATS (как в MessagesPage) =================
  useEffect(() => {
    request('api://chats')
      .then(data => setRawChats(Array.isArray(data) ? data : []))
      .catch(() => setRawChats([]));
  }, []);

  // ================= UI ADAPTER (КЛЮЧЕВОЕ) =================
  const chats = useMemo(
    () =>
      rawChats.map(chat => ({
        id: chat.chatId,

        name: chat.companion
          ? `${chat.companion.firstName} ${chat.companion.secondName}`
          : 'Unknown user',

        avatar: chat.companion?.avatarUrl || null,

        lastMessage: chat.lastMessage || '',
        time: chat.lastMessageAt,
        unread: chat.hasUnread
      })),
    [rawChats]
  );

  // ================= FILTER =================
  const filteredMessages = chats.filter(msg =>
    msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="messages-panel">
        <div className="messages-header">
          <div className="messages-title-section">
<img
  src={fileUrl(profile?.user?.avatarUrl)}
  alt="Profile"
  className="messages-avatar"
  onClick={() => navigate('/app/portfolio/me')}
  style={{ cursor: 'pointer' }}
/>


            <h3>Messages</h3>
          </div>

          <div className="messages-actions">
            <button className="icon-btn">
              <MoreHorizontal size={18} />
            </button>
            <button
              className="icon-btn"
              onClick={() => setIsNewMessageModalOpen(true)}
            >
              <Edit size={18} />
            </button>
            <button className="icon-btn">
              <SmilePlus size={18} />
            </button>
          </div>
        </div>

        <div className="messages-search">
          <input
            type="text"
            placeholder="Search messages"
            className="messages-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="messages-tabs">
          <button
            className={`messages-tab ${activeTab === 'sorted' ? 'active' : ''}`}
            onClick={() => setActiveTab('sorted')}
          >
            Sorted
          </button>
          <button
            className={`messages-tab ${activeTab === 'other' ? 'active' : ''}`}
            onClick={() => setActiveTab('other')}
          >
            Other
          </button>
        </div>

        {filteredMessages.length > 0 ? (
          <div className="messages-list">
            {filteredMessages.map(message => (
              <div
                key={message.id}
                className="message-item"
               
              >
                <img
                  src={fileUrl(message.avatar)}
                  alt={message.name}
                  className="message-item-avatar"
                />

                <div className="message-item-content">
                  <div className="message-item-header">
                    <h4 className="message-item-name">{message.name}</h4>
                    <span className="message-item-time">
                      {message.time
                        ? new Date(message.time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : ''}
                    </span>
                  </div>

                  <p className="message-item-text">
                    {message.lastMessage || 'No messages yet'}
                  </p>
                </div>

                {message.unread && <div className="message-unread-dot"></div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="messages-empty">
            <img
              src={messagesIllustration}
              alt="No messages"
              className="message-empty-img"
            />
            <h4>No messages yet</h4>
            <p>Contact a member and start a discussion</p>
          </div>
        )}
      </div>

      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
      />
    </>
  );
};

export default MessagesPanel;
