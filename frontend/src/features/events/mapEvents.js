import { resolveMediaUrl } from "../profile/mapProfile";

export function normalizeEventDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  return {
    id: dto.id ?? dto.Id,
    organizerType: dto.organizerType ?? dto.OrganizerType ?? "",
    organizerId: dto.organizerId ?? dto.OrganizerId ?? "",
    title: dto.title ?? dto.Title ?? "",
    description: dto.description ?? dto.Description ?? "",
    coverImageUrl: dto.coverImageUrl ?? dto.CoverImageUrl ?? "",
    location: dto.location ?? dto.Location ?? "",
    isOnline: Boolean(dto.isOnline ?? dto.IsOnline),
    externalLink: dto.externalLink ?? dto.ExternalLink ?? "",
    timezone: dto.timezone ?? dto.Timezone ?? "",
    visibility: dto.visibility ?? dto.Visibility ?? "",
    startAt: dto.startAt ?? dto.StartAt,
    endAt: dto.endAt ?? dto.EndAt,
    attendeeCount: Number(dto.attendeeCount ?? dto.AttendeeCount ?? 0) || 0,
    isAttending: Boolean(dto.isAttending ?? dto.IsAttending),
  };
}

export function mapEventToView(event) {
  const coverImageUrl = event.coverImageUrl ? resolveMediaUrl(event.coverImageUrl) : "";
  return {
    id: String(event.id),
    title: String(event.title || ""),
    description: String(event.description || ""),
    coverImageUrl,
    location: String(event.location || ""),
    isOnline: event.isOnline,
    startAt: event.startAt,
    endAt: event.endAt,
    attendeeCount: event.attendeeCount,
    isAttending: event.isAttending,
    seed: event.title || event.id,
    _api: true,
  };
}

export function formatEventDateTime(iso, lang) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(lang || undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
