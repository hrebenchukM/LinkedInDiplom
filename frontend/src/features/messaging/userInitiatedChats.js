const STORAGE_KEY = 'linkup.userInitiatedChats';
const COMPANION_KEY = 'linkup.chatCompanions';
const PREVIEW_KEY = 'linkup.chatPreviews';

export function getUserInitiatedChatIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list.map(String) : []);
  } catch {
    return new Set();
  }
}

export function getChatCompanions() {
  try {
    const raw = localStorage.getItem(COMPANION_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map && typeof map === 'object' ? map : {};
  } catch {
    return {};
  }
}

export function getStoredCompanionUserId(chatId) {
  if (!chatId) return null;
  return getChatCompanions()[String(chatId)] ?? null;
}

export function findStoredChatIdForUser(targetUserId) {
  if (!targetUserId) return null;

  const target = String(targetUserId);
  const companions = getChatCompanions();

  for (const [chatId, userId] of Object.entries(companions)) {
    if (String(userId) === target) {
      return chatId;
    }
  }

  return null;
}

export function getStoredChatPreview(chatId) {
  if (!chatId) return '';
  try {
    const raw = localStorage.getItem(PREVIEW_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map?.[String(chatId)] ?? '';
  } catch {
    return '';
  }
}

export function setStoredChatPreview(chatId, preview) {
  if (!chatId || !preview) return;
  try {
    const raw = localStorage.getItem(PREVIEW_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[String(chatId)] = String(preview).slice(0, 160);
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function markUserInitiatedChat(chatId, companionUserId, preview = '') {
  if (!chatId) return;

  const ids = getUserInitiatedChatIds();
  ids.add(String(chatId));

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }

  if (companionUserId) {
    const companions = getChatCompanions();
    companions[String(chatId)] = String(companionUserId);

    try {
      localStorage.setItem(COMPANION_KEY, JSON.stringify(companions));
    } catch {
      /* ignore */
    }
  }

  if (preview) {
    setStoredChatPreview(chatId, preview);
  }
}

export function clearUserInitiatedChat(chatId) {
  if (!chatId) return;

  const key = String(chatId);

  try {
    const ids = [...getUserInitiatedChatIds()].filter((id) => id !== key);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }

  try {
    const companions = getChatCompanions();
    if (companions[key] != null) {
      delete companions[key];
      localStorage.setItem(COMPANION_KEY, JSON.stringify(companions));
    }
  } catch {
    /* ignore */
  }

  try {
    const raw = localStorage.getItem(PREVIEW_KEY);
    const map = raw ? JSON.parse(raw) : {};
    if (map[key] != null) {
      delete map[key];
      localStorage.setItem(PREVIEW_KEY, JSON.stringify(map));
    }
  } catch {
    /* ignore */
  }
}
