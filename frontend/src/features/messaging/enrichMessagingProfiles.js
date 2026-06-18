import { fetchProfilesByUserIds } from '../profile/profileApi.js';
import { getDisplayName } from '../profile/mapProfile.js';
import { getMyContacts } from '../network/networkApi.js';
import { getContactOtherUserId } from '../network/mapNetwork.js';
import {
  clearUserInitiatedChat,
  getUserInitiatedChatIds,
  getStoredCompanionUserId,
  getStoredChatPreview,
  getChatCompanions,
  setStoredChatPreview,
} from './userInitiatedChats.js';
import { getSharedPostPreview } from './sharedPostMessage.js';
import { getChatById, getChatMembers, getLatestChatMessage } from './messagingApi.js';
import {
  getCompanionUserIdFromChat,
  mapChatToDisplay,
  resolveCompanionUserId,
  shouldShowChatInList,
} from './mapMessaging.js';
import { buildChatPreviewText, resolveChatPreviewText } from './chatPreview.js';

const profileCache = new Map();

export function clearMessagingProfileCache() {
  profileCache.clear();
}

export async function getCachedMessagingProfile(userId) {
  if (!userId) return null;

  const key = String(userId);
  if (profileCache.has(key)) {
    return profileCache.get(key);
  }

  const batch = await fetchProfilesByUserIds([key]);
  const profile = batch[key] ?? null;
  profileCache.set(key, profile ?? { userId: key, failed: true });
  return profileCache.get(key);
}

export function profileToMessagingUser(profile, userId) {
  if (!profile || profile.failed) {
    return {
      id: userId,
      name: 'User',
      avatar: '',
      avatarUrl: null,
      headline: '',
    };
  }

  const user = profile.user ?? profile;
  return {
    id: userId,
    name: getDisplayName(profile),
    avatarUrl: user.avatarUrl ?? user.AvatarUrl ?? null,
    headline: user.headline ?? user.profileTitle ?? profile.headline ?? '',
    firstName: user.firstName,
    secondName: user.secondName ?? user.lastName,
    profileTitle: user.profileTitle ?? user.headline,
    email: user.email,
    location: user.location,
    genInfo: user.about ?? user.genInfo,
    university: user.university,
    portfolioUrl: user.portfolioUrl,
  };
}

export async function enrichMessagesWithSenders(messages = []) {
  const list = Array.isArray(messages) ? messages : [];
  const userIds = [...new Set(list.map((item) => item.senderId).filter(Boolean))];

  const profiles = await fetchProfilesByUserIds(userIds);
  Object.entries(profiles).forEach(([id, profile]) => {
    profileCache.set(id, profile ?? { userId: id, failed: true });
  });

  return list.map((message) => {
    const profile = profileCache.get(String(message.senderId)) ?? profiles[String(message.senderId)];
    const sender = profileToMessagingUser(profile, message.senderId);
    return {
      ...message,
      sender: {
        id: message.senderId,
        firstName: sender.firstName ?? sender.name?.split(' ')[0] ?? 'User',
        secondName: sender.secondName ?? '',
        avatarUrl: sender.avatarUrl,
        profileTitle: sender.headline,
      },
    };
  });
}

async function loadPendingInitiatedChats(apiChats = [], currentUserId) {
  const initiatedIds = getUserInitiatedChatIds();
  const companions = getChatCompanions();
  const existingIds = new Set(apiChats.map((chat) => String(chat.id)));
  const pending = [];

  for (const chatId of initiatedIds) {
    const key = String(chatId);
    if (existingIds.has(key)) continue;

    const companionUserId = companions[key] ?? getStoredCompanionUserId(chatId);
    if (!companionUserId) continue;

    try {
      const fromApi = await getChatById(chatId, currentUserId);
      if (fromApi) {
        pending.push({
          ...fromApi,
          companionUserId: fromApi.companionUserId ?? companionUserId,
        });
        continue;
      }
    } catch {
      /* chat may not exist anymore */
    }

    clearUserInitiatedChat(chatId);
  }

  return pending;
}

async function enrichChatWithLatestMessage(chat, currentUserId) {
  const existingPreview = resolveChatPreviewText(chat);
  if (existingPreview) return chat;

  const storedPreview = getStoredChatPreview(chat.id);
  if (storedPreview) {
    return {
      ...chat,
      lastMessage: storedPreview,
      lastMessageText: storedPreview,
      lastMessageAt: chat.lastMessageAt ?? chat.updatedAt ?? chat.createdAt,
    };
  }

  try {
    const latest = await getLatestChatMessage(chat.id, currentUserId);
    if (!latest) return chat;

    const preview = buildChatPreviewText(latest);
    if (!preview) return chat;

    setStoredChatPreview(chat.id, preview);

    return {
      ...chat,
      lastMessage: preview,
      lastMessageText: preview,
      lastMessageAt: latest.sentAt ?? latest.createdAt ?? chat.updatedAt ?? chat.createdAt,
    };
  } catch {
    return chat;
  }
}

export async function enrichChatsWithCompanions(chats = [], currentUserId) {
  const list = Array.isArray(chats) ? chats : [];
  const pending = await loadPendingInitiatedChats(list, currentUserId);
  const merged = [...list, ...pending];

  const resolved = await Promise.all(
    merged.map(async (chat) => {
      let companionUserId = await resolveCompanionUserId(chat, currentUserId, {
        getMembers: getChatMembers,
      });

      if (!companionUserId) {
        companionUserId = getStoredCompanionUserId(chat.id);
      }

      return {
        ...chat,
        companionUserId,
        members: chat.members,
      };
    }),
  );

  const filterOptions = { contactUserIds: null, userInitiatedChatIds: getUserInitiatedChatIds() };

  if (currentUserId) {
    try {
      const contacts = await getMyContacts({ page: 1, pageSize: 100 });
      filterOptions.contactUserIds = new Set(
        (contacts.items ?? [])
          .map((contact) => getContactOtherUserId(contact, currentUserId))
          .filter(Boolean)
          .map(String),
      );
    } catch (err) {
      filterOptions.contactUserIds = new Set();
    }
  }

  const visible = resolved.filter((chat) => shouldShowChatInList(chat, filterOptions));

  const withLastMessages = await Promise.all(
    visible.map((chat) => enrichChatWithLatestMessage(chat, currentUserId)),
  );

  const userIds = [
    ...new Set(withLastMessages.map((chat) => chat.companionUserId).filter(Boolean)),
  ];

  const profiles = await fetchProfilesByUserIds(userIds);
  Object.entries(profiles).forEach(([id, profile]) => {
    profileCache.set(id, profile ?? { userId: id, failed: true });
  });

  return withLastMessages.map((chat) => {
    const profile = chat.companionUserId
      ? profiles[String(chat.companionUserId)] ?? profileCache.get(String(chat.companionUserId))
      : null;

    const storedPreview = getStoredChatPreview(chat.id);
    const rawLastMessage = chat.lastMessage || storedPreview || '';
    const lastMessage = getSharedPostPreview(rawLastMessage, rawLastMessage);
    const chatWithPreview =
      lastMessage && lastMessage !== chat.lastMessage
        ? {
            ...chat,
            lastMessage,
            lastMessageAt: chat.lastMessageAt ?? chat.updatedAt ?? chat.createdAt,
          }
        : chat;

    return mapChatToDisplay(
      {
        ...chatWithPreview,
        companionUserId: chat.companionUserId,
      },
      profile,
    );
  });
}
