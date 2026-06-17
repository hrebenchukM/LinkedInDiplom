const DRAFT_PREFIX = 'linkup:chat-drafts:';

function storageKey(userId) {
  return `${DRAFT_PREFIX}${String(userId ?? 'guest')}`;
}

function readDrafts(userId) {
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

function writeDrafts(userId, drafts) {
  if (typeof window === 'undefined' || !userId) return;
  window.localStorage.setItem(storageKey(userId), JSON.stringify(drafts));
}

export function getChatDraft(userId, chatId) {
  if (!userId || !chatId) return '';
  const drafts = readDrafts(userId);
  return String(drafts[String(chatId)] ?? '').trim();
}

export function setChatDraft(userId, chatId, text) {
  if (!userId || !chatId) return;

  const drafts = readDrafts(userId);
  const trimmed = String(text ?? '').trim();

  if (!trimmed) {
    delete drafts[String(chatId)];
  } else {
    drafts[String(chatId)] = trimmed;
  }

  writeDrafts(userId, drafts);
}

export function clearChatDraft(userId, chatId) {
  setChatDraft(userId, chatId, '');
}

export function getChatIdsWithDrafts(userId) {
  if (!userId) return [];

  return Object.entries(readDrafts(userId))
    .filter(([, text]) => String(text ?? '').trim())
    .map(([chatId]) => String(chatId));
}
