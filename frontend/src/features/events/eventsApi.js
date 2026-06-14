import { apiClient } from "../../shared/api/client";
import { EVENTS } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import { unwrapPagedResponse } from "../../shared/lib/pagedResponse";
import { mapEventToView, normalizeEventDto } from "./mapEvents";

function buildEventsQuery({ page = 1, pageSize = 20, isOnline } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (isOnline != null) params.set("isOnline", String(isOnline));
  return params.toString();
}

/** Public discover — `GET /api/events`. */
export async function discoverEvents({ page = 1, pageSize = 20, isOnline } = {}) {
  if (USE_MOCK_AUTH) return { items: [], page, pageSize, totalCount: 0, hasNextPage: false };
  const qs = buildEventsQuery({ page, pageSize, isOnline });
  const data = await apiClient.get(`${EVENTS.discover}?${qs}`);
  const paged = unwrapPagedResponse(data, normalizeEventDto);
  return { ...paged, items: paged.items.map(mapEventToView) };
}

/** JWT — `GET /api/events/me/attending`. */
export async function fetchAttendingEvents({ page = 1, pageSize = 20 } = {}) {
  if (USE_MOCK_AUTH) return { items: [], page, pageSize, totalCount: 0, hasNextPage: false };
  const qs = buildEventsQuery({ page, pageSize });
  const data = await apiClient.get(`${EVENTS.attending}?${qs}`);
  const paged = unwrapPagedResponse(data, normalizeEventDto);
  return { ...paged, items: paged.items.map(mapEventToView) };
}

export async function joinEvent(eventId) {
  if (USE_MOCK_AUTH || !eventId) return null;
  return apiClient.post(EVENTS.join(eventId));
}

export async function leaveEvent(eventId) {
  if (USE_MOCK_AUTH || !eventId) return null;
  return apiClient.delete(EVENTS.leave(eventId));
}
