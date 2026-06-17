const KEY_PREFIX = 'linkup:archived-chats:';

function storageKey(userId) {
  return `${KEY_PREFIX}${String(userId ?? 'guest')}`;
}

function readSet(userId) {
  if (typeof window === 'undefined' || !userId) return new Set();

  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

function writeSet(userId, ids) {
  if (typeof window === 'undefined' || !userId) return;
  window.localStorage.setItem(storageKey(userId), JSON.stringify([...ids]));
}

export function getArchivedChatIds(userId) {
  return [...readSet(userId)];
}

export function isChatArchived(userId, chatId) {
  if (!userId || !chatId) return false;
  return readSet(userId).has(String(chatId));
}

export function archiveChat(userId, chatId) {
  if (!userId || !chatId) return;
  const next = readSet(userId);
  next.add(String(chatId));
  writeSet(userId, next);
}

export function unarchiveChat(userId, chatId) {
  if (!userId || !chatId) return;
  const next = readSet(userId);
  next.delete(String(chatId));
  writeSet(userId, next);
}

export function clearArchivedChat(userId, chatId) {
  unarchiveChat(userId, chatId);
}
