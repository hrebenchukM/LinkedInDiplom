import * as messagingApi from "./messagingApi";
import { mapChatDtoToUi, mapMessageDtoToUi } from "./mapMessaging";
import { fetchProfilesByUserIds } from "../profile/profileApi";

export async function loadChatsFromApi(currentUserId) {
  const chatDtos = await messagingApi.fetchMyChats();
  const memberIds = chatDtos.flatMap((chat) =>
    (chat.members || []).map((m) => m.userId).filter((id) => String(id) !== String(currentUserId)),
  );
  const profiles = await fetchProfilesByUserIds(memberIds);

  const chats = await Promise.all(
    chatDtos.map(async (dto) => {
      const uiChat = mapChatDtoToUi(dto, currentUserId, profiles);
      try {
        const messages = await messagingApi.fetchChatMessages(dto.id);
        uiChat.messages = messages.map((msg) => mapMessageDtoToUi(msg, currentUserId));
        uiChat.lastReadIncomingCount = uiChat.messages.filter((m) => !m.fromMe).length;
      } catch {
        uiChat.messages = [];
      }
      return uiChat;
    }),
  );

  return chats;
}
