import { resolveAvatarSeed, resolvePersonAvatar } from "../profile/mapProfile";
import { resolveMediaUrl } from "./messagingApi";

function mapMediaDtoToUi(dto) {
  if (!dto) return null;
  return {
    id: String(dto.id),
    url: resolveMediaUrl(dto.mediaUrl || dto.MediaUrl),
    type: String(dto.mediaType || dto.MediaType || "file"),
  };
}

export function mapMessageDtoToUi(dto, currentUserId) {
  const mediaRaw = dto.media || dto.Media || [];
  const media = Array.isArray(mediaRaw) ? mediaRaw.map(mapMediaDtoToUi).filter(Boolean) : [];

  return {
    id: String(dto.id),
    fromMe: String(dto.senderId ?? dto.SenderId) === String(currentUserId),
    text: String(dto.content ?? dto.Content ?? ""),
    createdAt: dto.createdAt ?? dto.CreatedAt,
    senderId: String(dto.senderId ?? dto.SenderId ?? ""),
    media,
    _api: true,
  };
}

function isGuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

/** Technical placeholders like "Chat", "Chat · f654dbf5" — not real user names. */
export function isGenericChatPeer(name) {
  const value = String(name || "").trim();
  if (!value || /^chat$/i.test(value)) return true;
  return /^chat\s*[·.\-–—]\s*[0-9a-f]{4,}/i.test(value);
}

export function resolvePeerDisplayName(profile, userId) {
  const fromProfile =
    profile?.fullName?.trim() ||
    `${profile?.firstName || profile?.FirstName || ""} ${profile?.lastName || profile?.LastName || ""}`.trim();
  if (fromProfile) return fromProfile;
  if (userId && isGuid(userId)) return "";
  return String(userId || "").trim();
}

export function resolveOtherUserId(chatDto, messages, currentUserId) {
  const members = Array.isArray(chatDto?.members) ? chatDto.members : chatDto?.Members || [];
  const otherMember = members.find(
    (member) => String(member.userId ?? member.UserId ?? "") !== String(currentUserId),
  );
  if (otherMember) return String(otherMember.userId ?? otherMember.UserId ?? "");

  const createdBy = String(chatDto?.createdBy ?? chatDto?.CreatedBy ?? "");
  if (createdBy && createdBy !== String(currentUserId)) return createdBy;

  const incoming = (messages || []).find(
    (message) => String(message.senderId ?? message.SenderId ?? "") !== String(currentUserId),
  );
  if (incoming) return String(incoming.senderId ?? incoming.SenderId ?? "");

  return "";
}

export function applyPeerIdentity(chat, { peerUserId, profile, peerName, avatar, avatarSeed } = {}) {
  const userId = String(peerUserId || chat.peerUserId || "").trim();
  const resolvedName =
    String(peerName || "").trim() ||
    resolvePeerDisplayName(profile, userId) ||
    (isGenericChatPeer(chat.peer) ? "" : String(chat.peer || "").trim());

  const next = { ...chat };
  if (userId) next.peerUserId = userId;

  if (resolvedName) {
    next.peer = resolvedName;
  } else if (userId && !isGenericChatPeer(chat.peer)) {
    next.peer = String(chat.peer || "").trim();
  } else {
    next.peer = "";
  }

  if (avatar) {
    next.avatar = avatar;
  } else if (userId || next.id) {
    next.avatar = resolvePersonAvatar({ profile, userId: userId || next.id, name: next.peer });
    next.avatarSeed = resolveAvatarSeed({ profile, userId: userId || next.id, name: next.peer });
  }

  if (avatarSeed) next.avatarSeed = avatarSeed;
  return next;
}

/** Hide orphan empty chats that were never tied to a real contact. */
export function shouldShowChatInList(chat) {
  if (!chat) return false;
  const peer = String(chat.peer || "").trim();
  const hasIncoming = (chat.messages || []).some((message) => !message.fromMe);
  if (hasIncoming && peer && !isGenericChatPeer(peer)) return true;
  if (hasIncoming && chat.peerUserId) return true;
  if (chat.peerUserId && peer && !isGenericChatPeer(peer)) return true;
  if (peer && !isGenericChatPeer(peer)) return true;
  return false;
}

export function resolveChatDisplayName(chat, fallback = "") {
  const peer = String(chat?.peer || "").trim();
  if (peer && !isGenericChatPeer(peer)) return peer;
  return String(fallback || "").trim();
}

export function mapChatDtoToUi(chat, currentUserId, profileByUserId = {}, messages = []) {
  const otherUserId = resolveOtherUserId(chat, messages, currentUserId);
  const chatId = String(chat.id ?? chat.Id ?? "");
  const profile = otherUserId ? profileByUserId[otherUserId] : null;
  const peer = resolvePeerDisplayName(profile, otherUserId);
  const seedUserId = otherUserId || (isGuid(chatId) ? chatId : null);

  return applyPeerIdentity(
    {
      id: chatId,
      peer: peer || "",
      peerUserId: otherUserId || null,
      online: true,
      messages: [],
      lastReadIncomingCount: 0,
      _api: true,
    },
    {
      peerUserId: otherUserId,
      profile,
      peerName: peer,
    },
  );
}
