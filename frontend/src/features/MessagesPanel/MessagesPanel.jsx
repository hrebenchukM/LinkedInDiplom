import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Edit, SmilePlus, Sparkles } from 'lucide-react';
import '../MessagesPanel/MessagesPanel.css';
import messagesIllustration from '../../shared/assets/illustrations/messages.png';
import NewMessageModal from '../Modals/NewMessageModal';
import AppContext from '../appContext/AppContext';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import { getProfileMediaVersion } from '../profile/mapProfile.js';
import { getMyChats } from '../messaging/messagingApi.js';
import { enrichChatsWithCompanions } from '../messaging/enrichMessagingProfiles.js';
import { formatChatTime } from '../../shared/lib/formatChatTime.js';
import { DEFAULT_PAGE_SIZE } from '../../shared/api/config.js';
import { useTranslation, getDateLocale } from '../../app/i18n/LocaleContext.jsx';
import {
  AI_ASSISTANT_CHAT_ID,
  buildAiAssistantDisplayChat,
} from '../messaging/aiAssistantSession.js';
import { resolveChatPreviewText } from '../messaging/chatPreview.js';
import { MESSAGING_CHANGED_EVENT } from '../messaging/messagingEvents.js';

const MessagesPanel = ({ onSelectChat }) => {
  const { token, account, profile } = useContext(AppContext);
  const { t, locale } = useTranslation();
  const dateLocale = getDateLocale(locale);
  const currentUserId = account?.id ?? account?.userId ?? null;

  const navigate = useNavigate();

  const openChat = useCallback(
    (chatId) => {
      if (!chatId) return;
      if (onSelectChat) {
        onSelectChat(chatId);
        return;
      }
      navigate(`/app/messages/${chatId}`);
    },
    [navigate, onSelectChat],
  );

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

  useEffect(() => {
    const onMessagingChanged = () => {
      loadChats();
    };

    window.addEventListener(MESSAGING_CHANGED_EVENT, onMessagingChanged);
    return () => window.removeEventListener(MESSAGING_CHANGED_EVENT, onMessagingChanged);
  }, [loadChats]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadChats();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [loadChats]);

  const aiChat = useMemo(() => buildAiAssistantDisplayChat(t), [t]);

  const chats = useMemo(
    () =>
      rawChats
        .map((chat) => ({
          id: chat.id,
          name: chat.name ?? 'User',
          avatar: chat.avatar ?? chat.companion?.avatarUrl ?? null,
          lastMessage: resolveChatPreviewText(chat),
          time: chat.time ?? chat.lastMessageAt ?? chat.updatedAt,
          unread: chat.unread || chat.hasUnread || (chat.unreadCount ?? 0) > 0,
          isAiAssistant: false,
        }))
        .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)),
    [rawChats],
  );

  const panelChats = useMemo(
    () => [
      {
        id: aiChat.id,
        name: aiChat.name,
        avatar: aiChat.avatar,
        lastMessage: aiChat.lastMessage,
        time: aiChat.time,
        unread: false,
        isAiAssistant: true,
      },
      ...chats,
    ],
    [aiChat, chats],
  );

  const filteredMessages = panelChats.filter(
    (msg) =>
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const hasOnlyAi =
    filteredMessages.length === 1 && filteredMessages[0]?.isAiAssistant;

  const avatarVersion = getProfileMediaVersion(profile);

  return (
    <>
      <div className="messages-panel">
        <div className="messages-header">
          <div className="messages-title-section">
            <img
              src={getAssetUrl(profile?.user?.avatarUrl, IMAGE_PLACEHOLDERS.avatar, avatarVersion)}
              alt={t('common.profileAlt', 'Profile')}
              className="messages-avatar"
              onClick={() => navigate('/app/profile')}
              style={{ cursor: 'pointer' }}
            />
            <h3>{t('home.messages.title', 'Messages')}</h3>
          </div>

          <div className="messages-actions">
            <button type="button" className="icon-btn" aria-label={t('common.more', 'More')}>
              <MoreHorizontal size={18} />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setIsNewMessageModalOpen(true)}
              aria-label={t('home.messages.new', 'New message')}
            >
              <Edit size={18} />
            </button>
            <button type="button" className="icon-btn" aria-label={t('common.more', 'More')}>
              <SmilePlus size={18} />
            </button>
          </div>
        </div>

        <div className="messages-search">
          <input
            type="text"
            placeholder={t('home.messages.search', 'Search messages')}
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
            {t('home.messages.sorted', 'Sorted')}
          </button>
          <button
            type="button"
            className={`messages-tab ${activeTab === 'other' ? 'active' : ''}`}
            onClick={() => setActiveTab('other')}
          >
            {t('home.messages.other', 'Other')}
          </button>
        </div>

        <div className="messages-panel-body">
          {loading ? (
            <div className="messages-empty">{t('home.messages.loading', 'Loading...')}</div>
          ) : filteredMessages.length > 0 ? (
            <div className="messages-list">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`message-item ${message.isAiAssistant ? 'message-item--ai' : ''}`}
                  onClick={() => openChat(message.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') openChat(message.id);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {message.isAiAssistant ? (
                    <div className="message-item-ai-avatar">
                      <Sparkles size={18} />
                    </div>
                  ) : (
                    <img
                      src={getAssetUrl(message.avatar, IMAGE_PLACEHOLDERS.avatar)}
                      alt={message.name}
                      className="message-item-avatar"
                    />
                  )}

                  <div className="message-item-content">
                    <div className="message-item-header">
                      <h4 className="message-item-name">{message.name}</h4>
                      <span className="message-item-time">
                        {formatChatTime(message.time, dateLocale)}
                      </span>
                    </div>

                    <p className="message-item-text">
                      {message.lastMessage || t('chat.noMessagesYet', 'No messages yet')}
                    </p>
                  </div>

                  {message.unread ? <div className="message-unread-dot" /> : null}
                </div>
              ))}

              {hasOnlyAi ? (
                <div className="messages-panel-hint">
                  <p>{t('home.messages.emptySubtitle', 'Contact a member and start a discussion')}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="messages-empty">
              <img
                src={messagesIllustration}
                alt=""
                className="message-empty-img"
              />
              <h4>{t('home.messages.emptyTitle', 'No messages yet')}</h4>
              <p>{t('home.messages.emptySubtitle', 'Contact a member and start a discussion')}</p>
            </div>
          )}
        </div>

        <div className="messages-panel-footer">
          <button
            type="button"
            className="send-message-btn"
            onClick={() => openChat(AI_ASSISTANT_CHAT_ID)}
          >
            <Sparkles size={14} />
            {t('home.messages.openAi', 'AI Assistant')}
          </button>
          <button
            type="button"
            className="send-message-btn send-message-btn--secondary"
            onClick={() => setIsNewMessageModalOpen(true)}
          >
            {t('home.messages.new', 'New message')}
          </button>
          <button
            type="button"
            className="messages-view-all"
            onClick={() => navigate('/app/messages')}
          >
            {t('home.messages.viewAll', 'View all messages')}
          </button>
        </div>
      </div>

      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
        currentUserId={currentUserId}
        onChatCreated={async (chatId) => {
          await loadChats();
          openChat(chatId);
        }}
      />
    </>
  );
};

export default MessagesPanel;
