const READ_INBOX_KEY = "readInboxPeers";

export function countIncomingMessages(messages) {
  if (!Array.isArray(messages)) return 0;
  return messages.filter((message) => message && !message.fromMe).length;
}

export function countUnreadIncoming(chat) {
  const incoming = countIncomingMessages(chat?.messages);
  const read = Number(chat?.lastReadIncomingCount) || 0;
  return Math.max(0, incoming - read);
}

export function readInboxPeerSet() {
  try {
    const raw = localStorage.getItem(READ_INBOX_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

export function markInboxPeerRead(peer) {
  const slug = String(peer || "").trim().toLowerCase();
  if (!slug) return;
  const next = readInboxPeerSet();
  next.add(slug);
  try {
    localStorage.setItem(READ_INBOX_KEY, JSON.stringify([...next]));
  } catch {
    // ignore
  }
}

export function isInboxPeerRead(peer) {
  const slug = String(peer || "").trim().toLowerCase();
  if (!slug) return false;
  return readInboxPeerSet().has(slug);
}

export function countStaticInboxUnread(items, canonicalPeerId) {
  const canonical =
    typeof canonicalPeerId === "function"
      ? canonicalPeerId
      : (value) => String(value || "").trim().toLowerCase();
  const readPeers = readInboxPeerSet();

  return items.reduce((total, item) => {
    if (!item?.unread) return total;
    const peer = canonical(item.peer);
    if (!peer || readPeers.has(peer)) return total;
    return total + 1;
  }, 0);
}

export function notifyChatRead(peer) {
  document.dispatchEvent(new CustomEvent("chatread", { detail: { peer } }));
}
