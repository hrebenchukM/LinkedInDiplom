import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';

import './MessagesPage.css';
import ChatSidebar from '../../features/ChatSidebar/ChatSidebar';
import ChatMain from '../../features/ChatMain/ChatMain';
import ChatProfilePanel from '../../features/ChatProfilePanel/ChatProfilePanel';
import NewMessageModal from '../../features/Modals/NewMessageModal';
import MessageFiltersModal from '../../features/Modals/MessageFiltersModal';
import MessageSettingsModal from '../../features/Modals/MessageSettingsModal';
import AppContext from '../../features/appContext/AppContext';
import {
  getMyChats,
  getChatMessages,
  sendMessage,
  markMessageAsRead,
} from '../../features/messaging/messagingApi.js';
import { mapMessageToCreateRequest } from '../../features/messaging/mapMessaging.js';
import {
  enrichChatsWithCompanions,
  enrichMessagesWithSenders,
} from '../../features/messaging/enrichMessagingProfiles.js';
import {
  startMessagingConnection,
  stopMessagingConnection,
  joinChat,
  leaveChat,
  onMessageCreated,
  offMessageCreated,
  onMessageUpdated,
  offMessageUpdated,
  onMessageDeleted,
  offMessageDeleted,
  onMessageMediaAttached,
  offMessageMediaAttached,
} from '../../features/messaging/signalRService.js';
import { DEFAULT_PAGE_SIZE } from '../../shared/api/config.js';
import { getErrorMessage } from '../../shared/lib/apiError.js';

const sortMessages = (list) =>
  [...list].sort(
    (a, b) => new Date(a.sentAt ?? a.createdAt) - new Date(b.sentAt ?? b.createdAt),
  );

const MessagesPage = () => {
  const { token, account } = useContext(AppContext);
  const currentUserId = account?.id ?? account?.userId ?? null;

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [sendError, setSendError] = useState('');

  const [activeTab, setActiveTab] = useState('chats');
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const selectedChatRef = useRef(null);
  const previousChatRef = useRef(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const updateChatPreview = useCallback((chatId, message) => {
    if (!chatId || !message) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              lastMessage: message.deleted ? 'Message deleted' : message.content,
              lastMessageAt: message.sentAt ?? message.createdAt,
              time: message.sentAt ?? message.createdAt,
              unread: chat.id !== selectedChatRef.current,
              hasUnread: chat.id !== selectedChatRef.current,
            }
          : chat,
      ),
    );
  }, []);

  const loadChats = useCallback(async () => {
    if (!token || !currentUserId) return;

    setError('');
    const result = await getMyChats(
      { page: 1, pageSize: DEFAULT_PAGE_SIZE },
      currentUserId,
    );
    const enriched = await enrichChatsWithCompanions(result.items, currentUserId);
    setChats(enriched);
    return enriched;
  }, [token, currentUserId]);

  const loadMessagesForChat = useCallback(
    async (chatId) => {
      if (!chatId || !currentUserId) return;

      setLoadingMessages(true);
      setSendError('');

      try {
        const result = await getChatMessages(
          chatId,
          { page: 1, pageSize: 50 },
          currentUserId,
        );
        const enriched = await enrichMessagesWithSenders(result.items);
        const sorted = sortMessages(enriched);
        setMessages(sorted);

        const latest = sorted[sorted.length - 1];
        if (latest?.id && !String(latest.id).startsWith('tmp-')) {
          markMessageAsRead(latest.id).catch(() => {});
        }

        if (latest) {
          updateChatPreview(chatId, latest);
        }
      } catch (err) {
        setSendError(getErrorMessage(err));
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    },
    [currentUserId, updateChatPreview],
  );

  useEffect(() => {
    if (!token || !currentUserId) {
      setLoadingChats(false);
      if (!token) setChats([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoadingChats(true);
      try {
        await loadChats();
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoadingChats(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, currentUserId, loadChats]);

  useEffect(() => {
    if (!token) return undefined;

    startMessagingConnection();

    const handleCreated = async (message) => {
      if (!message?.id) return;

      updateChatPreview(message.chatId, message);

      if (message.chatId === selectedChatRef.current) {
        const enriched = (await enrichMessagesWithSenders([message]))[0];
        setMessages((prev) => {
          if (prev.some((item) => item.id === enriched.id)) return prev;
          const withoutTemp = prev.filter(
            (item) =>
              !String(item.id).startsWith('tmp-') || item.content !== enriched.content,
          );
          return sortMessages([...withoutTemp, enriched]);
        });

        if (message.senderId !== currentUserId) {
          markMessageAsRead(message.id).catch(() => {});
        }
      }
    };

    const handleUpdated = async (message) => {
      if (!message?.id) return;
      const enriched = (await enrichMessagesWithSenders([message]))[0];
      setMessages((prev) =>
        sortMessages(
          prev.map((item) => (item.id === enriched.id ? { ...item, ...enriched } : item)),
        ),
      );
      updateChatPreview(message.chatId, enriched);
    };

    const handleDeleted = ({ chatId, messageId }) => {
      setMessages((prev) => prev.filter((item) => item.id !== messageId));
      updateChatPreview(chatId, {
        content: 'Message deleted',
        deleted: true,
        sentAt: new Date().toISOString(),
      });
    };

    const handleMediaAttached = ({ chatId, messageId, media }) => {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === messageId
            ? { ...item, media: [...(item.media ?? []), media].filter(Boolean) }
            : item,
        ),
      );
      if (chatId === selectedChatRef.current) {
        updateChatPreview(chatId, {
          content: 'Attachment',
          sentAt: new Date().toISOString(),
        });
      }
    };

    onMessageCreated(handleCreated);
    onMessageUpdated(handleUpdated);
    onMessageDeleted(handleDeleted);
    onMessageMediaAttached(handleMediaAttached);

    return () => {
      offMessageCreated(handleCreated);
      offMessageUpdated(handleUpdated);
      offMessageDeleted(handleDeleted);
      offMessageMediaAttached(handleMediaAttached);
      stopMessagingConnection();
    };
  }, [token, currentUserId, updateChatPreview]);

  useEffect(() => {
    if (!selectedChat) return undefined;

    const previousChat = previousChatRef.current;
    if (previousChat && previousChat !== selectedChat) {
      leaveChat(previousChat);
    }

    joinChat(selectedChat);
    previousChatRef.current = selectedChat;
    loadMessagesForChat(selectedChat);

    return () => {
      leaveChat(selectedChat);
    };
  }, [selectedChat, loadMessagesForChat]);

  const handleSelectChat = (chatId) => {
    setSelectedChat(chatId);
    setShowChat(true);
    setShowProfile(false);
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, unread: false, hasUnread: false, unreadCount: 0 }
          : chat,
      ),
    );
  };

  const handleSendMessage = async ({ chatId, content }) => {
    if (!chatId || !content?.trim()) return;

    const tempId = `tmp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      chatId,
      senderId: currentUserId,
      content,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isMine: true,
      sender: {
        id: currentUserId,
        avatarUrl: account?.avatarUrl ?? null,
      },
    };

    setMessages((prev) => sortMessages([...prev, optimistic]));
    setSendError('');

    try {
      const saved = await sendMessage(
        chatId,
        mapMessageToCreateRequest({ content }),
        currentUserId,
      );
      const enriched = (await enrichMessagesWithSenders([saved]))[0];

      setMessages((prev) =>
        sortMessages(
          prev.map((item) => (item.id === tempId ? enriched : item)),
        ),
      );
      updateChatPreview(chatId, enriched);
    } catch (err) {
      setMessages((prev) => prev.filter((item) => item.id !== tempId));
      setSendError(getErrorMessage(err));
    }
  };

  const handleChatCreated = async (chatId) => {
    setIsNewMessageModalOpen(false);
    const enriched = await loadChats();
    const exists = enriched?.some((chat) => chat.id === chatId);
    if (exists) {
      handleSelectChat(chatId);
    }
  };

  const chatUsers = chats.map((chat) => ({
    id: chat.id,
    name: chat.name ?? 'User',
    avatar: chat.avatar ?? chat.companion?.avatarUrl ?? null,
    lastMessage: chat.lastMessage || '',
    time: chat.time ?? chat.lastMessageAt ?? chat.updatedAt,
    unread: chat.unread || chat.hasUnread || (chat.unreadCount ?? 0) > 0,
    activeNow: false,
    companion: chat.companion,
  }));

  const selectedUser = chatUsers.find((user) => user.id === selectedChat) || null;

  return (
    <>
      <div className={`messages-page ${showProfile ? 'profile-open' : ''}`}>
        {error ? <div className="auth-error">{error}</div> : null}

        <ChatSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          chatUsers={chatUsers}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          showChat={showChat}
          loading={loadingChats}
          onNewMessage={() => setIsNewMessageModalOpen(true)}
          onOpenFilters={() => setIsFiltersModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        <ChatMain
          selectedUser={selectedUser}
          messages={messages}
          showChat={showChat}
          loading={loadingMessages}
          sendError={sendError}
          onBackClick={() => {
            setShowChat(false);
            setShowProfile(false);
          }}
          onAvatarClick={() => {
            if (!selectedUser) return;
            setShowProfile(true);
          }}
          currentUserId={currentUserId}
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
        currentUserId={currentUserId}
        onChatCreated={handleChatCreated}
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
