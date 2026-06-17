import apiClient from '../../shared/api/client.js';
import { API_PATHS } from '../../shared/api/paths.js';
import { buildPaginationQuery } from '../../shared/lib/pagination.js';
import {
  mapEventCoverUploadResponse,
  mapEventDto,
  mapEventListResponse,
  mapEventScheduleResponse,
  mapEventSpeakerListResponse,
} from './mapEvents.js';

function buildEventQuery(params = {}) {
  const {
    page,
    pageSize,
    limit,
    query,
    search,
    sortBy,
    sortDirection,
    fromStartAt,
    toStartAt,
    isOnline,
    location,
    organizerUserId,
    ...filters
  } = params;

  return buildPaginationQuery({
    page,
    pageSize: pageSize ?? limit,
    query: query ?? search,
    sortBy,
    sortDirection,
    extra: {
      fromStartAt,
      toStartAt,
      isOnline,
      location,
      organizerUserId,
      ...filters,
    },
  });
}

function unwrapEvent(response) {
  const event = response?.event ?? response?.Event ?? response;
  return mapEventDto(event);
}

// Events
export async function discoverEvents(params = {}) {
  const query = buildEventQuery(params);
  const response = await apiClient.get(API_PATHS.events.discover, { query });
  return mapEventListResponse(response, {
    attendingIds: params.attendingIds,
  });
}

export async function getEvents(params = {}) {
  return discoverEvents(params);
}

export async function getEventById(eventId) {
  const response = await apiClient.get(API_PATHS.events.byId(eventId));
  return mapEventDto(response);
}

// Attending
export async function getMyAttendingEvents(params = {}) {
  try {
    const query = buildEventQuery(params);
    const response = await apiClient.get(API_PATHS.events.attending, { query });
    const paged = mapEventListResponse(response);
    return {
      ...paged,
      items: paged.items.map((event) => ({ ...event, isAttending: true })),
    };
  } catch {
    return mapEventListResponse([]);
  }
}

export async function joinEvent(eventId) {
  return apiClient.post(API_PATHS.events.join(eventId));
}

export async function leaveEvent(eventId) {
  return apiClient.delete(API_PATHS.events.attendance(eventId));
}

// Speakers
export async function getEventSpeakers(eventId, params = {}) {
  try {
    const query = buildEventQuery(params);
    const response = await apiClient.get(API_PATHS.events.speakers(eventId), { query });
    return mapEventSpeakerListResponse(response);
  } catch {
    return [];
  }
}

// Schedule
export async function getEventSchedule(eventId) {
  try {
    const response = await apiClient.get(API_PATHS.events.schedule(eventId));
    return mapEventScheduleResponse(response);
  } catch {
    return [];
  }
}

// Attendees (optional count fallback)
export async function getEventAttendees(eventId, limit = 50) {
  try {
    const response = await apiClient.get(API_PATHS.events.attendees(eventId), {
      query: { limit },
    });
    return Array.isArray(response) ? response : [];
  } catch {
    return [];
  }
}

// Upload
export async function uploadEventCover(eventId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.upload(API_PATHS.events.cover(eventId), formData);
  return mapEventCoverUploadResponse(response);
}

export async function loadAttendingEventIds() {
  const result = await getMyAttendingEvents({ page: 1, pageSize: 100 });
  return new Set(result.items.map((event) => event.id).filter(Boolean));
}
