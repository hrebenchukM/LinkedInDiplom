import { apiClient } from "../../shared/api/client";
import { apiUpload } from "../../shared/api/http";
import { EVENTS } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import { unwrapPagedResponse } from "../../shared/lib/pagedResponse";
import { mapEventToView, normalizeEventDto } from "./mapEvents";

function buildEventsQuery({ page = 1, pageSize = 20, isOnline, query } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (isOnline != null) params.set("isOnline", String(isOnline));
  if (query) params.set("query", query);
  return params.toString();
}

function unwrapEventResponse(data) {
  const dto = data?.event ?? data?.Event ?? data;
  return normalizeEventDto(dto);
}

/** Public discover — `GET /api/events`. */
export async function discoverEvents({ page = 1, pageSize = 20, isOnline, query } = {}) {
  if (USE_MOCK_AUTH) return { items: [], page, pageSize, totalCount: 0, hasNextPage: false };
  const qs = buildEventsQuery({ page, pageSize, isOnline, query });
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

/** `POST /api/events/me` */
export async function createEvent(body) {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.post(EVENTS.create, body, { feedback: false });
  const event = unwrapEventResponse(data);
  return event ? mapEventToView(event) : null;
}

/** `POST /api/events/me/{eventId}/cover` — multipart file */
export async function uploadEventCover(eventId, file, { onProgress } = {}) {
  if (USE_MOCK_AUTH || !eventId || !file) return null;
  const { ok, data } = await apiUpload("POST", EVENTS.cover(eventId), file, "file", { onProgress });
  if (!ok) {
    const message =
      (Array.isArray(data?.errors) && data.errors[0]) ||
      data?.error ||
      data?.message ||
      "Cover upload failed.";
    throw new Error(String(message));
  }
  const event = unwrapEventResponse(data);
  return event ? mapEventToView(event) : null;
}
