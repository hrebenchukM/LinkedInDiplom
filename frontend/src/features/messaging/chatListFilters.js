export const CHAT_FILTER_OPTIONS = [
  { id: 'Unread', key: 'chat.filters.unread' },
  { id: 'Drafts', key: 'chat.filters.drafts' },
  { id: 'My contacts', key: 'chat.filters.contacts' },
  { id: 'Favorites', key: 'chat.filters.favorites' },
  { id: 'Archived', key: 'chat.filters.archived' },
  { id: 'Spam', key: 'chat.filters.spam' },
];

export function isChatUnread(chat) {
  return Boolean(chat?.unread || chat?.hasUnread || (chat?.unreadCount ?? 0) > 0);
}

export function chatMatchesListFilter(chat, filter, context = {}) {
  if (!chat?.id || !filter) return true;

  const {
    contactUserIds = new Set(),
    favoriteIds = new Set(),
    spamIds = new Set(),
    archivedIds = new Set(),
    draftChatIds = new Set(),
  } = context;

  const chatId = String(chat.id);
  const companionId = String(
    chat.companionUserId ?? chat.companion?.id ?? '',
  );

  switch (filter) {
    case 'Unread':
      return isChatUnread(chat);
    case 'Drafts':
      return draftChatIds.has(chatId);
    case 'My contacts':
      return companionId && contactUserIds.has(companionId);
    case 'Favorites':
      return favoriteIds.has(chatId);
    case 'Archived':
      return archivedIds.has(chatId);
    case 'Spam':
      return spamIds.has(chatId);
    default:
      return true;
  }
}

export function filterChatsForSidebar(
  chats,
  {
    activeTab = 'chats',
    chatFilter = null,
    archivedIds = new Set(),
    spamIds = new Set(),
    contactUserIds = new Set(),
    favoriteIds = new Set(),
    draftChatIds = new Set(),
  } = {},
) {
  const showArchived = activeTab === 'archived' || chatFilter === 'Archived';
  const showSpam = chatFilter === 'Spam';

  let list = chats.filter((chat) => {
    const chatId = String(chat.id);
    const archived = archivedIds.has(chatId);
    const spam = spamIds.has(chatId);

    if (showSpam) return spam;
    if (showArchived) return archived && !spam;
    if (spam || archived) return false;
    return true;
  });

  if (chatFilter && chatFilter !== 'Archived' && chatFilter !== 'Spam') {
    list = list.filter((chat) =>
      chatMatchesListFilter(chat, chatFilter, {
        contactUserIds,
        favoriteIds,
        spamIds,
        archivedIds,
        draftChatIds,
      }),
    );
  }

  return list;
}

export function getChatFilterEmptyMessageKey(chatFilter, activeTab) {
  if (activeTab === 'archived' || chatFilter === 'Archived') {
    return 'chat.listArchivedEmpty';
  }

  switch (chatFilter) {
    case 'Unread':
      return 'chat.listUnreadEmpty';
    case 'Drafts':
      return 'chat.listDraftsEmpty';
    case 'My contacts':
      return 'chat.listContactsEmpty';
    case 'Favorites':
      return 'chat.listFavoritesEmpty';
    case 'Spam':
      return 'chat.listSpamEmpty';
    default:
      return 'chat.listSearchNoResults';
  }
}
