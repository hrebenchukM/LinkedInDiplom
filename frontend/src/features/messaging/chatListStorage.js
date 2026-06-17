const FAVORITES_PREFIX = 'linkup:favorite-chats:';
const SPAM_PREFIX = 'linkup:spam-chats:';

function storageKey(prefix, userId) {
  return `${prefix}${String(userId ?? 'guest')}`;
}

function readSet(prefix, userId) {
  if (typeof window === 'undefined' || !userId) return new Set();

  try {
    const raw = window.localStorage.getItem(storageKey(prefix, userId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

function writeSet(prefix, userId, ids) {
  if (typeof window === 'undefined' || !userId) return;
  window.localStorage.setItem(storageKey(prefix, userId), JSON.stringify([...ids]));
}

export function getFavoriteChatIds(userId) {
  return [...readSet(FAVORITES_PREFIX, userId)];
}

export function isChatFavorite(userId, chatId) {
  if (!userId || !chatId) return false;
  return readSet(FAVORITES_PREFIX, userId).has(String(chatId));
}

export function toggleFavoriteChat(userId, chatId) {
  if (!userId || !chatId) return false;

  const next = readSet(FAVORITES_PREFIX, userId);
  const id = String(chatId);
  const added = !next.has(id);

  if (added) {
    next.add(id);
  } else {
    next.delete(id);
  }

  writeSet(FAVORITES_PREFIX, userId, next);
  return added;
}

export function getSpamChatIds(userId) {
  return [...readSet(SPAM_PREFIX, userId)];
}

export function isChatSpam(userId, chatId) {
  if (!userId || !chatId) return false;
  return readSet(SPAM_PREFIX, userId).has(String(chatId));
}

export function toggleSpamChat(userId, chatId) {
  if (!userId || !chatId) return false;

  const next = readSet(SPAM_PREFIX, userId);
  const id = String(chatId);
  const added = !next.has(id);

  if (added) {
    next.add(id);
  } else {
    next.delete(id);
  }

  writeSet(SPAM_PREFIX, userId, next);
  return added;
}

export function clearSpamChat(userId, chatId) {
  if (!userId || !chatId) return;
  const next = readSet(SPAM_PREFIX, userId);
  next.delete(String(chatId));
  writeSet(SPAM_PREFIX, userId, next);
}
