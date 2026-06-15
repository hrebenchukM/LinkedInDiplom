import apiClient from '../../shared/api/client.js';
import { API_PATHS } from '../../shared/api/paths.js';
import { buildPaginationQuery } from '../../shared/lib/pagination.js';
import {
  extractChatFromResponse,
  extractMessageFromResponse,
  mapChatDto,
  mapChatListResponse,
  mapMessageListResponse,
  mapMessageMediaUploadResponse,
  getCompanionUserIdFromChat,
} from './mapMessaging.js';

// Chats
export async function getMyChats(params = {}, currentUserId = null) {
  const query = buildPaginationQuery(params);
  const response = await apiClient.get(API_PATHS.messaging.chats, { query });
  return mapChatListResponse(response, currentUserId);
}

export async function createChat(data = {}) {
  const response = await apiClient.post(API_PATHS.messaging.chats, data);
  return extractChatFromResponse(response);
}

export async function getChatById(chatId, currentUserId = null) {
  const dto = await apiClient.get(API_PATHS.messaging.chatById(chatId));
  return mapChatDto(dto, currentUserId);
}

export async function getChatMembers(chatId) {
  const response = await apiClient.get(API_PATHS.messaging.chatMembers(chatId));
  return Array.isArray(response) ? response : response?.items ?? [];
}

export async function joinChatHttp(chatId) {
  return apiClient.post(API_PATHS.messaging.chatJoin(chatId), {});
}

export async function leaveChatHttp(chatId) {
  return apiClient.delete(API_PATHS.messaging.chatLeave(chatId));
}

export async function findDirectChatWithUser(targetUserId, currentUserId) {
  if (!targetUserId || !currentUserId) return null;

  const result = await getMyChats({ page: 1, pageSize: 100 }, currentUserId);

  return (
    result.items.find((chat) => {
      const memberIds = (chat.members ?? [])
        .map((member) => member.userId)
        .filter(Boolean);

      return (
        memberIds.includes(targetUserId) &&
        memberIds.includes(currentUserId) &&
        memberIds.length >= 2
      );
    }) ?? null
  );
}

export async function createDirectChat(targetUserId, currentUserId) {
  const existing = await findDirectChatWithUser(targetUserId, currentUserId);
  if (existing) {
    return { chat: existing, created: false };
  }

  const created = await createChat({});
  return {
    chat: created,
    created: true,
    limitation:
      'Backend has no add-member endpoint; the other user must join via POST /chats/{id}/join.',
  };
}

// Messages
export async function getChatMessages(chatId, params = {}, currentUserId = null) {
  const query = buildPaginationQuery(params);
  const response = await apiClient.get(API_PATHS.messaging.messages(chatId), { query });
  return mapMessageListResponse(response, currentUserId);
}

export async function sendMessage(chatId, data, currentUserId = null) {
  const response = await apiClient.post(API_PATHS.messaging.messages(chatId), data);
  return extractMessageFromResponse(response, currentUserId);
}

export async function updateMessage(messageId, data, currentUserId = null) {
  const response = await apiClient.patch(API_PATHS.messaging.messageById(messageId), data);
  return extractMessageFromResponse(response, currentUserId);
}

export async function deleteMessage(messageId) {
  return apiClient.delete(API_PATHS.messaging.messageById(messageId));
}

export async function markMessageAsRead(messageId) {
  try {
    return await apiClient.post(API_PATHS.messaging.readMessage(messageId), {});
  } catch {
    return null;
  }
}

export async function uploadMessageMedia(messageId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.upload(
    API_PATHS.messaging.messageMediaUpload(messageId),
    formData,
  );
  return mapMessageMediaUploadResponse(response);
}

export { getCompanionUserIdFromChat };
