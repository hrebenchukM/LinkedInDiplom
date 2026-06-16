import React, { useMemo, useState } from 'react';

import { Search, Plus, Filter, MoreVertical, Sparkles, MessageSquarePlus } from 'lucide-react';

import { formatChatTime } from '../../shared/lib/formatChatTime.js';

import { useTranslation, getDateLocale } from '../../app/i18n/LocaleContext.jsx';
import { getChatFilterEmptyMessageKey } from '../messaging/chatListFilters.js';

import '../ChatSidebar/ChatSidebar.css';

import { IMAGE_PLACEHOLDERS } from '../../shared/api/files';

import SafeImage from '../../shared/ui/SafeImage';



const ChatSidebar = ({

  activeTab,

  setActiveTab,

  chatUsers,

  selectedChat,

  onSelectChat,

  showChat,

  onNewMessage,

  onOpenFilters,

  onOpenSettings,

  loading = false,

  chatFilter = null,

}) => {

  const { t, locale } = useTranslation();

  const dateLocale = getDateLocale(locale);

  const [searchQuery, setSearchQuery] = useState('');



  const filteredUsers = useMemo(() => {

    const query = searchQuery.trim().toLowerCase();

    if (!query) return chatUsers;

    return chatUsers.filter(

      (user) =>

        user.name?.toLowerCase().includes(query) ||

        user.lastMessage?.toLowerCase().includes(query),

    );

  }, [chatUsers, searchQuery]);



  const humanChatsCount = chatUsers.filter((user) => !user.isAiAssistant).length;



  return (

    <div className={`chat-sidebar ${showChat ? 'show-chat' : ''}`}>

      <div className="chat-sidebar-header">

        <div className="chat-tabs">

          <button

            type="button"

            className={`chat-tab ${activeTab === 'chats' ? 'active' : ''}`}

            onClick={() => setActiveTab('chats')}

          >

            {t('chat.tabs.chats', 'Chats')}

            <Plus

              size={16}

              onClick={(event) => {

                event.stopPropagation();

                onNewMessage?.();

              }}

              style={{ cursor: 'pointer' }}

              aria-hidden

            />

          </button>

          <button

            type="button"

            className={`chat-tab ${activeTab === 'archived' ? 'active' : ''}`}

            onClick={() => setActiveTab('archived')}

          >

            {t('chat.tabs.archived', 'Archived')}

          </button>

        </div>

        <div className="chat-sidebar-toolbar">

          <div className="chat-search">

            <Search size={18} />

            <input

              type="search"

              placeholder={t('chat.searchPlaceholder', 'Search')}

              aria-label={t('chat.searchPlaceholder', 'Search')}

              value={searchQuery}

              onChange={(event) => setSearchQuery(event.target.value)}

            />

          </div>

          <button

            type="button"

            className={`chat-icon-btn${chatFilter ? ' chat-icon-btn--active' : ''}`}

            onClick={onOpenFilters}

            aria-label={t('chat.filters', 'Filters')}

            aria-pressed={Boolean(chatFilter)}

          >

            <Filter size={18} />

          </button>

          <button

            type="button"

            className="chat-icon-btn"

            onClick={onOpenSettings}

            aria-label={t('chat.settings', 'Settings')}

          >

            <MoreVertical size={18} />

          </button>

        </div>

      </div>



      <div className="chat-sidebar-body">

        <div className="chat-list">

          {filteredUsers.map((user) => (

            <button

              key={user.id}

              type="button"

              className={`chat-item ${selectedChat === user.id ? 'active' : ''} ${user.isAiAssistant ? 'chat-item--ai' : ''}`}

              onClick={() => onSelectChat(user.id)}

            >

              <div className="chat-item-avatar">

                <SafeImage

                  src={user.avatar || user.avatarSrc}

                  fallback={IMAGE_PLACEHOLDERS.avatar}

                  alt={user.name}

                />

                {user.isAiAssistant ? (

                  <span className="chat-item-ai-badge">

                    <Sparkles size={10} />

                  </span>

                ) : null}

                {user.activeNow ? <span className="active-indicator" /> : null}

              </div>

              <div className="chat-item-content">

                <div className="chat-item-header">

                  <span className="chat-item-name">{user.name}</span>

                  <span className="chat-item-time">{formatChatTime(user.time, dateLocale)}</span>

                </div>

                <div className="chat-item-message">

                  <span className={user.unread ? 'unread' : ''}>
                    {user.isDraft
                      ? `${t('chat.draftPrefix', 'Draft')}: ${user.lastMessage}`
                      : user.lastMessage}
                  </span>

                  {user.unread ? <span className="unread-badge" /> : null}

                </div>

              </div>

            </button>

          ))}



          {loading ? (

            <div className="chat-list-loading">{t('chat.loadingChats', 'Loading chats...')}</div>

          ) : null}



          {!loading && filteredUsers.length === 0 ? (

            <div className="chat-list-empty">

              <p>
                {searchQuery.trim()
                  ? t('chat.listSearchNoResults', 'No chats match your search.')
                  : t(
                      getChatFilterEmptyMessageKey(chatFilter, activeTab),
                      t('chat.listSearchNoResults', 'No chats match your search.'),
                    )}
              </p>

            </div>

          ) : null}

        </div>



        {!loading && humanChatsCount === 0 && searchQuery.trim() === '' ? (

          <div className="chat-sidebar-hint">

            <MessageSquarePlus size={28} strokeWidth={1.5} />

            <p>{t('chat.emptySubtitle', 'Create a new message to start chatting')}</p>

          </div>

        ) : null}

      </div>



      <div className="chat-sidebar-footer">

        <button type="button" className="chat-new-message-btn" onClick={() => onNewMessage?.()}>

          <Plus size={16} />

          {t('home.messages.new', 'New message')}

        </button>

      </div>

    </div>

  );

};



export default ChatSidebar;


