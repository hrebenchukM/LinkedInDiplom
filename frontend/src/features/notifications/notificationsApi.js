import { apiClient } from "../../shared/api/client";
import { NOTIFICATIONS } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";

export async function fetchMyNotifications({ isRead, limit } = {}) {
  if (USE_MOCK_AUTH) return [];
  const params = new URLSearchParams();
  if (isRead !== undefined) params.set("isRead", String(isRead));
  if (limit) params.set("limit", String(limit));
  const qs = params.toString();
  const path = qs ? `${NOTIFICATIONS.me}?${qs}` : NOTIFICATIONS.me;
  const data = await apiClient.get(path);
  return Array.isArray(data) ? data : [];
}

export async function markNotificationRead(notificationId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.patch(NOTIFICATIONS.markRead(notificationId));
}

export async function markAllNotificationsRead() {
  if (USE_MOCK_AUTH) return null;
  return apiClient.patch(NOTIFICATIONS.readAll);
}
