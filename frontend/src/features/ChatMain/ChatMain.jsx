import React, { useMemo, useState } from 'react';
import { Phone, Search, MoreVertical, Smile, Paperclip, Send } from 'lucide-react';
import '../ChatMain/ChatMain.css';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';

const formatMessageTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString([], {
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
}) => {
  const [messageText, setMessageText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);

  const handleCall = () => {
    // UI-only: backend call endpoint is not available.
  };

  const handleSearch = () => {
    setShowSearch((prev) => !prev);
    if (showSearch) setSearchQuery('');
  };

  const visibleMessages = useMemo(() => {
    const list = Array.isArray(messages) ? messages : [];
    return searchQuery
      ? list.filter((message) =>
          message.content?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : list;
  }, [messages, searchQuery]);

  const handleSend = async () => {
    if (!messageText.trim() || !selectedUser || sending) return;

    setSending(true);
    try {
      await onSendMessage({
        chatId: selectedUser.id,
        content: messageText.trim(),
      });
      setMessageText('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedUser) {
    return (
      <div className={`chat-main ${showChat ? 'show-chat' : ''}`}>
        <div className="network-empty">Select a chat to start messaging</div>
      </div>
    );
  }

  return (
    <div className={`chat-main ${showChat ? 'show-chat' : ''}`}>
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" className="back-button" onClick={onBackClick}>
            ←
          </button>

          <div className="chat-header-user">
            <img
              src={getAssetUrl(selectedUser.avatar || selectedUser.avatarSrc, IMAGE_PLACEHOLDERS.avatar)}
              alt={selectedUser.name}
              onClick={onAvatarClick}
              style={{ cursor: 'pointer' }}
            />
            <div className="chat-header-info">
              <h2>{selectedUser.name}</h2>
            </div>
          </div>
        </div>

        <div className="chat-header-actions">
          <button type="button" className="icon-button" onClick={handleCall} title="Calls are not available yet">
            <Phone size={20} />
          </button>
          <button type="button" className="icon-button" onClick={handleSearch}>
            <Search size={20} />
          </button>
          <button type="button" className="icon-button">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {showSearch ? (
        <div className="chat-search-bar">
          <input
            type="text"
            placeholder="Search in conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="chat-search-input"
            autoFocus
          />
        </div>
      ) : null}

      {sendError ? <div className="auth-field-error">{sendError}</div> : null}

      <div className="chat-messages">
        {loading ? <div className="network-loading">Loading messages...</div> : null}

        {!loading && visibleMessages.length === 0 ? (
          <div className="network-empty">No messages yet</div>
        ) : null}

        {visibleMessages.map((message) => {
          const isMine =
            message.isMine || message.senderId === currentUserId;

          if (message.deleted) {
            return (
              <div key={message.id} className="message deleted">
                <div className="message-content">
                  <div className="message-bubble">Message deleted</div>
                </div>
              </div>
            );
          }

          return (
            <div key={message.id} className={`message ${isMine ? 'me' : 'other'}`}>
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

              <div className="message-content">
                <div className="message-bubble">{message.content}</div>

                {message.media?.length > 0 ? (
                  <div className="message-media-list">
                    {message.media.map((media) => (
                      <a
                        key={media.id ?? media.url}
                        href={getAssetUrl(media.url || media.rawUrl)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {media.mediaType?.startsWith('image') ? (
                          <img
                            src={getAssetUrl(media.url || media.rawUrl, IMAGE_PLACEHOLDERS.cover)}
                            alt="Attachment"
                            className="message-media-image"
                          />
                        ) : (
                          <span>Attachment</span>
                        )}
                      </a>
                    ))}
                  </div>
                ) : null}

                <span className="message-time">
                  {formatMessageTime(message.sentAt ?? message.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-input-wrapper">
        <input
          type="text"
          placeholder="Write something..."
          className="chat-input"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={sending}
        />

        <div className="chat-input-actions">
          <button type="button" className="input-action-button">
            <Smile size={20} />
          </button>
          <button type="button" className="input-action-button" title="Media upload API is ready but UI is not wired">
            <Paperclip size={20} />
          </button>

          {messageText.trim() ? (
            <button
              type="button"
              className="input-action-button"
              onClick={handleSend}
              disabled={sending}
            >
              <Send size={20} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ChatMain;
