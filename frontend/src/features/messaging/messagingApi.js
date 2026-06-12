import { apiClient, buildApiUrl } from "../../shared/api/client";
import { apiUpload } from "../../shared/api/http";
import { MESSAGING } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import { unwrapPagedItems } from "../../shared/lib/pagedResponse";

function withPaging(path, { page = 1, pageSize = 100 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  return `${path}?${params.toString()}`;
}

export async function fetchMyChats({ page = 1, pageSize = 100 } = {}) {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(withPaging(MESSAGING.myChats, { page, pageSize }));
  return unwrapPagedItems(data, (item) => item);
}

export async function fetchChatMessages(chatId, { page = 1, pageSize = 100 } = {}) {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(withPaging(MESSAGING.chatMessages(chatId), { page, pageSize }));
  return unwrapPagedItems(data, (item) => item);
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

export async function joinChat(chatId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.post(MESSAGING.chatJoin(chatId), {});
}

export async function fetchChatMembers(chatId) {
  if (USE_MOCK_AUTH || !chatId) return [];
  const data = await apiClient.get(MESSAGING.chatMembers(chatId));
  return unwrapPagedItems(data, (item) => item);
}

export async function leaveChatMembership(chatId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.delete(MESSAGING.chatMembership(chatId));
}

export async function deleteMessage(messageId) {
  if (USE_MOCK_AUTH) return { success: true };
  return apiClient.delete(MESSAGING.message(messageId));
}

export async function markMessageRead(messageId) {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.post(MESSAGING.messageRead(messageId), {});
  return data?.read || data?.messageRead || data;
}

export async function uploadMessageMedia(messageId, file) {
  if (USE_MOCK_AUTH) return null;
  const { ok, data } = await apiUpload("POST", MESSAGING.messageMediaUpload(messageId), file, "file");
  if (!ok) {
    throw new Error(data?.errors?.[0] || "Media upload failed.");
  }
  return data?.media || data?.messageMedia || data;
}

export function resolveMediaUrl(mediaUrl) {
  const raw = String(mediaUrl || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:") || raw.startsWith("blob:")) return raw;
  return buildApiUrl(raw.startsWith("/") ? raw : `/${raw}`);
}
