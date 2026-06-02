import { createContext, useContext, useMemo, useState } from "react";
import { initialChats } from "../../shared/constants/mockData";
import {
  countIncomingMessages,
  countUnreadIncoming,
  notifyChatRead,
} from "../../shared/lib/messageRead";
import { readJson, writeJson } from "../../shared/lib/storage";
import { AI_ASSISTANT_PEER_ID } from "../../shared/constants/aiAssistant";
import { buildPostShareSnapshot } from "../../shared/lib/postShare";

const CHATS_KEY = "spaChats";
const ACTIVE_CHAT_KEY = "spaActiveChatId";
const ChatContext = createContext(null);

function getCanonicalPeerId() {
  return typeof window !== "undefined" && typeof window.canonicalPeerId === "function"
    ? window.canonicalPeerId
    : (value) => String(value || "").trim().toLowerCase();
}

function buildAiAssistantWelcomeUpdate(chats, { peerName, welcomeText, markUnread = false }) {
  const canonicalPeerId = getCanonicalPeerId();
  const targetId = canonicalPeerId(AI_ASSISTANT_PEER_ID);
  const displayName = String(peerName || "AI Assistant").trim();
  const existing = chats.find((chat) => {
    const chatPeer = canonicalPeerId(chat.peer);
    const chatId = canonicalPeerId(chat.id);
    return chatPeer === targetId || chatId === targetId;
  });

  if (existing) {
    const hasIncoming = existing.messages.some((message) => !message.fromMe);
    let updated = existing;

    if (!hasIncoming && welcomeText) {
      updated = {
        ...existing,
        peer: displayName,
        online: true,
        messages: [{ id: crypto.randomUUID(), fromMe: false, text: welcomeText }, ...existing.messages],
        lastReadIncomingCount: 0,
      };
    } else if (markUnread && hasIncoming) {
      updated = {
        ...existing,
        peer: displayName,
        online: true,
        lastReadIncomingCount: 0,
      };
    } else {
      updated = { ...existing, peer: displayName, online: true };
    }

    const rest = chats.filter((chat) => chat.id !== existing.id);
    return { next: [updated, ...rest], chatId: existing.id };
  }

  const newChat = {
    id: targetId,
    peer: displayName,
    online: true,
    messages: welcomeText ? [{ id: crypto.randomUUID(), fromMe: false, text: welcomeText }] : [],
    lastReadIncomingCount: 0,
  };

  return { next: [newChat, ...chats], chatId: newChat.id };
}

function markChatReadInList(chats, chatId) {
  const target = chats.find((chat) => chat.id === chatId);
  if (!target) return chats;

  const incoming = countIncomingMessages(target.messages);
  if (Number(target.lastReadIncomingCount) === incoming) return chats;

  return chats.map((chat) =>
    chat.id === chatId ? { ...chat, lastReadIncomingCount: incoming } : chat,
  );
}

export function ChatProvider({ children }) {
  const [chats, setChats] = useState(() => readJson(CHATS_KEY, initialChats));
  const [activeChatId, setActiveChatId] = useState(() =>
    readJson(ACTIVE_CHAT_KEY, initialChats[0]?.id || null),
  );

  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0] || null;

  const value = useMemo(
    () => ({
      chats,
      activeChat,
      totalUnreadCount: chats.reduce((total, chat) => total + countUnreadIncoming(chat), 0),
      setActiveChat(chatId) {
        if (!chatId) return;
        setActiveChatId(chatId);
        writeJson(ACTIVE_CHAT_KEY, chatId);

        const target = chats.find((chat) => chat.id === chatId);
        if (!target) return;

        const incoming = countIncomingMessages(target.messages);
        if (Number(target.lastReadIncomingCount) === incoming) return;

        const next = chats.map((chat) =>
          chat.id === chatId ? { ...chat, lastReadIncomingCount: incoming } : chat,
        );
        setChats(next);
        writeJson(CHATS_KEY, next);
        notifyChatRead(target.id || target.peer);
      },
      markChatAsRead(chatId) {
        const target = chats.find((chat) => chat.id === chatId);
        if (!target) return;

        const incoming = countIncomingMessages(target.messages);
        if (Number(target.lastReadIncomingCount) === incoming) return;

        const next = chats.map((chat) =>
          chat.id === chatId ? { ...chat, lastReadIncomingCount: incoming } : chat,
        );
        setChats(next);
        writeJson(CHATS_KEY, next);
        notifyChatRead(target.id || target.peer);
      },
      markChatAsReadByPeer(peer) {
        const canonicalPeerId =
          typeof window !== "undefined" && typeof window.canonicalPeerId === "function"
            ? window.canonicalPeerId
            : (value) => String(value || "").trim().toLowerCase();
        const slug = canonicalPeerId(peer);
        const target = chats.find((chat) => {
          const chatPeer = canonicalPeerId(chat.peer);
          const chatId = canonicalPeerId(chat.id);
          return chatPeer === slug || chatId === slug;
        });
        if (target) {
          const incoming = countIncomingMessages(target.messages);
          if (Number(target.lastReadIncomingCount) === incoming) {
            notifyChatRead(target.id || target.peer);
            return;
          }
          const next = chats.map((chat) =>
            chat.id === target.id ? { ...chat, lastReadIncomingCount: incoming } : chat,
          );
          setChats(next);
          writeJson(CHATS_KEY, next);
          notifyChatRead(target.id || target.peer);
        } else {
          notifyChatRead(peer);
        }
      },
      ensureChat({ peer, peerId }) {
        const displayPeer = String(peer || "").trim();
        if (!displayPeer) return null;

        const canonicalPeerId =
          typeof window !== "undefined" && typeof window.canonicalPeerId === "function"
            ? window.canonicalPeerId
            : (value) => String(value || "").trim().toLowerCase();

        const targetId = canonicalPeerId(peerId || displayPeer);
        const existing = chats.find((chat) => {
          const chatPeer = canonicalPeerId(chat.peer);
          const chatId = canonicalPeerId(chat.id);
          return chatPeer === targetId || chatId === targetId;
        });
        if (existing) return existing;

        const newChat = {
          id: targetId || crypto.randomUUID(),
          peer: displayPeer,
          online: true,
          messages: [],
          lastReadIncomingCount: 0,
        };
        const next = [newChat, ...chats];
        setChats(next);
        writeJson(CHATS_KEY, next);
        return newChat;
      },
      sendMessage(text) {
        if (!activeChat || !text.trim()) return;
        const next = chats.map((chat) => {
          if (chat.id !== activeChat.id) return chat;
          return {
            ...chat,
            messages: [
              ...chat.messages,
              { id: crypto.randomUUID(), fromMe: true, text: text.trim() },
            ],
          };
        });
        setChats(next);
        writeJson(CHATS_KEY, next);
      },
      sharePostToContact({ peer, peerId, post }) {
        const displayPeer = String(peer || "").trim();
        if (!displayPeer || !post) return null;

        const canonicalPeerId = getCanonicalPeerId();
        const targetId = canonicalPeerId(peerId || displayPeer);
        const snapshot = buildPostShareSnapshot(post);
        const message = {
          id: crypto.randomUUID(),
          type: "post",
          fromMe: true,
          post: snapshot,
        };

        const existingIndex = chats.findIndex((chat) => {
          const chatPeer = canonicalPeerId(chat.peer);
          const chatId = canonicalPeerId(chat.id);
          return chatPeer === targetId || chatId === targetId;
        });

        let next;
        if (existingIndex >= 0) {
          const existing = chats[existingIndex];
          const updated = {
            ...existing,
            peer: displayPeer,
            messages: [...(existing.messages || []), message],
          };
          next = [updated, ...chats.filter((_, index) => index !== existingIndex)];
        } else {
          const newChat = {
            id: targetId || crypto.randomUUID(),
            peer: displayPeer,
            online: true,
            messages: [message],
            lastReadIncomingCount: 0,
          };
          next = [newChat, ...chats];
        }

        setChats(next);
        writeJson(CHATS_KEY, next);
        return targetId;
      },
      addCallMessage(chatId, callStatus) {
        if (!chatId || !callStatus) return;
        const next = chats.map((chat) => {
          if (chat.id !== chatId) return chat;
          return {
            ...chat,
            messages: [
              ...chat.messages,
              {
                id: crypto.randomUUID(),
                type: "call",
                fromMe: true,
                callStatus,
              },
            ],
          };
        });
        setChats(next);
        writeJson(CHATS_KEY, next);
      },
      archiveChat(chatId) {
        const next = chats.map((chat) =>
          chat.id === chatId ? { ...chat, archived: true } : chat,
        );
        setChats(next);
        writeJson(CHATS_KEY, next);
        if (activeChatId === chatId) {
          const fallback = next.find((chat) => !chat.archived);
          const nextId = fallback?.id || null;
          setActiveChatId(nextId);
          writeJson(ACTIVE_CHAT_KEY, nextId);
        }
      },
      clearChatMessages(chatId) {
        const next = chats.map((chat) =>
          chat.id === chatId ? { ...chat, messages: [], lastReadIncomingCount: 0 } : chat,
        );
        setChats(next);
        writeJson(CHATS_KEY, next);
      },
      deleteChat(chatId) {
        const target = chats.find((chat) => chat.id === chatId);
        const next = chats.filter((chat) => chat.id !== chatId);
        setChats(next);
        writeJson(CHATS_KEY, next);
        if (activeChatId === chatId) {
          const fallback = next.find((chat) => !chat.archived) || next[0] || null;
          const nextId = fallback?.id || null;
          setActiveChatId(nextId);
          writeJson(ACTIVE_CHAT_KEY, nextId);
        }
        if (target && typeof window.disconnectPerson === "function") {
          window.disconnectPerson(target.id || target.peer);
        }
      },
      toggleChatMute(chatId) {
        const next = chats.map((chat) =>
          chat.id === chatId ? { ...chat, muted: !chat.muted } : chat,
        );
        setChats(next);
        writeJson(CHATS_KEY, next);
        return next.find((chat) => chat.id === chatId)?.muted ?? false;
      },
      ensureAiAssistantWelcomeChat({ peerName, welcomeText }) {
        const { next, chatId } = buildAiAssistantWelcomeUpdate(chats, {
          peerName,
          welcomeText,
          markUnread: true,
        });
        setChats(next);
        writeJson(CHATS_KEY, next);
        return chatId;
      },
      openAiAssistantChat({ peerName, welcomeText }) {
        const { next, chatId } = buildAiAssistantWelcomeUpdate(chats, { peerName, welcomeText });
        const readNext = markChatReadInList(next, chatId);
        setChats(readNext);
        writeJson(CHATS_KEY, readNext);
        setActiveChatId(chatId);
        writeJson(ACTIVE_CHAT_KEY, chatId);
        const target = readNext.find((chat) => chat.id === chatId);
        if (target) notifyChatRead(target.id || target.peer);
        return chatId;
      },
    }),
    [activeChat, activeChatId, chats],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatStore() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatStore must be used inside ChatProvider");
  return ctx;
}
