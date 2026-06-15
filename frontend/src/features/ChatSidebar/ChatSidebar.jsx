import React from 'react';
import { Search, Plus, Filter, MoreVertical } from 'lucide-react';
import '../ChatSidebar/ChatSidebar.css';
import { fileUrl } from '../../shared/api/files';

const ChatSidebar = ({ activeTab, setActiveTab, chatUsers, selectedChat, onSelectChat, showChat, onNewMessage, onOpenFilters, onOpenSettings }) => {
  return (
    <div className={`chat-sidebar ${showChat ? 'show-chat' : ''}`}>
      <div className="chat-sidebar-header">
        <div className="chat-tabs">
          <button
            className={`chat-tab ${activeTab === 'chats' ? 'active' : ''}`}
            onClick={() => setActiveTab('chats')}
          >
            Chats
            <Plus size={16} onClick={(e) => { e.stopPropagation(); onNewMessage?.(); }} style={{ cursor: 'pointer' }} />
          </button>
          <button
            className={`chat-tab ${activeTab === 'archived' ? 'active' : ''}`}
            onClick={() => setActiveTab('archived')}
          >
            Archived
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
          <div className="chat-search" style={{ flex: 1 }}>
            <Search size={18} />
            <input type="text" placeholder="Search" />
          </div>
          <button
            onClick={onOpenFilters}
            style={{
              padding: '8px',
              border: 'none',
              background: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.background = 'white'}
          >
            <Filter size={18} color="#6b7280" />
          </button>
          <button
            onClick={onOpenSettings}
            style={{
              padding: '8px',
              border: 'none',
              background: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.background = 'white'}
          >
            <MoreVertical size={18} color="#6b7280" />
          </button>
        </div>
      </div>

      <div className="chat-list">
        {chatUsers.map(user => (
          <button
            key={user.id}
            className={`chat-item ${selectedChat === user.id ? 'active' : ''}`}
            onClick={() => onSelectChat(user.id)}
          >
            <div className="chat-item-avatar">
              <img src={fileUrl(user.avatar)} alt={user.name} />
              {user.activeNow && <span className="active-indicator"></span>}
            </div>
            <div className="chat-item-content">
              <div className="chat-item-header">
                <span className="chat-item-name">{user.name}</span>
                <span className="chat-item-time">{user.time}</span>
              </div>
              <div className="chat-item-message">
                <span className={user.unread ? 'unread' : ''}>{user.lastMessage}</span>
                {user.unread && <span className="unread-badge"></span>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
