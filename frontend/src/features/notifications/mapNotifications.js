function formatRelativeTime(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function mapNotificationDtoToUi(dto) {
  const type = String(dto.type || "").toLowerCase();
  let to = "/home";
  if (type.includes("message") || type.includes("chat")) to = "/chat";
  else if (type.includes("job") || type.includes("application") || type.includes("vacancy")) to = "/vacancies";
  else if (type.includes("profile") || type.includes("contact") || type.includes("network")) to = "/network";

  return {
    id: String(dto.id),
    unread: !dto.isRead,
    text: String(dto.body || dto.title || "Notification").trim(),
    time: formatRelativeTime(dto.createdAt),
    to,
    type: dto.type,
    entityId: dto.entityId,
    actorUserId: dto.actorUserId,
    _api: true,
  };
}
