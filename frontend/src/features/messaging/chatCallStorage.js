const CALL_PREFIX = 'linkup:chat-calls:';

function storageKey(userId) {
  return `${CALL_PREFIX}${String(userId ?? 'guest')}`;
}

function readStore(userId) {
  if (typeof window === 'undefined' || !userId) return {};

  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(userId, store) {
  if (typeof window === 'undefined' || !userId) return;
  window.localStorage.setItem(storageKey(userId), JSON.stringify(store));
}

export function getCallMessagesForChat(userId, chatId) {
  if (!userId || !chatId) return [];

  const store = readStore(userId);
  const items = store[String(chatId)];
  return Array.isArray(items) ? items : [];
}

export function appendCallMessage(userId, chatId, message) {
  if (!userId || !chatId || !message) return message;

  const store = readStore(userId);
  const key = String(chatId);
  const existing = Array.isArray(store[key]) ? store[key] : [];
  store[key] = [...existing, message];
  writeStore(userId, store);
  return message;
}

export function clearCallMessagesForChat(userId, chatId) {
  if (!userId || !chatId) return;

  const store = readStore(userId);
  delete store[String(chatId)];
  writeStore(userId, store);
}
