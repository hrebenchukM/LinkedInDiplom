import { getProfileByUserId } from '../profile/profileApi.js';
import { getDisplayName } from '../profile/mapProfile.js';
import {
  getContactOtherUserId,
  mapContactToDisplay,
} from './mapNetwork.js';

const profileCache = new Map();

export function clearNetworkProfileCache() {
  profileCache.clear();
}

export async function getCachedNetworkProfile(userId) {
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

export function profileToNetworkUser(profile, userId) {
  if (!profile || profile.failed) {
    return {
      id: userId,
      userId,
      name: 'User',
      firstName: 'User',
      secondName: '',
      avatarUrl: null,
      avatar: '',
      headline: '',
      profileTitle: '',
    };
  }

  const user = profile.user ?? profile;
  const displayName = getDisplayName(profile);
  const parts = displayName.split(' ').filter(Boolean);
  const headline = user.headline ?? user.profileTitle ?? profile.headline ?? '';

  return {
    id: userId,
    userId,
    name: displayName,
    firstName: user.firstName ?? parts[0] ?? 'User',
    secondName: user.secondName ?? user.lastName ?? parts.slice(1).join(' '),
    avatarUrl: user.avatarUrl ?? user.AvatarUrl ?? null,
    headline,
    profileTitle: headline,
  };
}

export async function enrichUsersWithProfiles(items = [], getUserId) {
  const list = Array.isArray(items) ? items : [];
  const userIds = [
    ...new Set(list.map((item) => getUserId(item)).filter(Boolean)),
  ];

  await Promise.all(userIds.map((userId) => getCachedNetworkProfile(userId)));

  return list.map((item) => {
    const userId = getUserId(item);
    const profile = profileCache.get(userId);
    const enriched = profileToNetworkUser(profile, userId);

    return {
      ...item,
      ...enriched,
      avatar: enriched.avatarUrl,
    };
  });
}

export async function enrichContactsWithProfiles(contacts = [], currentUserId) {
  const list = Array.isArray(contacts) ? contacts : [];
  const userIds = [
    ...new Set(
      list
        .map((contact) => getContactOtherUserId(contact, currentUserId))
        .filter(Boolean),
    ),
  ];

  await Promise.all(userIds.map((userId) => getCachedNetworkProfile(userId)));

  return list.map((contact) => {
    const userId = getContactOtherUserId(contact, currentUserId);
    const profile = profileCache.get(userId);
    return mapContactToDisplay(contact, profile, currentUserId);
  });
}
