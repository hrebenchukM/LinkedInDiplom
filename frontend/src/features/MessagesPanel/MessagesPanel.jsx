import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { MoreHorizontal, Edit, SmilePlus } from 'lucide-react';
import '../MessagesPanel/MessagesPanel.css';
import messagesIllustration from '../../shared/assets/illustrations/messages.png';
import NewMessageModal from '../Modals/NewMessageModal';
import AppContext from '../appContext/AppContext';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import { getMyChats } from '../messaging/messagingApi.js';
import { enrichChatsWithCompanions } from '../messaging/enrichMessagingProfiles.js';
import { DEFAULT_PAGE_SIZE } from '../../shared/api/config.js';

const MessagesPanel = ({ onSelectChat }) => {
  const { token, account, profile } = useContext(AppContext);
  const currentUserId = account?.id ?? account?.userId ?? null;

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('sorted');
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rawChats, setRawChats] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadChats = useCallback(async () => {
    if (!token || !currentUserId) return;

    setLoading(true);
    try {
      const result = await getMyChats(
        { page: 1, pageSize: DEFAULT_PAGE_SIZE },
        currentUserId,
      );
      const enriched = await enrichChatsWithCompanions(result.items, currentUserId);
      setRawChats(enriched);
    } catch {
      setRawChats([]);
    } finally {
      setLoading(false);
    }
  }, [token, currentUserId]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const chats = useMemo(
    () =>
      rawChats.map((chat) => ({
        id: chat.id,
        name: chat.name ?? 'User',
        avatar: chat.avatar ?? chat.companion?.avatarUrl ?? null,
        lastMessage: chat.lastMessage || '',
        time: chat.time ?? chat.lastMessageAt ?? chat.updatedAt,
        unread: chat.unread || chat.hasUnread || (chat.unreadCount ?? 0) > 0,
      })),
    [rawChats],
  );

  const filteredMessages = chats.filter(
    (msg) =>
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <div className="messages-panel">
        <div className="messages-header">
          <div className="messages-title-section">
            <img
              src={getAssetUrl(profile?.user?.avatarUrl, IMAGE_PLACEHOLDERS.avatar)}
              alt="Profile"
              className="messages-avatar"
              onClick={() => navigate('/app/profile')}
              style={{ cursor: 'pointer' }}
            />
            <h3>Messages</h3>
          </div>

          <div className="messages-actions">
            <button type="button" className="icon-btn">
              <MoreHorizontal size={18} />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setIsNewMessageModalOpen(true)}
            >
              <Edit size={18} />
            </button>
            <button type="button" className="icon-btn">
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
            type="button"
            className={`messages-tab ${activeTab === 'sorted' ? 'active' : ''}`}
            onClick={() => setActiveTab('sorted')}
          >
            Sorted
          </button>
          <button
            type="button"
            className={`messages-tab ${activeTab === 'other' ? 'active' : ''}`}
            onClick={() => setActiveTab('other')}
          >
            Other
          </button>
        </div>

        {loading ? (
          <div className="messages-empty">Loading...</div>
        ) : filteredMessages.length > 0 ? (
          <div className="messages-list">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className="message-item"
                onClick={() => onSelectChat?.(message.id)}
                onKeyDown={() => {}}
                role="button"
                tabIndex={0}
              >
                <img
                  src={getAssetUrl(message.avatar, IMAGE_PLACEHOLDERS.avatar)}
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
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>

                  <p className="message-item-text">
                    {message.lastMessage || 'No messages yet'}
                  </p>
                </div>

                {message.unread ? <div className="message-unread-dot" /> : null}
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
        currentUserId={currentUserId}
        onChatCreated={async (chatId) => {
          await loadChats();
          onSelectChat?.(chatId);
        }}
      />
    </>
  );
};

export default MessagesPanel;
