import React, { useEffect, useState, useContext } from 'react';

import './MessagesPage.css';
import ChatSidebar from '../../features/ChatSidebar/ChatSidebar';
import ChatMain from '../../features/ChatMain/ChatMain';
import ChatProfilePanel from '../../features/ChatProfilePanel/ChatProfilePanel';
import NewMessageModal from '../../features/Modals/NewMessageModal';
import MessageFiltersModal from '../../features/Modals/MessageFiltersModal';
import MessageSettingsModal from '../../features/Modals/MessageSettingsModal';
import AppContext from '../../features/appContext/AppContext';
import { useParams } from 'react-router-dom';

const MessagesPage = ({ onNavigate }) => {
 const { request, user, profile } = useContext(AppContext);

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const [activeTab, setActiveTab] = useState('chats');
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const sortMessages = (list) =>
  [...list].sort(
    (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
  );


  // ================= SSE =================
  useEffect(() => {
    if (!selectedChat) return;

    const token = localStorage.getItem('token');

    const es = new EventSource(
      `http://localhost:8080/JavaWeb222/chat/stream?chatId=${selectedChat}&token=${token}`
    );

    es.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return sortMessages([...prev, msg]);
      });
    };

    es.onerror = () => {
      es.close();
    };

    return () => es.close();
  }, [selectedChat]);

  // ================= LOAD CHATS =================
  useEffect(() => {
    request('api://chats').then(data => {
      setChats(data || []);
    });
  }, []);

  // ================= SELECT CHAT =================
  const handleSelectChat = (chatId) => {
    setSelectedChat(chatId);
    setShowChat(true);

    request(`api://messages?chatId=${chatId}`).then(data => {
      setMessages(sortMessages(data || []));
    });

  };

  // ================= SEND MESSAGE (🔥 ВАЖНО) =================
const handleSendMessage = async ({ chatId, content }) => {
  // 1️⃣ optimistic message
  const tempMessage = {
    id: 'tmp-' + Date.now(),
    chatId,
    senderId: user.id,
    content,
    sentAt: new Date().toISOString(),
    sender: {
      id: user.id,
      avatarUrl: profile?.avatarUrl
    }
  };

  setMessages(prev => sortMessages([...prev, tempMessage]));

  // 2️⃣ real POST
  await request('api://messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatId,
      content,
      isDraft: 0
    })
  });
};



  // ================= UI ADAPTER =================
  const chatUsers = chats.map(chat => ({
    id: chat.chatId,

    name: chat.companion
      ? `${chat.companion.firstName} ${chat.companion.secondName}`
      : 'Unknown user',

    avatar: chat.companion?.avatarUrl || null,

    lastMessage: chat.lastMessage,
    time: chat.lastMessageAt,
    unread: chat.hasUnread,
    activeNow: false,

    companion: chat.companion
  }));

  const selectedUser =
    chatUsers.find(u => u.id === selectedChat) || null;

  const handleBackClick = () => {
    setShowChat(false);
    setShowProfile(false);
  };

  const handleAvatarClick = () => {
    if (!selectedUser) return;
    setShowProfile(true);
  };

  return (
    <>
      <div className={`messages-page ${showProfile ? 'profile-open' : ''}`}>
        <ChatSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          chatUsers={chatUsers}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          showChat={showChat}
          onNewMessage={() => setIsNewMessageModalOpen(true)}
          onOpenFilters={() => setIsFiltersModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        <ChatMain
          selectedUser={selectedUser}
          messages={messages}
          showChat={showChat}
          onBackClick={handleBackClick}
          onAvatarClick={handleAvatarClick}
          currentUserId={user?.id}
          onSendMessage={handleSendMessage}   
        />

        <ChatProfilePanel
          selectedUser={selectedUser}
          showProfile={showProfile}
          onBackClick={() => setShowProfile(false)}
        />
      </div>

      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
      />
      <MessageFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
      />
      <MessageSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </>
  );
};

export default MessagesPage;
