export function mapMessageDtoToUi(dto, currentUserId) {
  return {
    id: String(dto.id),
    fromMe: String(dto.senderId) === String(currentUserId),
    text: String(dto.content || ""),
    createdAt: dto.createdAt,
    _api: true,
  };
}

export function mapChatDtoToUi(chat, currentUserId, profileByUserId = {}) {
  const members = Array.isArray(chat.members) ? chat.members : [];
  const otherMember = members.find((m) => String(m.userId) !== String(currentUserId));
  const otherUserId = otherMember?.userId || (String(chat.createdBy) !== String(currentUserId) ? chat.createdBy : null);
  const profile = otherUserId ? profileByUserId[otherUserId] : null;
  const name =
    profile?.fullName?.trim() ||
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    (otherUserId ? `User ${String(otherUserId).slice(0, 8)}` : "Chat");

  return {
    id: String(chat.id),
    peer: name,
    peerUserId: otherUserId,
    online: true,
    messages: [],
    lastReadIncomingCount: 0,
    _api: true,
  };
}
