import { resolveUploadUrl } from '../../shared/api/uploads.js';
import { mapPagedResponse } from '../../shared/lib/pagination.js';

function pick(dto, ...keys) {
  if (!dto) return null;
  for (const key of keys) {
    const value = dto[key];
    if (value != null && value !== '') return value;
  }
  return null;
}

function formatEventDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatEventTime(startAt, endAt) {
  if (!startAt) return '';

  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) return '';

  const startLabel = start.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (!endAt) return startLabel;

  const end = new Date(endAt);
  if (Number.isNaN(end.getTime())) return startLabel;

  const endLabel = end.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${startLabel} – ${endLabel}`;
}

export function mapEventDto(dto, meta = {}) {
  if (!dto) return null;

  const id = pick(dto, 'id', 'Id');
  const organizerId = pick(dto, 'organizerId', 'OrganizerId');
  const organizerType = pick(dto, 'organizerType', 'OrganizerType') ?? '';
  const coverRaw = pick(dto, 'coverImageUrl', 'CoverImageUrl', 'coverUrl', 'CoverUrl');
  const startAt = pick(dto, 'startAt', 'StartAt');
  const endAt = pick(dto, 'endAt', 'EndAt');
  const avatarRaw = pick(dto, 'avatarUrl', 'AvatarUrl');

  return {
    id,
    organizerId,
    organizerType,
    title: pick(dto, 'title', 'Title') ?? '',
    description: pick(dto, 'description', 'Description') ?? '',
    location: pick(dto, 'location', 'Location') ?? '',
    startAt,
    endAt,
    date: formatEventDate(startAt),
    time: formatEventTime(startAt, endAt),
    coverUrl: resolveUploadUrl(coverRaw),
    coverImageUrl: resolveUploadUrl(coverRaw),
    avatarUrl: resolveUploadUrl(avatarRaw),
    isOnline: Boolean(pick(dto, 'isOnline', 'IsOnline')),
    externalLink: pick(dto, 'externalLink', 'ExternalLink'),
    timezone: pick(dto, 'timezone', 'Timezone'),
    visibility: pick(dto, 'visibility', 'Visibility'),
    allowComments: Boolean(pick(dto, 'allowComments', 'AllowComments')),
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
    updatedAt: pick(dto, 'updatedAt', 'UpdatedAt'),
    deletedAt: pick(dto, 'deletedAt', 'DeletedAt'),
    attendeesCount: Number(
      pick(dto, 'attendeeCount', 'AttendeeCount', 'attendeesCount', 'AttendeesCount') ?? 0,
    ) || 0,
    isAttending: meta.isAttending ?? Boolean(pick(dto, 'isAttending', 'IsAttending')),
    organizer: meta.organizer ?? null,
    speakers: meta.speakers ?? [],
    schedule: meta.schedule ?? [],
  };
}

export function mapEventListResponse(response, meta = {}) {
  const paged = mapPagedResponse(response);
  return {
    ...paged,
    items: paged.items
      .map((item) => mapEventDto(item, {
        isAttending: meta.attendingIds?.has?.(pick(item, 'id', 'Id')),
      }))
      .filter(Boolean),
  };
}

export function mapEventSpeakerDto(dto) {
  if (!dto) return null;

  const avatarRaw = pick(dto, 'avatarUrl', 'AvatarUrl');

  return {
    id: pick(dto, 'id', 'Id'),
    name: pick(dto, 'name', 'Name') ?? '',
    title: pick(dto, 'title', 'Title') ?? '',
    avatarUrl: resolveUploadUrl(avatarRaw),
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
  };
}

export function mapEventSpeakerListResponse(response) {
  if (Array.isArray(response)) {
    return response.map(mapEventSpeakerDto).filter(Boolean);
  }

  const paged = mapPagedResponse(response);
  return paged.items.map(mapEventSpeakerDto).filter(Boolean);
}

export function mapEventScheduleItemDto(dto) {
  if (!dto) return null;

  const startAt = pick(dto, 'startAt', 'StartAt');
  const endAt = pick(dto, 'endAt', 'EndAt');

  return {
    id: pick(dto, 'id', 'Id'),
    eventId: pick(dto, 'eventId', 'EventId'),
    timeLabel:
      pick(dto, 'timeLabel', 'TimeLabel')
      ?? formatEventTime(startAt, endAt)
      ?? '',
    title: pick(dto, 'title', 'Title') ?? '',
    speakerName: pick(dto, 'speakerName', 'SpeakerName') ?? '',
    orderIndex: Number(pick(dto, 'orderIndex', 'OrderIndex') ?? 0),
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
  };
}

export function mapEventScheduleResponse(response) {
  const items = Array.isArray(response)
    ? response
    : Array.isArray(response?.items)
      ? response.items
      : [];

  return items
    .map(mapEventScheduleItemDto)
    .filter(Boolean)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export function mapEventCoverUploadResponse(response) {
  const event = response?.event ?? response?.Event ?? response;
  return mapEventDto(event);
}

export function sortEventsByStartAt(events = [], direction = 'asc') {
  const sorted = [...events].sort((a, b) => {
    const aTime = new Date(a?.startAt ?? 0).getTime();
    const bTime = new Date(b?.startAt ?? 0).getTime();
    return direction === 'desc' ? bTime - aTime : aTime - bTime;
  });
  return sorted;
}

export function filterUpcomingEvents(events = []) {
  const now = Date.now();
  return events.filter((event) => {
    const start = new Date(event?.startAt ?? 0).getTime();
    return !Number.isNaN(start) && start >= now;
  });
}
