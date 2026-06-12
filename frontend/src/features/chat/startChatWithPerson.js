function getCanonicalPeerId() {
  return typeof window !== "undefined" && typeof window.canonicalPeerId === "function"
    ? window.canonicalPeerId
    : (value) => String(value || "").trim().toLowerCase();
}

function findExistingChat(chats, { peer, peerId }) {
  const canonicalPeerId = getCanonicalPeerId();
  const slug = canonicalPeerId(peerId || peer);
  return (
    chats.find((chat) => {
      const chatPeer = canonicalPeerId(chat.peer);
      const chatId = canonicalPeerId(chat.id);
      const chatUserId = chat.peerUserId ? canonicalPeerId(chat.peerUserId) : "";
      return chatPeer === slug || chatId === slug || (peerId && chatUserId === canonicalPeerId(peerId));
    }) || null
  );
}

/** Open or create a 1:1 chat with a person and navigate to `/chat`. */
export async function startChatWithPerson({
  person,
  chats,
  useApi,
  ensureChat,
  ensureApiChatForPeer,
  setActiveChat,
  navigate,
}) {
  if (!person?.name) return null;

  const peerId = person.userId || person.handle || person.seed || person.name;
  const peer = person.name;
  const avatar = person.avatar || "";
  const avatarSeed = person.seed || person.name;

  const existing = findExistingChat(chats, { peer, peerId });
  if (existing) {
    setActiveChat(existing.id);
    navigate(
      useApi && existing._api
        ? `/chat?chatId=${encodeURIComponent(existing.id)}`
        : "/chat",
    );
    return existing;
  }

  if (useApi && ensureApiChatForPeer) {
    const chat = await ensureApiChatForPeer({ peer, peerId, avatar, avatarSeed });
    if (chat?.id) {
      setActiveChat(chat.id);
      navigate(`/chat?chatId=${encodeURIComponent(chat.id)}`);
    }
    return chat;
  }

  const chat = ensureChat({ peer, peerId, avatar, avatarSeed });
  if (chat?.id) setActiveChat(chat.id);
  navigate("/chat");
  return chat;
}
