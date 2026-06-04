import { apiClient } from "../../shared/api/client";
import { MESSAGING } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";

export async function fetchMyChats() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(MESSAGING.myChats);
  return Array.isArray(data) ? data : [];
}

export async function fetchChatMessages(chatId) {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(MESSAGING.chatMessages(chatId));
  return Array.isArray(data) ? data : [];
}

export async function sendChatMessage(chatId, content) {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.post(MESSAGING.chatMessages(chatId), { content });
  if (data?.message) return data.message;
  if (data?.id) return data;
  return data;
}

export async function createChat() {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.post(MESSAGING.myChats, {});
  return data?.chat || data;
}

export async function deleteMessage(messageId) {
  if (USE_MOCK_AUTH) return { success: true };
  return apiClient.delete(MESSAGING.message(messageId));
}
