import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Phone,
  Search,
  MoreVertical,
  Smile,
  Paperclip,
  Send,
  Lightbulb,
  Archive,
  ArchiveRestore,
  Trash2,
  User,
  Star,
  ShieldAlert,
} from 'lucide-react';
import '../ChatMain/ChatMain.css';
import VoiceCallOverlay from './VoiceCallOverlay.jsx';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import { useTranslation, getDateLocale } from '../../app/i18n/LocaleContext.jsx';
import {
  getAiCommandChips,
  getAiQuickPrompts,
  getAiUserTextForPrompt,
} from '../../features/messaging/aiAssistantSession.js';
import { Sparkles } from 'lucide-react';
import SharedPostCard from './SharedPostCard.jsx';
import { mergeSharedPostDisplayMessages, resolveSharedPostMessage } from '../../features/messaging/sharedPostMessage.js';
import {
  clearChatDraft,
  getChatDraft,
  setChatDraft,
} from '../../features/messaging/chatDraftStorage.js';

const formatMessageTime = (value, dateLocale) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(dateLocale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ChatMain = ({
  selectedUser,
  messages,
  showChat,
  loading = false,
  sendError = '',
  onBackClick,
  onAvatarClick,
  currentUserId,
  onSendMessage,
  locale: localeProp,
  isChatArchived = false,
  isChatFavorite = false,
  isChatSpam = false,
  onArchiveChat,
  onUnarchiveChat,
  onToggleFavorite,
  onToggleSpam,
  onDeleteChat,
  onViewProfile,
  onDraftChange,
}) => {
  const { t, locale: contextLocale } = useTranslation();
  const locale = localeProp || contextLocale;
  const dateLocale = getDateLocale(locale);
  const isAiAssistant = Boolean(selectedUser?.isAiAssistant);
  const commandChips = isAiAssistant ? getAiCommandChips() : [];
  const chipLabelKeys = {
    help: 'chat.ai.chip.help',
    home: 'chat.ai.chip.home',
    profile: 'chat.ai.chip.profile',
    network: 'chat.ai.chip.network',
    vacancies: 'chat.ai.chip.vacancies',
  };
  const quickPrompts = isAiAssistant ? getAiQuickPrompts(locale) : [];
  const [messageText, setMessageText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [showAiPrompts, setShowAiPrompts] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const handleCall = () => {
    if (isAiAssistant) return;
    setMenuOpen(false);
    setCallActive(true);
  };

  const handleCallClose = () => {
    setCallActive(false);
  };

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setCallActive(false);
  }, [selectedUser?.id]);

  useEffect(() => {
    if (!selectedUser?.id || selectedUser.isAiAssistant || !currentUserId) {
      setMessageText('');
      return;
    }

    setMessageText(getChatDraft(currentUserId, selectedUser.id));
  }, [selectedUser?.id, selectedUser?.isAiAssistant, currentUserId]);

  const handleSearch = () => {
    setShowSearch((prev) => !prev);
    if (showSearch) setSearchQuery('');
  };

  const visibleMessages = useMemo(() => {
    const list = Array.isArray(messages) ? messages : [];
    const filtered = searchQuery
      ? list.filter((message) =>
          message.content?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : list;
    return mergeSharedPostDisplayMessages(filtered);
  }, [messages, searchQuery]);

  useEffect(() => {
    setShowAiPrompts(false);
  }, [selectedUser?.id]);

  useEffect(() => {
    if (visibleMessages.length > 2) {
      setShowAiPrompts(false);
    }
  }, [visibleMessages.length, selectedUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages.length, selectedUser?.id, loading]);

  const handleChipSend = async (text) => {
    if (!text?.trim() || !selectedUser || sending) return;
    setSending(true);
    try {
      await onSendMessage({ chatId: selectedUser.id, content: text.trim() });
    } finally {
      setSending(false);
    }
  };

  const handleQuickPrompt = async (promptId) => {
    const text = getAiUserTextForPrompt(promptId, locale);
    await handleChipSend(text);
  };

  const handleSend = async () => {
    if (!messageText.trim() || !selectedUser || sending) return;

    setSending(true);
    try {
      await onSendMessage({
        chatId: selectedUser.id,
        content: messageText.trim(),
      });
      setMessageText('');
      if (!selectedUser.isAiAssistant && currentUserId) {
        clearChatDraft(currentUserId, selectedUser.id);
        onDraftChange?.();
      }
    } finally {
      setSending(false);
    }
  };

  const handleMessageTextChange = (value) => {
    setMessageText(value);

    if (!selectedUser?.id || selectedUser.isAiAssistant || !currentUserId) return;

    setChatDraft(currentUserId, selectedUser.id, value);
    onDraftChange?.();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  if (!selectedUser) {
    return (
      <div className={`chat-main chat-main--idle ${showChat ? 'show-chat' : ''}`}>
        <div className="chat-header chat-header--placeholder" aria-hidden="true">
          <div className="chat-header-left">
            <div className="chat-header-user">
              <div className="chat-header-avatar-placeholder" />
              <div className="chat-header-info">
                <h2>&nbsp;</h2>
              </div>
            </div>
          </div>
          <div className="chat-header-actions" />
        </div>

        <div className="chat-messages">
          <div className="chat-empty-state chat-empty-state--landing">
            <Sparkles size={40} className="chat-empty-state-icon" />
            <p>{t('chat.selectChat', 'Select a chat to start messaging')}</p>
          </div>
        </div>

        <div className="chat-composer chat-composer--disabled">
          <div className="chat-input-wrapper">
            <input
              type="text"
              className="chat-input"
              placeholder={t('chat.writePlaceholder', 'Write something...')}
              disabled
              aria-disabled="true"
            />
            <div className="chat-input-actions" aria-hidden="true">
              <span className="input-action-button input-action-button--ghost" />
              <span className="input-action-button input-action-button--ghost" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-main ${showChat ? 'show-chat' : ''} ${isAiAssistant ? 'chat-main--ai' : ''}`}>
      <div className="chat-header">
        <div className="chat-header-left">
          <button type="button" className="back-button" onClick={onBackClick} aria-label={t('common.back', 'Back')}>
            ←
          </button>

          <div className={`chat-header-user ${isAiAssistant ? 'chat-header-user--ai' : ''}`}>
            <img
              src={getAssetUrl(
                selectedUser.avatar || selectedUser.avatarSrc,
                IMAGE_PLACEHOLDERS.avatar,
              )}
              alt={selectedUser.name}
              onClick={onAvatarClick}
              style={{ cursor: isAiAssistant ? 'default' : 'pointer' }}
            />
            <div className="chat-header-info">
              <h2>{selectedUser.name}</h2>
              {selectedUser.title && !isAiAssistant ? (
                <p className="chat-header-subtitle">{selectedUser.title}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="chat-header-actions">
          {!isAiAssistant ? (
            <>
              <button
                type="button"
                className="icon-button"
                onClick={handleCall}
                title={t('chat.call', 'Call')}
                aria-label={t('chat.call', 'Call')}
              >
                <Phone size={20} />
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={handleSearch}
                title={t('chat.searchConversation', 'Search in conversation...')}
                aria-label={t('chat.searchConversation', 'Search in conversation...')}
              >
                <Search size={20} />
              </button>
            </>
          ) : (
            <span className="chat-ai-badge">
              <Sparkles size={14} />
              AI
            </span>
          )}

          <div className="chat-more-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="icon-button"
              onClick={() => !isAiAssistant && setMenuOpen((prev) => !prev)}
              aria-label={t('chat.more', 'More')}
              aria-expanded={menuOpen}
              disabled={isAiAssistant}
            >
              <MoreVertical size={20} />
            </button>

            {menuOpen && !isAiAssistant ? (
              <div className="chat-more-menu" role="menu">
                {onViewProfile ? (
                  <button
                    type="button"
                    className="chat-more-menu__item"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onViewProfile();
                    }}
                  >
                    <User size={18} />
                    {t('chat.more.viewProfile', 'View profile')}
                  </button>
                ) : null}

                {isChatArchived ? (
                  <button
                    type="button"
                    className="chat-more-menu__item"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onUnarchiveChat?.(selectedUser.id);
                    }}
                  >
                    <ArchiveRestore size={18} />
                    {t('chat.more.unarchive', 'Unarchive chat')}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="chat-more-menu__item"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onArchiveChat?.(selectedUser.id);
                    }}
                  >
                    <Archive size={18} />
                    {t('chat.more.archive', 'Archive chat')}
                  </button>
                )}

                <button
                  type="button"
                  className="chat-more-menu__item"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleFavorite?.(selectedUser.id);
                  }}
                >
                  <Star size={18} />
                  {isChatFavorite
                    ? t('chat.more.unfavorite', 'Remove from favorites')
                    : t('chat.more.favorite', 'Add to favorites')}
                </button>

                <button
                  type="button"
                  className="chat-more-menu__item"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleSpam?.(selectedUser.id);
                  }}
                >
                  <ShieldAlert size={18} />
                  {isChatSpam
                    ? t('chat.more.unspam', 'Not spam')
                    : t('chat.more.spam', 'Mark as spam')}
                </button>

                <button
                  type="button"
                  className="chat-more-menu__item chat-more-menu__item--danger"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteChat?.(selectedUser.id);
                  }}
                >
                  <Trash2 size={18} />
                  {t('chat.more.delete', 'Delete chat')}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {callActive ? (
        <VoiceCallOverlay contact={selectedUser} onClose={handleCallClose} />
      ) : null}

      {showSearch ? (
        <div className="chat-search-bar">
          <input
            type="search"
            placeholder={t('chat.searchConversation', 'Search in conversation...')}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="chat-search-input"
            autoFocus
          />
        </div>
      ) : null}

      {sendError ? <div className="auth-field-error">{sendError}</div> : null}

      <div className="chat-messages" ref={messagesContainerRef}>
        {loading ? (
          <div className="network-loading">{t('chat.loadingMessages', 'Loading messages...')}</div>
        ) : null}

        {!loading && visibleMessages.length === 0 ? (
          <div className="chat-empty-state chat-empty-state--inline">
            <p>{t('chat.noMessagesYet', 'No messages yet')}</p>
          </div>
        ) : null}

        {visibleMessages.map((message) => {
          const isMine = message.isMine || message.senderId === currentUserId;
          const isAiMessage = message.isAiAssistant || message.senderId === 'aiassistant';
          const sharedPost = resolveSharedPostMessage(message);

          if (message.deleted) {
            return (
              <div key={message.id} className="message deleted">
                <div className="message-content">
                  <div className="message-bubble">
                    {t('chat.messageDeleted', 'Message deleted')}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={message.id}
              className={`message ${isMine ? 'me' : 'other'} ${isAiMessage ? 'message--ai' : ''}`}
            >
              {!isMine ? (
                <img
                  src={getAssetUrl(
                    message.sender?.avatarUrl || message.sender?.avatar,
                    IMAGE_PLACEHOLDERS.avatar,
                  )}
                  alt={message.sender?.firstName || 'User'}
                  className="message-avatar"
                />
              ) : null}

              <div className={`message-content${sharedPost ? ' message-content--shared-post' : ''}`}>
                {sharedPost ? (
                  <SharedPostCard
                    payload={sharedPost.payload}
                    media={message.media?.[0]}
                    isMine={isMine}
                  />
                ) : (
                  <>
                    <div className="message-bubble">{message.content}</div>

                    {message.media?.length > 0 ? (
                      <div className="message-media-list">
                        {message.media.map((media) => {
                          const mediaSrc = getAssetUrl(media.url || media.rawUrl, '');
                          if (!mediaSrc) return null;

                          const isImage =
                            !media.mediaType ||
                            media.mediaType.startsWith('image') ||
                            /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(mediaSrc);

                          return (
                            <a
                              key={media.id ?? media.url ?? mediaSrc}
                              href={mediaSrc}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {isImage ? (
                                <img
                                  src={getAssetUrl(media.url || media.rawUrl, IMAGE_PLACEHOLDERS.cover)}
                                  alt={t('chat.attachment', 'Attachment')}
                                  className="message-media-image"
                                />
                              ) : (
                                <span>{t('chat.attachment', 'Attachment')}</span>
                              )}
                            </a>
                          );
                        })}
                      </div>
                    ) : null}
                  </>
                )}

                <span className="message-time">
                  {formatMessageTime(message.sentAt ?? message.createdAt, dateLocale)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="chat-messages-anchor" aria-hidden="true" />
      </div>

      <div className="chat-composer">
        {isAiAssistant && showAiPrompts ? (
          <div className="chat-ai-toolbar">
            <div className="chat-ai-toolbar-row">
              <span className="chat-ai-toolbar-label">{t('chat.ai.commands', 'Commands')}</span>
              <div className="chat-ai-chips-scroll">
                {commandChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    className="chat-ai-chip"
                    onClick={() => handleChipSend(chip.text)}
                    disabled={sending}
                  >
                    {t(chipLabelKeys[chip.id] || chip.id, chip.text)}
                  </button>
                ))}
              </div>
            </div>

            <div className="chat-ai-prompts-scroll">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  className="chat-ai-prompt"
                  onClick={() => handleQuickPrompt(prompt.id)}
                  disabled={sending}
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="chat-input-wrapper">
        <input
          type="text"
          placeholder={t('chat.writePlaceholder', 'Write something...')}
          className="chat-input"
          value={messageText}
          onChange={(event) => handleMessageTextChange(event.target.value)}
          onKeyPress={handleKeyPress}
          disabled={sending}
        />

        <div className="chat-input-actions">
          {isAiAssistant ? (
            <button
              type="button"
              className={`input-action-button${showAiPrompts ? ' is-active' : ''}`}
              onClick={() => setShowAiPrompts((prev) => !prev)}
              title={
                showAiPrompts
                  ? t('chat.ai.hideSuggestions', 'Hide ideas')
                  : t('chat.ai.showSuggestions', 'Ideas')
              }
              aria-label={
                showAiPrompts
                  ? t('chat.ai.hideSuggestions', 'Hide ideas')
                  : t('chat.ai.showSuggestions', 'Ideas')
              }
              aria-expanded={showAiPrompts}
            >
              <Lightbulb size={20} />
            </button>
          ) : null}
          <button type="button" className="input-action-button" aria-label={t('chat.emoji', 'Emoji')}>
            <Smile size={20} />
          </button>
          <button
            type="button"
            className="input-action-button"
            title={t('chat.attach', 'Attach')}
            aria-label={t('chat.attach', 'Attach')}
          >
            <Paperclip size={20} />
          </button>

          {messageText.trim() ? (
            <button
              type="button"
              className="input-action-button"
              onClick={handleSend}
              disabled={sending}
              aria-label={t('common.send', 'Send')}
            >
              <Send size={20} />
            </button>
          ) : null}
        </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMain;
