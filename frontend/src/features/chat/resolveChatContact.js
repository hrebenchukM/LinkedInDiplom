import { AI_ASSISTANT_PEER_ID } from "../../shared/constants/aiAssistant";
import { getContactAvatarUrl, getContactProfile } from "../../shared/constants/contactProfiles";

function getCanonicalPeerId() {
  return typeof window !== "undefined" && typeof window.canonicalPeerId === "function"
    ? window.canonicalPeerId
    : (value) => String(value || "").trim().toLowerCase();
}

function isGuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

function resolveStableChatSeed(chat) {
  if (chat?.avatarSeed) return String(chat.avatarSeed);
  if (chat?.peerUserId && isGuid(chat.peerUserId)) return String(chat.peerUserId).toLowerCase();
  if (chat?.id && isGuid(chat.id)) return String(chat.id).toLowerCase();
  const peer = String(chat?.peer || "").trim();
  if (peer && peer.toLowerCase() !== "chat") return peer.replace(/\s+/g, "");
  return String(chat?.id || chat?.peer || "user");
}

function isAiAssistantChat(chat) {
  if (!chat) return false;
  const canonical = getCanonicalPeerId();
  return canonical(chat.id || chat.peer) === canonical(AI_ASSISTANT_PEER_ID);
}

/** Stable contact profile for a chat row (list, header, sidebar). */
export function resolveChatContactProfile(chat, t) {
  if (!chat) return getContactProfile("user");

  if (isAiAssistantChat(chat)) {
    return getContactProfile(AI_ASSISTANT_PEER_ID, {
      name: t?.("notify.aiAssistantName", "AI Assistant") ?? "AI Assistant",
    });
  }

  return getContactProfile(chat.peerUserId || chat.id || chat.peer, {
    name: chat.peer,
    avatar: chat.avatar,
    seed: resolveStableChatSeed(chat),
  });
}

/** Stable avatar URL — same image everywhere for one chat contact. */
export function resolveChatAvatar(chat, t) {
  if (!chat) {
    return getContactAvatarUrl(getContactProfile("user"), "user");
  }

  if (isAiAssistantChat(chat)) {
    return getContactAvatarUrl(
      getContactProfile(AI_ASSISTANT_PEER_ID, {
        name: t?.("notify.aiAssistantName", "AI Assistant") ?? "AI Assistant",
      }),
      AI_ASSISTANT_PEER_ID,
    );
  }

  if (chat.avatar) return chat.avatar;

  return getContactAvatarUrl(
    resolveChatContactProfile(chat, t),
    resolveStableChatSeed(chat),
  );
}
