import React, { useState, useMemo } from 'react';
import { Phone, Search, MoreVertical, Smile, Paperclip, Send } from 'lucide-react';
import '../ChatMain/ChatMain.css';
import { fileUrl } from '../../shared/api/files';

const ChatMain = ({
  selectedUser,
  messages,
  showChat,
  onBackClick,
  onAvatarClick,
  currentUserId,
  onSendMessage
}) => {
  const [messageText, setMessageText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCall = () => {
    alert(`Calling ${selectedUser?.name}...`);
  };

  const handleSearch = () => {
    setShowSearch(prev => !prev);
    if (showSearch) setSearchQuery('');
  };

  // ================= FILTER =================
  const visibleMessages = useMemo(() => {
    const list = Array.isArray(messages) ? messages : [];
    return searchQuery
      ? list.filter(m =>
          m.content?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : list;
  }, [messages, searchQuery]);

  // ================= SEND =================
  const handleSend = async () => {
    if (!messageText.trim() || !selectedUser) return;

    await onSendMessage({
      chatId: selectedUser.id,
      content: messageText
    });

    setMessageText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`chat-main ${showChat ? 'show-chat' : ''}`}>
      {/* HEADER */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="back-button" onClick={onBackClick}>←</button>

          <div className="chat-header-user">
            <img
              src={fileUrl(selectedUser?.avatar)}
              alt={selectedUser?.name}
              onClick={onAvatarClick}
              style={{ cursor: 'pointer' }}
            />
            <div className="chat-header-info">
              <h2>{selectedUser?.name}</h2>
            </div>
          </div>
        </div>

        <div className="chat-header-actions">
          <button className="icon-button" onClick={handleCall}><Phone size={20} /></button>
          <button className="icon-button" onClick={handleSearch}><Search size={20} /></button>
          <button className="icon-button"><MoreVertical size={20} /></button>
        </div>
      </div>

      {/* SEARCH */}
      {showSearch && (
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
      )}

      {/* MESSAGES */}
      <div className="chat-messages">
        {visibleMessages.map(message => {
          const isMine = message.senderId === currentUserId;

          return (
            <div key={message.id} className={`message ${isMine ? 'me' : 'other'}`}>
              {!isMine && (
                <img
                  src={fileUrl(message.sender?.avatarUrl)}
                  alt={message.sender?.firstName}
                  className="message-avatar"
                />
              )}

              <div className="message-content">
                <div className="message-bubble">{message.content}</div>
                <span className="message-time">{message.sentAt}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT */}
      <div className="chat-input-wrapper">
        <input
          type="text"
          placeholder="Write something..."
          className="chat-input"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
        />

        <div className="chat-input-actions">
          <button className="input-action-button"><Smile size={20} /></button>
          <button className="input-action-button"><Paperclip size={20} /></button>

          {messageText.trim() && (
            <button className="input-action-button" onClick={handleSend}>
              <Send size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMain;
