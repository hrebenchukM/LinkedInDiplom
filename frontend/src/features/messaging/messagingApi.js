import apiClient from '../../shared/api/client.js';
import { API_PATHS } from '../../shared/api/paths.js';
import { ApiError } from '../../shared/lib/apiError.js';
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
import { findStoredChatIdForUser } from './userInitiatedChats.js';

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

export async function deleteChatHttp(chatId) {
  return apiClient.delete(API_PATHS.messaging.chatById(chatId));
}

function isCreatorMatch(createdBy, currentUserId) {
  return Boolean(createdBy) && String(createdBy) === String(currentUserId);
}

function getChatRemovalErrorMessage(error) {
  if (!error) return '';
  if (error instanceof ApiError) {
    if (error.message) return error.message;
    if (error.errors?.length) return error.errors.join(' ');
  }
  if (typeof error === 'string') return error;
  if (error instanceof Error && error.message) return error.message;
  return '';
}

export function isChatAlreadyRemovedError(error) {
  const message = getChatRemovalErrorMessage(error).toLowerCase();
  if (!message && error instanceof ApiError && error.status === 404) {
    return true;
  }
  return (
    message.includes('membership not found') ||
    message.includes('chat not found') ||
    message.includes('creator cannot leave')
  );
}

async function tryDeleteChat(chatId) {
  try {
    return await deleteChatHttp(chatId);
  } catch (error) {
    if (isChatAlreadyRemovedError(error)) {
      return null;
    }
    throw error;
  }
}

async function tryLeaveChat(chatId) {
  try {
    return await leaveChatHttp(chatId);
  } catch (error) {
    if (isChatAlreadyRemovedError(error)) {
      return null;
    }
    throw error;
  }
}

export async function removeChatForUser(chatId, currentUserId, createdBy) {
  if (isCreatorMatch(createdBy, currentUserId)) {
    return tryDeleteChat(chatId);
  }

  try {
    return await tryLeaveChat(chatId);
  } catch (leaveError) {
    const leaveMessage = getChatRemovalErrorMessage(leaveError).toLowerCase();
    if (leaveMessage.includes('creator cannot leave')) {
      return tryDeleteChat(chatId);
    }

    try {
      return await tryDeleteChat(chatId);
    } catch {
      throw leaveError;
    }
  }
}

export async function findDirectChatWithUser(targetUserId, currentUserId) {
  if (!targetUserId || !currentUserId) return null;

  const result = await getMyChats({ page: 1, pageSize: 100 }, currentUserId);
  const target = String(targetUserId);
  const current = String(currentUserId);

  const matched = result.items.find((chat) => {
    const memberIds = (chat.members ?? [])
      .map((member) => member.userId)
      .filter(Boolean)
      .map(String);

    return (
      memberIds.includes(target) &&
      memberIds.includes(current) &&
      memberIds.length >= 2
    );
  });

  if (matched) return matched;

  const storedChatId = findStoredChatIdForUser(target);
  if (!storedChatId) return null;

  return result.items.find((chat) => String(chat.id) === String(storedChatId)) ?? null;
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

export async function attachMessageMedia(messageId, { mediaUrl, mediaType = 'image' }) {
  const response = await apiClient.post(
    API_PATHS.messaging.messageMediaAttach(messageId),
    { mediaUrl, mediaType },
  );
  return mapMessageMediaUploadResponse(response?.messageMedia ?? response?.MessageMedia ?? response);
}

export { getCompanionUserIdFromChat };

/** Legacy aliases used by front+back chat loader shims. */
export async function fetchMyChats(params = {}, currentUserId = null) {
  const result = await getMyChats(params, currentUserId);
  return result.items ?? [];
}

export const fetchChatMembers = getChatMembers;

export async function fetchChatMessages(chatId, params = {}, currentUserId = null) {
  const result = await getChatMessages(chatId, params, currentUserId);
  return result.items ?? [];
}
