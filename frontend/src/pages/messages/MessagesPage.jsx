import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import './MessagesPage.css';
import ChatSidebar from '../../features/ChatSidebar/ChatSidebar';
import ChatMain from '../../features/ChatMain/ChatMain';
import ChatProfilePanel from '../../features/ChatProfilePanel/ChatProfilePanel';
import NewMessageModal from '../../features/Modals/NewMessageModal';
import MessageFiltersModal from '../../features/Modals/MessageFiltersModal';
import MessageSettingsModal from '../../features/Modals/MessageSettingsModal';
import AppContext from '../../features/appContext/AppContext';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import {
  getMyChats,
  getChatMessages,
  sendMessage,
  markMessageAsRead,
  removeChatForUser,
} from '../../features/messaging/messagingApi.js';
import { mapMessageToCreateRequest } from '../../features/messaging/mapMessaging.js';
import {
  enrichChatsWithCompanions,
  enrichMessagesWithSenders,
} from '../../features/messaging/enrichMessagingProfiles.js';
import {
  startMessagingConnection,
  joinChat,
  onMessageCreated,
  offMessageCreated,
  onMessageUpdated,
  offMessageUpdated,
  onMessageDeleted,
  offMessageDeleted,
  onMessageMediaAttached,
  offMessageMediaAttached,
} from '../../features/messaging/signalRService.js';
import { getErrorMessage } from '../../shared/lib/apiError.js';
import { truncateChatPreview } from '../../shared/lib/formatChatTime.js';
import {
  AI_ASSISTANT_CHAT_ID,
  AI_ASSISTANT_UPDATED_EVENT,
  buildAiAssistantDisplayChat,
  isAiAssistantChatId,
  loadAiAssistantMessages,
  mapAiNavigatePath,
  processAiAssistantSend,
  saveAiAssistantMessages,
} from '../../features/messaging/aiAssistantSession.js';
import {
  clearUserInitiatedChat,
  markUserInitiatedChat,
} from '../../features/messaging/userInitiatedChats.js';
import { MESSAGING_CHANGED_EVENT, notifyMessagingChanged } from '../../features/messaging/messagingEvents.js';
import { isTestChatContent } from '../../features/messaging/mapMessaging.js';
import { setStoredChatPreview } from '../../features/messaging/userInitiatedChats.js';
import { getSharedPostPreview } from '../../features/messaging/sharedPostMessage.js';
import {
  archiveChat,
  clearArchivedChat,
  getArchivedChatIds,
  isChatArchived,
  unarchiveChat,
} from '../../features/messaging/chatArchiveStorage.js';
import {
  getFavoriteChatIds,
  getSpamChatIds,
  isChatFavorite,
  isChatSpam,
  toggleFavoriteChat,
  toggleSpamChat,
} from '../../features/messaging/chatListStorage.js';
import {
  getChatDraft,
  getChatIdsWithDrafts,
} from '../../features/messaging/chatDraftStorage.js';
import {
  appendCallMessage,
  clearCallMessagesForChat,
  getCallMessagesForChat,
} from '../../features/messaging/chatCallStorage.js';
import {
  buildCallMessage,
  getCallMessageText,
  mergeCallMessages,
} from '../../shared/lib/callMessage.js';
import {
  filterChatsForSidebar,
  getChatFilterEmptyMessageKey,
} from '../../features/messaging/chatListFilters.js';
import { getMyContacts } from '../../features/network/networkApi.js';
import { getContactOtherUserId } from '../../features/network/mapNetwork.js';

const sortMessages = (list) =>
  [...list].sort(
    (a, b) => new Date(a.sentAt ?? a.createdAt) - new Date(b.sentAt ?? b.createdAt),
  );

/** Prefer first user-to-user chat for default route; AI assistant is opt-in from sidebar. */
const pickDefaultChatId = (chatList) => {
  const firstReal = (chatList ?? []).find(
    (chat) => chat?.id && !isAiAssistantChatId(chat.id),
  );
  return firstReal?.id ?? AI_ASSISTANT_CHAT_ID;
};

const MessagesPage = () => {
  const { token, account } = useContext(AppContext);
  const { t, locale } = useTranslation();
  const { chatId: routeChatId } = useParams();
  const navigate = useNavigate();
  const currentUserId = account?.id ?? account?.userId ?? null;

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(() => routeChatId || null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [sendError, setSendError] = useState('');

  const [activeTab, setActiveTab] = useState('chats');
  const [showChat, setShowChat] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [chatFilter, setChatFilter] = useState(null);
  const [contactUserIds, setContactUserIds] = useState(() => new Set());
  const [labelsTick, setLabelsTick] = useState(0);
  const [draftTick, setDraftTick] = useState(0);
  const [actionNotice, setActionNotice] = useState('');
  const [archiveTick, setArchiveTick] = useState(0);

  const archivedChatIds = useMemo(
    () => new Set(getArchivedChatIds(currentUserId)),
    [currentUserId, archiveTick],
  );

  const favoriteChatIds = useMemo(
    () => new Set(getFavoriteChatIds(currentUserId)),
    [currentUserId, labelsTick],
  );

  const spamChatIds = useMemo(
    () => new Set(getSpamChatIds(currentUserId)),
    [currentUserId, labelsTick],
  );

  const draftChatIds = useMemo(
    () => new Set(getChatIdsWithDrafts(currentUserId)),
    [currentUserId, draftTick],
  );

  const [aiPreview, setAiPreview] = useState(() => t('chat.ai.preview', 'Ask me anything about LinkUp'));

  const selectedChatRef = useRef(null);
  const messagesRequestRef = useRef(0);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const updateChatPreview = useCallback((chatId, message) => {
    if (!chatId || !message) return;
    if (isAiAssistantChatId(chatId)) return;

    const preview = message.deleted
      ? t('chat.messageDeleted', 'Message deleted')
      : getSharedPostPreview(message.content, message.content);

    if (preview && isTestChatContent(preview)) {
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      return;
    }

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              lastMessage: preview,
              lastMessageAt: message.sentAt ?? message.createdAt,
              time: message.sentAt ?? message.createdAt,
              unread: String(chat.id) !== String(selectedChatRef.current),
              hasUnread: String(chat.id) !== String(selectedChatRef.current),
            }
          : chat,
      ),
    );
    if (preview) {
      setStoredChatPreview(chatId, preview);
    }
  }, [t]);

  const loadChats = useCallback(async () => {
    if (!token || !currentUserId) return;

    setError('');
    const result = await getMyChats(
      { page: 1, pageSize: 100 },
      currentUserId,
    );
    const enriched = await enrichChatsWithCompanions(result.items, currentUserId);
    setChats(enriched);
    return enriched;
  }, [token, currentUserId]);

  const loadMessagesForChat = useCallback(
    async (chatId) => {
      if (!chatId || !currentUserId) return;

      if (isAiAssistantChatId(chatId)) {
        messagesRequestRef.current += 1;
        setLoadingMessages(false);
        setSendError('');
        setMessages(loadAiAssistantMessages(t));
        return;
      }

      const requestId = ++messagesRequestRef.current;

      setLoadingMessages(true);
      setSendError('');

      try {
        const result = await getChatMessages(
          chatId,
          { page: 1, pageSize: 50 },
          currentUserId,
        );
        if (requestId !== messagesRequestRef.current) return;

        const enriched = await enrichMessagesWithSenders(result.items);
        if (requestId !== messagesRequestRef.current) return;

        const storedCalls = getCallMessagesForChat(currentUserId, chatId).map((message) => ({
          ...message,
          content: message.content || getCallMessageText(message, t),
        }));
        const withCalls = mergeCallMessages(enriched, storedCalls);
        const sorted = sortMessages(withCalls);
        setMessages(sorted);

        const latest = sorted[sorted.length - 1];
        if (latest?.id && !String(latest.id).startsWith('tmp-')) {
          markMessageAsRead(latest.id).catch(() => {});
        }

        if (latest) {
          updateChatPreview(chatId, latest);
        }
      } catch (err) {
        if (requestId !== messagesRequestRef.current) return;
        setSendError(getErrorMessage(err));
        setMessages([]);
      } finally {
        if (requestId === messagesRequestRef.current) {
          setLoadingMessages(false);
        }
      }
    },
    [currentUserId, updateChatPreview, t],
  );

  const resetToAiAssistantChat = useCallback(() => {
    messagesRequestRef.current += 1;
    setMessages(loadAiAssistantMessages(t));
    setLoadingMessages(false);
    setSendError('');
    setShowProfile(false);
    setSelectedChat(AI_ASSISTANT_CHAT_ID);
    setShowChat(true);
    setActiveTab('chats');
    navigate(`/app/messages/${AI_ASSISTANT_CHAT_ID}`, { replace: true });
  }, [navigate, t]);

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
    if (!currentUserId) {
      setContactUserIds(new Set());
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const result = await getMyContacts({ page: 1, pageSize: 100 });
        if (cancelled) return;

        const ids = new Set(
          (result.items ?? [])
            .map((contact) => getContactOtherUserId(contact, currentUserId))
            .filter(Boolean)
            .map(String),
        );
        setContactUserIds(ids);
      } catch {
        if (!cancelled) setContactUserIds(new Set());
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  useEffect(() => {
    const onMessagingChanged = () => {
      loadChats().catch(() => {});
    };

    window.addEventListener(MESSAGING_CHANGED_EVENT, onMessagingChanged);
    return () => window.removeEventListener(MESSAGING_CHANGED_EVENT, onMessagingChanged);
  }, [loadChats]);

  useEffect(() => {
    if (!token) return undefined;

    startMessagingConnection();

    const handleCreated = async (message) => {
      if (!message?.id) return;
      if (isTestChatContent(message.content)) return;

      updateChatPreview(message.chatId, message);

      if (String(message.chatId) === String(selectedChatRef.current)) {
        const enriched = (await enrichMessagesWithSenders([message]))[0];
        setMessages((prev) => {
          if (prev.some((item) => String(item.id) === String(enriched.id))) return prev;
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

      if (String(message.chatId) !== String(selectedChatRef.current)) {
        updateChatPreview(message.chatId, message);
        return;
      }

      const enriched = (await enrichMessagesWithSenders([message]))[0];
      setMessages((prev) =>
        sortMessages(
          prev.map((item) => (item.id === enriched.id ? { ...item, ...enriched } : item)),
        ),
      );
      updateChatPreview(message.chatId, enriched);
    };

    const handleDeleted = ({ chatId, messageId }) => {
      if (String(chatId) === String(selectedChatRef.current)) {
        setMessages((prev) => prev.filter((item) => item.id !== messageId));
      }
      updateChatPreview(chatId, {
        content: t('chat.messageDeleted', 'Message deleted'),
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
      if (String(chatId) === String(selectedChatRef.current)) {
        updateChatPreview(chatId, {
          content: t('chat.attachment', 'Attachment'),
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
    };
  }, [token, currentUserId, updateChatPreview, t]);

  useEffect(() => {
    if (!selectedChat || isAiAssistantChatId(selectedChat)) return undefined;

    let cancelled = false;
    const chatId = selectedChat;

    (async () => {
      await joinChat(chatId);
      if (cancelled) return;

      loadMessagesForChat(chatId);
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedChat, loadMessagesForChat]);

  useEffect(() => {
    if (!selectedChat || !isAiAssistantChatId(selectedChat)) return undefined;
    messagesRequestRef.current += 1;
    setLoadingMessages(false);
    setSendError('');
    setMessages(loadAiAssistantMessages(t));
    return undefined;
  }, [selectedChat, t]);

  useEffect(() => {
    const syncAiAssistantFromStorage = () => {
      const stored = loadAiAssistantMessages(t);
      const latest = stored[stored.length - 1];
      if (latest?.content) {
        setAiPreview(truncateChatPreview(latest.content));
      }
      if (selectedChat && isAiAssistantChatId(selectedChat)) {
        setMessages(stored);
      }
    };

    syncAiAssistantFromStorage();
    window.addEventListener(AI_ASSISTANT_UPDATED_EVENT, syncAiAssistantFromStorage);
    return () => window.removeEventListener(AI_ASSISTANT_UPDATED_EVENT, syncAiAssistantFromStorage);
  }, [selectedChat, t]);

  const handleSelectChat = (chatId) => {
    messagesRequestRef.current += 1;

    if (isAiAssistantChatId(chatId)) {
      setMessages(loadAiAssistantMessages(t));
      setLoadingMessages(false);
      setSendError('');
    } else {
      setMessages([]);
      setLoadingMessages(true);
      setSendError('');
    }

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
    if (chatId) {
      navigate(`/app/messages/${chatId}`, { replace: routeChatId === chatId });
    }
  };

  useEffect(() => {
    if (routeChatId || loadingChats) return;
    navigate(`/app/messages/${pickDefaultChatId(chats)}`, { replace: true });
  }, [routeChatId, loadingChats, chats, navigate]);

  useEffect(() => {
    if (!routeChatId || loadingChats || isAiAssistantChatId(routeChatId)) return;
    const inList = chats.some((chat) => String(chat.id) === String(routeChatId));
    if (!inList) {
      loadChats().catch(() => {});
    }
  }, [routeChatId, chats, loadingChats, loadChats]);

  useEffect(() => {
    if (!routeChatId || loadingChats) return;
    if (isAiAssistantChatId(routeChatId)) {
      if (String(selectedChat) !== String(routeChatId)) {
        setSelectedChat(routeChatId);
        setShowChat(true);
        setShowProfile(false);
      }
      return;
    }
    const exists = chats.some((chat) => String(chat.id) === String(routeChatId));
    if (exists && String(selectedChat) !== String(routeChatId)) {
      setSelectedChat(routeChatId);
      setShowChat(true);
      setShowProfile(false);
      setChats((prev) =>
        prev.map((chat) =>
          String(chat.id) === String(routeChatId)
            ? { ...chat, unread: false, hasUnread: false, unreadCount: 0 }
            : chat,
        ),
      );
    }
  }, [routeChatId, chats, loadingChats, selectedChat]);

  const handleCallEnded = useCallback(({ chatId, callStatus }) => {
    if (!chatId || !currentUserId || isAiAssistantChatId(chatId)) return;

    const callMessage = buildCallMessage({
      chatId,
      callStatus,
      currentUserId,
      t,
    });

    appendCallMessage(currentUserId, chatId, callMessage);

    setMessages((prev) => sortMessages([...prev, callMessage]));
    updateChatPreview(chatId, callMessage);
  }, [currentUserId, t, updateChatPreview]);

  const handleSendMessage = async ({ chatId, content }) => {
    if (!chatId || !content?.trim()) return;

    if (isAiAssistantChatId(chatId)) {
      setSendError('');
      const { userMessage, aiMessage, action } = processAiAssistantSend({
        userText: content,
        lang: locale,
        currentUserId,
        t,
      });

      setMessages((prev) => {
        const next = sortMessages([...prev, userMessage, aiMessage]);
        saveAiAssistantMessages(next);
        return next;
      });
      setAiPreview(truncateChatPreview(aiMessage.content));

      if (action?.type === 'navigate' && action.path) {
        navigate(mapAiNavigatePath(action.path));
      }
      return;
    }

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

  const handleChatCreated = async (chatId, person) => {
    if (person?.userId) {
      markUserInitiatedChat(chatId, person.userId);
    } else {
      markUserInitiatedChat(chatId);
    }

    setIsNewMessageModalOpen(false);
    setActiveTab('chats');

    const enriched = await loadChats();
    const exists = enriched?.some((chat) => String(chat.id) === String(chatId));

    if (!exists && person) {
      setChats((prev) => {
        if (prev.some((chat) => String(chat.id) === String(chatId))) return prev;
        return [
          {
            id: chatId,
            name: person.name ?? 'User',
            avatar: person.avatarUrl ?? null,
            avatarSrc: person.avatarUrl ?? null,
            title: person.title ?? '',
            lastMessage: '',
            time: new Date().toISOString(),
            unread: false,
            companionUserId: person.userId,
            companion: {
              id: person.userId,
              firstName: person.name?.split(' ')[0] ?? 'User',
              secondName: person.name?.split(' ').slice(1).join(' ') ?? '',
              avatarUrl: person.avatarUrl ?? null,
              profileTitle: person.title ?? '',
            },
          },
          ...prev,
        ];
      });
    }

    handleSelectChat(chatId);
    notifyMessagingChanged();
  };

  const redirectAfterChatRemoved = (removedChatId) => {
    if (String(selectedChat) !== String(removedChatId)) return;
    resetToAiAssistantChat();
  };

  const handleArchiveChat = (chatId) => {
    if (!chatId || isAiAssistantChatId(chatId)) return;
    archiveChat(currentUserId, chatId);
    setArchiveTick((value) => value + 1);
    setActionNotice(t('chat.archived', 'Chat moved to archive'));
    redirectAfterChatRemoved(chatId);
  };

  const handleUnarchiveChat = (chatId) => {
    if (!chatId || isAiAssistantChatId(chatId)) return;
    unarchiveChat(currentUserId, chatId);
    setArchiveTick((value) => value + 1);
    setActiveTab('chats');
    setActionNotice(t('chat.unarchived', 'Chat restored from archive'));
    handleSelectChat(chatId);
  };

  const finalizeChatRemoval = (chatId) => {
    clearUserInitiatedChat(chatId);
    clearArchivedChat(currentUserId, chatId);
    clearCallMessagesForChat(currentUserId, chatId);
    setArchiveTick((value) => value + 1);
    setChats((prev) => prev.filter((item) => item.id !== chatId));
    setSendError('');
    redirectAfterChatRemoved(chatId);
    setActionNotice(t('chat.deleted', 'Chat deleted'));
    notifyMessagingChanged();
  };

  const handleDeleteChat = async (chatId) => {
    if (!chatId || isAiAssistantChatId(chatId)) return;

    const confirmed = window.confirm(
      t('chat.confirmDelete', 'Delete this chat? This action cannot be undone.'),
    );
    if (!confirmed) return;

    const chat = chats.find((item) => item.id === chatId);
    try {
      await removeChatForUser(chatId, currentUserId, chat?.createdBy);
      finalizeChatRemoval(chatId);
    } catch (err) {
      setSendError(getErrorMessage(err));
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setChatFilter(tab === 'archived' ? 'Archived' : null);

    if (tab === 'archived') {
      const firstArchived = chats.find((chat) => archivedChatIds.has(String(chat.id)));
      if (firstArchived) {
        handleSelectChat(firstArchived.id);
      } else {
        setShowChat(false);
      }
      return;
    }

    if (archivedChatIds.has(String(selectedChat)) || spamChatIds.has(String(selectedChat))) {
      handleSelectChat(AI_ASSISTANT_CHAT_ID);
    }
  };

  const handleFilterSelect = (filterId) => {
    setChatFilter(filterId);
    setActiveTab(filterId === 'Archived' ? 'archived' : 'chats');

    if (filterId === 'Archived') {
      const firstArchived = chats.find((chat) => archivedChatIds.has(String(chat.id)));
      if (firstArchived) {
        handleSelectChat(firstArchived.id);
      } else {
        setShowChat(false);
      }
      return;
    }

    if (filterId === 'Spam') {
      const firstSpam = chats.find((chat) => spamChatIds.has(String(chat.id)));
      if (firstSpam) {
        handleSelectChat(firstSpam.id);
      } else {
        setShowChat(false);
      }
      return;
    }

    if (archivedChatIds.has(String(selectedChat)) || spamChatIds.has(String(selectedChat))) {
      handleSelectChat(AI_ASSISTANT_CHAT_ID);
    }
  };

  const handleDraftChange = () => {
    setDraftTick((value) => value + 1);
  };

  const handleToggleFavorite = (chatId) => {
    if (!chatId || isAiAssistantChatId(chatId)) return;
    const added = toggleFavoriteChat(currentUserId, chatId);
    setLabelsTick((value) => value + 1);
    setActionNotice(
      added
        ? t('chat.favorited', 'Chat added to favorites')
        : t('chat.unfavorited', 'Chat removed from favorites'),
    );
  };

  const handleToggleSpam = (chatId) => {
    if (!chatId || isAiAssistantChatId(chatId)) return;
    const added = toggleSpamChat(currentUserId, chatId);
    setLabelsTick((value) => value + 1);
    setActionNotice(
      added
        ? t('chat.spammed', 'Chat moved to spam')
        : t('chat.unspammed', 'Chat removed from spam'),
    );
    if (added) {
      redirectAfterChatRemoved(chatId);
    }
  };

  useEffect(() => {
    if (!actionNotice) return undefined;
    const timer = window.setTimeout(() => setActionNotice(''), 3200);
    return () => window.clearTimeout(timer);
  }, [actionNotice]);

  const aiAssistantChat = buildAiAssistantDisplayChat(t);
  aiAssistantChat.lastMessage = truncateChatPreview(aiPreview);

  const visibleChats = filterChatsForSidebar(chats, {
    activeTab,
    chatFilter,
    archivedIds: archivedChatIds,
    spamIds: spamChatIds,
    contactUserIds,
    favoriteIds: favoriteChatIds,
    draftChatIds,
  });

  const showAiInList = !chatFilter && activeTab !== 'archived';

  const chatUsers = [
    ...(showAiInList ? [aiAssistantChat] : []),
    ...visibleChats.map((chat) => {
      const draftPreview = getChatDraft(currentUserId, chat.id);

      return {
        id: chat.id,
        name: chat.name ?? 'User',
        avatar: chat.avatar ?? chat.companion?.avatarUrl ?? null,
        lastMessage: draftPreview || chat.lastMessage || '',
        time: chat.time ?? chat.lastMessageAt ?? chat.updatedAt,
        unread: chat.unread || chat.hasUnread || (chat.unreadCount ?? 0) > 0,
        activeNow: false,
        isAiAssistant: false,
        isDraft: Boolean(draftPreview),
        companion: chat.companion,
        createdBy: chat.createdBy,
      };
    }),
  ];

  const selectedUser =
    chatUsers.find((user) => String(user.id) === String(selectedChat)) ||
    (selectedChat && isAiAssistantChatId(selectedChat) ? aiAssistantChat : null);

  return (
    <div className="messages-page-wrapper">
      {error ? <div className="auth-error messages-page-alert">{error}</div> : null}
      {actionNotice ? <div className="chat-action-notice messages-page-alert">{actionNotice}</div> : null}

      <div className={`messages-page ${showProfile ? 'messages-page--profile profile-open' : ''}`}>
        <ChatSidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          chatUsers={chatUsers}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          showChat={showChat}
          loading={loadingChats}
          chatFilter={chatFilter}
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
          isChatArchived={selectedChat ? isChatArchived(currentUserId, selectedChat) : false}
          isChatFavorite={selectedChat ? isChatFavorite(currentUserId, selectedChat) : false}
          isChatSpam={selectedChat ? isChatSpam(currentUserId, selectedChat) : false}
          onArchiveChat={handleArchiveChat}
          onUnarchiveChat={handleUnarchiveChat}
          onToggleFavorite={handleToggleFavorite}
          onToggleSpam={handleToggleSpam}
          onDeleteChat={handleDeleteChat}
          onDraftChange={handleDraftChange}
          onViewProfile={() => {
            if (!selectedUser || selectedUser.isAiAssistant) return;
            const companionId =
              selectedUser.companion?.id ?? selectedUser.companionUserId;
            if (companionId) {
              navigate(`/app/profile/${companionId}`);
            }
          }}
          onBackClick={() => {
            setShowProfile(false);
            setShowChat(false);
          }}
          onAvatarClick={() => {
            if (!selectedUser || selectedUser.isAiAssistant) return;
            setShowProfile(true);
          }}
          currentUserId={currentUserId}
          onSendMessage={handleSendMessage}
          onCallEnded={handleCallEnded}
          locale={locale}
        />

        <ChatProfilePanel
          selectedUser={selectedUser?.isAiAssistant ? null : selectedUser}
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
        activeFilter={chatFilter}
        onSelectFilter={handleFilterSelect}
      />
      <MessageSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};

export default MessagesPage;
