import { getProfileByUserId } from '../profile/profileApi.js';
import { getDisplayName } from '../profile/mapProfile.js';
import {
  getCompanionUserIdFromChat,
  mapChatToDisplay,
} from './mapMessaging.js';

const profileCache = new Map();

export function clearMessagingProfileCache() {
  profileCache.clear();
}

export async function getCachedMessagingProfile(userId) {
  if (!userId) return null;

  if (profileCache.has(userId)) {
    return profileCache.get(userId);
  }

  try {
    const profile = await getProfileByUserId(userId);
    profileCache.set(userId, profile);
    return profile;
  } catch {
    const fallback = {
      userId,
      failed: true,
      user: {
        id: userId,
        firstName: 'User',
        secondName: '',
        avatarUrl: null,
        headline: '',
      },
    };
    profileCache.set(userId, fallback);
    return fallback;
  }
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

  await Promise.all(userIds.map((userId) => getCachedMessagingProfile(userId)));

  return list.map((message) => {
    const profile = profileCache.get(message.senderId);
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

export async function enrichChatsWithCompanions(chats = [], currentUserId) {
  const list = Array.isArray(chats) ? chats : [];
  const userIds = [
    ...new Set(
      list
        .map((chat) => chat.companionUserId ?? getCompanionUserIdFromChat(chat, currentUserId))
        .filter(Boolean),
    ),
  ];

  await Promise.all(userIds.map((userId) => getCachedMessagingProfile(userId)));

  return list.map((chat) => {
    const companionUserId =
      chat.companionUserId ?? getCompanionUserIdFromChat(chat, currentUserId);
    const profile = companionUserId
      ? profileCache.get(companionUserId)
      : null;

    return mapChatToDisplay(
      {
        ...chat,
        companionUserId,
      },
      profile,
    );
  });
}
