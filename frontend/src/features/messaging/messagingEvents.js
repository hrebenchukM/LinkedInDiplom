export const MESSAGING_CHANGED_EVENT = 'linkup:messaging-changed';

export function notifyMessagingChanged() {
  window.dispatchEvent(new CustomEvent(MESSAGING_CHANGED_EVENT));
}
