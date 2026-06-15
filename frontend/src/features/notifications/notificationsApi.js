import apiClient from '../../shared/api/client.js';
import { API_PATHS } from '../../shared/api/paths.js';
import { buildPaginationQuery } from '../../shared/lib/pagination.js';
import {
  mapNotificationDto,
  mapNotificationListResponse,
} from './mapNotifications.js';

function buildNotificationQuery(params = {}) {
  const {
    page,
    pageSize,
    limit,
    isRead,
    type,
    fromCreatedAt,
    toCreatedAt,
    ...rest
  } = params;

  return buildPaginationQuery({
    page,
    pageSize: pageSize ?? limit,
    extra: {
      isRead,
      type,
      fromCreatedAt,
      toCreatedAt,
      ...rest,
    },
  });
}

function unwrapNotification(response) {
  const notification = response?.notification ?? response?.Notification ?? response;
  return mapNotificationDto(notification);
}

export async function getMyNotifications(params = {}) {
  const query = buildNotificationQuery(params);
  const response = await apiClient.get(API_PATHS.notifications.mine, { query });
  return mapNotificationListResponse(response);
}

export async function getUnreadNotifications(params = {}) {
  return getMyNotifications({
    ...params,
    isRead: false,
  });
}

export async function markNotificationAsRead(notificationId) {
  const response = await apiClient.patch(API_PATHS.notifications.markRead(notificationId));
  return unwrapNotification(response);
}

export async function markAllNotificationsAsRead() {
  return apiClient.patch(API_PATHS.notifications.readAll);
}

export async function deleteNotification(notificationId) {
  return apiClient.delete(API_PATHS.notifications.byId(notificationId));
}

export async function getUnreadCount() {
  try {
    const response = await getUnreadNotifications({ page: 1, pageSize: 1 });
    return response.totalCount ?? 0;
  } catch {
    return 0;
  }
}

export async function getNotificationById(notificationId) {
  const response = await apiClient.get(API_PATHS.notifications.byId(notificationId));
  return mapNotificationDto(response);
}
