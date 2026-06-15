import { getProfileByUserId } from '../profile/profileApi.js';
import { getDisplayName } from '../profile/mapProfile.js';

const profileCache = new Map();

export function clearAuthorCache() {
  profileCache.clear();
}

export async function getCachedProfile(userId) {
  if (!userId) return null;

  if (profileCache.has(userId)) {
    return profileCache.get(userId);
  }

  try {
    const profile = await getProfileByUserId(userId);
    profileCache.set(userId, profile);
    return profile;
  } catch {
    const fallback = { userId, failed: true };
    profileCache.set(userId, fallback);
    return fallback;
  }
}

function profileToPostUser(profile, userId) {
  if (!profile || profile.failed) {
    return {
      id: userId,
      firstName: 'User',
      secondName: '',
      avatarUrl: null,
      position: '',
    };
  }

  const user = profile.user ?? profile;
  const displayName = getDisplayName(profile);
  const parts = displayName.split(' ').filter(Boolean);

  return {
    id: userId,
    firstName: user.firstName ?? parts[0] ?? 'User',
    secondName: user.secondName ?? user.lastName ?? parts.slice(1).join(' '),
    avatarUrl: user.avatarUrl ?? user.AvatarUrl ?? null,
    position: user.headline ?? user.profileTitle ?? profile.headline ?? '',
  };
}

export async function enrichPostsWithAuthors(posts = []) {
  const list = Array.isArray(posts) ? posts : [];
  const userIds = [...new Set(list.map((post) => post.userId).filter(Boolean))];

  await Promise.all(userIds.map((userId) => getCachedProfile(userId)));

  return list.map((post) => {
    const profile = profileCache.get(post.userId);
    const user = profileToPostUser(profile, post.userId);
    return {
      ...post,
      user,
      author: user,
    };
  });
}
