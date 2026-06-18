export const NOTIFICATIONS_UNREAD_CHANGED_EVENT = 'linkup:notifications-unread-changed';

export function notifyNotificationsUnreadChanged(count) {
  window.dispatchEvent(
    new CustomEvent(NOTIFICATIONS_UNREAD_CHANGED_EVENT, {
      detail: { count },
    }),
  );
}
