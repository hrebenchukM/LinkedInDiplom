import * as messagingApi from "./messagingApi";
import {
  applyPeerIdentity,
  mapChatDtoToUi,
  mapMessageDtoToUi,
  resolveOtherUserId,
  shouldShowChatInList,
} from "./mapMessaging";
import { fetchProfilesByUserIds } from "../profile/profileApi";

async function resolveOtherUserIdForChat(dto, messages, currentUserId) {
  let otherUserId = resolveOtherUserId(dto, messages, currentUserId);
  if (otherUserId) return otherUserId;

  try {
    const members = await messagingApi.fetchChatMembers(dto.id ?? dto.Id);
    const otherMember = members.find(
      (member) => String(member.userId ?? member.UserId ?? "") !== String(currentUserId),
    );
    if (otherMember) return String(otherMember.userId ?? otherMember.UserId ?? "");
  } catch {
    // members endpoint may fail for orphan chats
  }

  return "";
}

export async function loadChatsFromApi(currentUserId) {
  const chatDtos = await messagingApi.fetchMyChats();

  const chatsWithMessages = await Promise.all(
    chatDtos.map(async (dto) => {
      let messages = [];
      try {
        messages = await messagingApi.fetchChatMessages(dto.id ?? dto.Id);
      } catch {
        messages = [];
      }
      return { dto, messages };
    }),
  );

  const peerIds = new Set();
  const resolvedPeerByChatId = new Map();

  await Promise.all(
    chatsWithMessages.map(async ({ dto, messages }) => {
      const chatId = String(dto.id ?? dto.Id ?? "");
      const otherUserId = await resolveOtherUserIdForChat(dto, messages, currentUserId);
      if (otherUserId) {
        peerIds.add(otherUserId);
        resolvedPeerByChatId.set(chatId, otherUserId);
      }
    }),
  );

  const profiles = await fetchProfilesByUserIds([...peerIds]);

  const chats = chatsWithMessages
    .map(({ dto, messages }) => {
      const chatId = String(dto.id ?? dto.Id ?? "");
      const otherUserId = resolvedPeerByChatId.get(chatId) || "";
      const uiMessages = messages.map((msg) => mapMessageDtoToUi(msg, currentUserId));
      let uiChat = mapChatDtoToUi(dto, currentUserId, profiles, uiMessages);
      uiChat.messages = uiMessages;
      uiChat.lastReadIncomingCount = uiMessages.filter((message) => !message.fromMe).length;

      if (otherUserId) {
        uiChat = applyPeerIdentity(uiChat, {
          peerUserId: otherUserId,
          profile: profiles[otherUserId],
        });
      }

      return uiChat;
    })
    .filter(shouldShowChatInList);

  return chats;
}
