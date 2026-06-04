export function mapContactDtoToPerson(contact, profile, currentUserId) {
  const otherUserId =
    String(contact.requesterId) === String(currentUserId) ? contact.receiverId : contact.requesterId;
  const name =
    profile?.fullName?.trim() ||
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    `User ${String(otherUserId).slice(0, 8)}`;

  return {
    id: String(contact.id),
    userId: otherUserId,
    name,
    role: profile?.headline || profile?.profileTitle || "Member",
    handle: String(otherUserId).slice(0, 12),
    seed: otherUserId,
    keywords: `${name} ${profile?.headline || ""}`.toLowerCase(),
    mutual: 0,
    status: contact.status,
    _api: true,
  };
}
