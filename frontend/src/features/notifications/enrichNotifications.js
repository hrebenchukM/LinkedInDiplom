import { getProfileByUserId } from '../profile/profileApi.js';
import {
  getDisplayName,
  getProfileAvatar,
  mapProfileDto,
} from '../profile/mapProfile.js';
import { getEventById } from '../events/eventsApi.js';
import { getVacancyById } from '../jobs/jobsApi.js';
import { enrichVacanciesWithCompanies } from '../jobs/enrichJobsWithCompanies.js';
import { mapNotificationDto } from './mapNotifications.js';

const actorCache = new Map();
const entityCache = new Map();

function fallbackActor(userId) {
  return {
    id: userId,
    name: 'User',
    avatar: '',
    title: '',
  };
}

export function clearNotificationCache() {
  actorCache.clear();
  entityCache.clear();
}

export async function getCachedActorProfile(userId) {
  if (!userId) return fallbackActor(userId);

  if (actorCache.has(userId)) {
    return actorCache.get(userId);
  }

  try {
    const profile = await getProfileByUserId(userId);
    const mapped = mapProfileDto(profile) ?? profile;
    const user = mapped.user ?? mapped;
    const actor = {
      id: userId,
      name: getDisplayName(mapped),
      avatar: getProfileAvatar(mapped),
      title: user.headline ?? user.profileTitle ?? mapped.headline ?? '',
      firstName: user.firstName ?? user.FirstName ?? '',
      secondName: user.secondName ?? user.LastName ?? user.lastName ?? '',
      avatarUrl: user.avatarUrl ?? user.AvatarUrl ?? '',
    };
    actorCache.set(userId, actor);
    return actor;
  } catch {
    const fallback = fallbackActor(userId);
    actorCache.set(userId, fallback);
    return fallback;
  }
}

async function enrichEntity(notification) {
  const entityType = String(notification?.entityType ?? '').toLowerCase();
  const entityId = notification?.entityId;
  if (!entityId) return null;

  const cacheKey = `${entityType}:${entityId}`;
  if (entityCache.has(cacheKey)) {
    return entityCache.get(cacheKey);
  }

  try {
    if (entityType.includes('event')) {
      const event = await getEventById(entityId);
      const entity = { type: 'event', data: event };
      entityCache.set(cacheKey, entity);
      return entity;
    }

    if (entityType.includes('vacancy') || entityType.includes('job')) {
      const [vacancy] = await enrichVacanciesWithCompanies([
        await getVacancyById(entityId),
      ].filter(Boolean));

      const entity = {
        type: 'vacancy',
        data: vacancy,
      };
      entityCache.set(cacheKey, entity);
      return entity;
    }
  } catch {
    entityCache.set(cacheKey, null);
    return null;
  }

  return null;
}

export async function enrichNotification(notification) {
  if (!notification) return null;

  const actorUserId = notification.actorUserId ?? notification.actor?.id;
  const actor = actorUserId
    ? await getCachedActorProfile(actorUserId)
    : notification.actor ?? null;

  const entity = await enrichEntity(notification);

  return mapNotificationDto(notification, {
    actor,
    entity,
    isRead: notification.isRead,
  });
}

export async function enrichNotifications(notifications = []) {
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return [];
  }

  const actorIds = [
    ...new Set(
      notifications
        .map((item) => item?.actorUserId ?? item?.actor?.id)
        .filter(Boolean),
    ),
  ];

  await Promise.all(actorIds.map((userId) => getCachedActorProfile(userId)));

  const entityCandidates = notifications.filter((item) => {
    const entityType = String(item?.entityType ?? '').toLowerCase();
    return item?.entityId && (
      entityType.includes('event')
      || entityType.includes('vacancy')
      || entityType.includes('job')
    );
  });

  await Promise.all(entityCandidates.map((item) => enrichEntity(item)));

  return notifications.map((notification) => {
    const actorUserId = notification?.actorUserId ?? notification?.actor?.id;
    const actor = actorUserId
      ? actorCache.get(actorUserId) ?? fallbackActor(actorUserId)
      : notification.actor ?? null;

    const entityType = String(notification?.entityType ?? '').toLowerCase();
    const entityId = notification?.entityId;
    const entity = entityId
      ? entityCache.get(`${entityType}:${entityId}`) ?? notification.entity ?? null
      : notification.entity ?? null;

    return mapNotificationDto(notification, {
      actor,
      entity,
      isRead: notification.isRead,
    });
  });
}
