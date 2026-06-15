import { getProfileByUserId } from '../profile/profileApi.js';
import {
  getDisplayName,
  getProfileAvatar,
  mapProfileDto,
} from '../profile/mapProfile.js';
import { mapEventDto } from './mapEvents.js';

const organizerCache = new Map();

function fallbackOrganizer(userId) {
  return {
    id: userId,
    name: 'Organizer',
    avatar: '',
    avatarUrl: '',
    firstName: 'Organizer',
    secondName: '',
    profileTitle: 'Organizer',
    isCompany: false,
  };
}

function profileToOrganizer(profile, organizerId, organizerType = '') {
  if (!profile) {
    return fallbackOrganizer(organizerId);
  }

  const mapped = mapProfileDto(profile) ?? profile;
  const user = mapped.user ?? mapped;
  const displayName = getDisplayName(mapped);
  const parts = displayName.split(' ').filter(Boolean);
  const isCompany = String(organizerType).toLowerCase().includes('company');

  return {
    id: organizerId,
    name: displayName,
    avatar: getProfileAvatar(mapped),
    avatarUrl: user.avatarUrl ?? user.AvatarUrl ?? '',
    firstName: parts[0] ?? displayName,
    secondName: parts.slice(1).join(' '),
    profileTitle: user.headline ?? user.profileTitle ?? mapped.headline ?? '',
    isCompany,
  };
}

export function clearOrganizerCache() {
  organizerCache.clear();
}

export async function getCachedOrganizerProfile(userId, organizerType = '') {
  if (!userId) return fallbackOrganizer(userId);

  const cacheKey = `${userId}:${organizerType}`;
  if (organizerCache.has(cacheKey)) {
    return organizerCache.get(cacheKey);
  }

  try {
    const profile = await getProfileByUserId(userId);
    const organizer = profileToOrganizer(profile, userId, organizerType);
    organizerCache.set(cacheKey, organizer);
    return organizer;
  } catch {
    const fallback = fallbackOrganizer(userId);
    organizerCache.set(cacheKey, fallback);
    return fallback;
  }
}

export async function enrichEventWithOrganizer(event) {
  if (!event) return null;

  const organizerId = event.organizerId ?? event.organizer?.id;
  if (!organizerId) {
    return {
      ...event,
      organizer: event.organizer ?? fallbackOrganizer(null),
    };
  }

  const organizer = await getCachedOrganizerProfile(
    organizerId,
    event.organizerType,
  );

  return {
    ...event,
    organizer,
  };
}

export async function enrichEventsWithOrganizers(events = []) {
  if (!Array.isArray(events) || events.length === 0) {
    return [];
  }

  const organizerIds = [
    ...new Set(
      events
        .map((event) => event?.organizerId ?? event?.organizer?.id)
        .filter(Boolean),
    ),
  ];

  await Promise.all(
    organizerIds.map((organizerId) => {
      const event = events.find(
        (item) => (item?.organizerId ?? item?.organizer?.id) === organizerId,
      );
      return getCachedOrganizerProfile(organizerId, event?.organizerType);
    }),
  );

  return events.map((event) => {
    const organizerId = event?.organizerId ?? event?.organizer?.id;
    const cacheKey = `${organizerId}:${event?.organizerType ?? ''}`;
    const organizer = organizerId
      ? organizerCache.get(cacheKey) ?? fallbackOrganizer(organizerId)
      : fallbackOrganizer(null);

    return mapEventDto(
      event,
      {
        organizer,
        isAttending: event.isAttending,
        speakers: event.speakers,
        schedule: event.schedule,
      },
    ) ?? {
      ...event,
      organizer,
    };
  });
}
