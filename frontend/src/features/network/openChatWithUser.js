import {
  createDirectChat,
  findDirectChatWithUser,
} from '../messaging/messagingApi.js';
import { markUserInitiatedChat } from '../../features/messaging/userInitiatedChats.js';
import { notifyMessagingChanged } from '../messaging/messagingEvents.js';

export async function openChatWithUser({
  targetUserId,
  currentUserId,
  navigate,
  shouldNavigate = true,
}) {
  if (!targetUserId || !currentUserId) return null;

  const existing = await findDirectChatWithUser(targetUserId, currentUserId);
  if (existing?.id) {
    markUserInitiatedChat(existing.id, targetUserId);
    notifyMessagingChanged();
    if (shouldNavigate && navigate) {
      navigate(`/app/messages/${existing.id}`);
    }
    return existing.id;
  }

  const { chat } = await createDirectChat(targetUserId, currentUserId);
  if (chat?.id) {
    markUserInitiatedChat(chat.id, targetUserId);
    notifyMessagingChanged();
    if (shouldNavigate && navigate) {
      navigate(`/app/messages/${chat.id}`);
    }
    return chat.id;
  }

  return null;
}
