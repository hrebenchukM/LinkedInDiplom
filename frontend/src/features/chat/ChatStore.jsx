import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { initialChats } from "../../shared/constants/mockData";
import { isBackendApiEnabled } from "../../shared/lib/backendApi";
import { loadChatsFromApi } from "../messaging/loadChats";
import * as messagingApi from "../messaging/messagingApi";
import { mapMessageDtoToUi } from "../messaging/mapMessaging";
import {
  countIncomingMessages,
  countUnreadIncoming,
  notifyChatRead,
} from "../../shared/lib/messageRead";
import { readJson, writeJson } from "../../shared/lib/storage";
import { AI_ASSISTANT_PEER_ID } from "../../shared/constants/aiAssistant";
import { buildPostShareSnapshot } from "../../shared/lib/postShare";
import { isAiAssistantChat, resolveAiAssistantReply } from "./aiAssistantReplies";

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

function mergeApiAndLocalChats(apiChats, localChats) {
  const canonical = getCanonicalPeerId();
  const aiId = canonical(AI_ASSISTANT_PEER_ID);
  const apiIds = new Set(apiChats.map((c) => String(c.id)));
  const extras = localChats.filter((chat) => {
    const peer = canonical(chat.peer);
    const id = canonical(chat.id);
    return (peer === aiId || id === aiId || !chat._api) && !apiIds.has(String(chat.id));
  });
  return [...apiChats, ...extras];
}

export function ChatProvider({ children }) {
  const { session } = useAuth();
  const useApi = isBackendApiEnabled(session);
  const [chats, setChats] = useState(() => readJson(CHATS_KEY, initialChats));
  const [activeChatId, setActiveChatId] = useState(() =>
    readJson(ACTIVE_CHAT_KEY, initialChats[0]?.id || null),
  );
  const [isLoading, setIsLoading] = useState(false);

  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0] || null;

  const persistChats = useCallback(
    (next) => {
      setChats(next);
      if (!useApi) writeJson(CHATS_KEY, next);
    },
    [useApi],
  );

  const reloadFromApi = useCallback(async () => {
    if (!useApi || !session.user?.id) return;
    setIsLoading(true);
    try {
      const apiChats = await loadChatsFromApi(session.user.id);
      const local = readJson(CHATS_KEY, initialChats);
      const merged = mergeApiAndLocalChats(apiChats, local);
      persistChats(merged);
      if (!merged.some((c) => c.id === activeChatId)) {
        const nextId = merged[0]?.id || null;
        setActiveChatId(nextId);
        writeJson(ACTIVE_CHAT_KEY, nextId);
      }
    } catch {
      // keep previous chats on error
    } finally {
      setIsLoading(false);
    }
  }, [useApi, session.user?.id, activeChatId, persistChats]);

  useEffect(() => {
    if (useApi) reloadFromApi();
  }, [useApi, session.user?.id, reloadFromApi]);

  const persistAiChats = useCallback((next) => {
    setChats(next);
    writeJson(CHATS_KEY, next);
  }, []);

  const appendAiAssistantExchange = useCallback(
    (chatId, userText, lang, onAiAction) => {
      const userMsg = { id: crypto.randomUUID(), fromMe: true, text: userText };
      const withUser = chats.map((chat) =>
        chat.id === chatId ? { ...chat, messages: [...chat.messages, userMsg] } : chat,
      );
      persistAiChats(withUser);

      window.setTimeout(() => {
        const { text: replyText, action } = resolveAiAssistantReply(userText, lang);
        const assistantMsg = { id: crypto.randomUUID(), fromMe: false, text: replyText };
        setChats((prev) => {
          const next = prev.map((chat) =>
            chat.id === chatId ? { ...chat, messages: [...chat.messages, assistantMsg] } : chat,
          );
          writeJson(CHATS_KEY, next);
          return next;
        });

        if (action && typeof onAiAction === "function") {
          window.setTimeout(() => onAiAction(action), 500);
        }
      }, 650);
    },
    [chats, persistAiChats],
  );

  const sendMessage = useCallback(
    async (text, options = {}) => {
      if (!activeChat || !text.trim()) return;
      const trimmed = text.trim();

      if (isAiAssistantChat(activeChat)) {
        appendAiAssistantExchange(activeChat.id, trimmed, options.lang, options.onAiAction);
        return;
      }

      if (useApi && activeChat._api) {
        try {
          const raw = await messagingApi.sendChatMessage(activeChat.id, trimmed);
          const dto = raw?.message || raw;
          const uiMsg = mapMessageDtoToUi(dto, session.user?.id);
          const next = chats.map((chat) =>
            chat.id === activeChat.id ? { ...chat, messages: [...chat.messages, uiMsg] } : chat,
          );
          persistChats(next);
        } catch {
          const fallback = { id: crypto.randomUUID(), fromMe: true, text: trimmed };
          const next = chats.map((chat) =>
            chat.id === activeChat.id ? { ...chat, messages: [...chat.messages, fallback] } : chat,
          );
          persistChats(next);
        }
        return;
      }

      const next = chats.map((chat) => {
        if (chat.id !== activeChat.id) return chat;
        return {
          ...chat,
          messages: [...chat.messages, { id: crypto.randomUUID(), fromMe: true, text: trimmed }],
        };
      });
      persistChats(next);
    },
    [activeChat, chats, persistChats, session.user?.id, useApi, appendAiAssistantExchange],
  );

  const deleteMessage = useCallback(
    async (messageId) => {
      if (!activeChat || !messageId) return { ok: false };

      const targetMsg = (activeChat.messages || []).find((m) => m.id === messageId);
      if (!targetMsg) return { ok: false };

      const isAi = isAiAssistantChat(activeChat);
      const canCallApi =
        useApi &&
        activeChat._api &&
        targetMsg._api &&
        targetMsg.fromMe &&
        !targetMsg.type;

      if (canCallApi) {
        try {
          await messagingApi.deleteMessage(messageId);
        } catch {
          return { ok: false, error: "delete_failed" };
        }
      } else if (useApi && activeChat._api && targetMsg._api && !targetMsg.fromMe) {
        return { ok: false, error: "not_allowed" };
      }

      const applyRemoval = (list) =>
        list.map((chat) => {
          if (chat.id !== activeChat.id) return chat;
          const messages = (chat.messages || []).filter((m) => m.id !== messageId);
          const incoming = countIncomingMessages(messages);
          const lastRead = Math.min(Number(chat.lastReadIncomingCount) || 0, incoming);
          return { ...chat, messages, lastReadIncomingCount: lastRead };
        });

      const next = applyRemoval(chats);
      if (isAi) {
        persistAiChats(next);
      } else {
        persistChats(next);
      }
      return { ok: true };
    },
    [activeChat, chats, persistChats, persistAiChats, useApi],
  );

  const value = useMemo(
    () => ({
      useApi,
      isLoading,
      reloadFromApi,
      deleteMessage,
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
        persistChats(next);
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
        persistChats(next);
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
          persistChats(next);
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
        persistChats([newChat, ...chats]);
        return newChat;
      },
      sendMessage,
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

        persistChats(next);
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
        persistChats(next);
      },
      archiveChat(chatId) {
        const next = chats.map((chat) =>
          chat.id === chatId ? { ...chat, archived: true } : chat,
        );
        persistChats(next);
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
        persistChats(next);
      },
      deleteChat(chatId) {
        const target = chats.find((chat) => chat.id === chatId);
        const next = chats.filter((chat) => chat.id !== chatId);
        persistChats(next);
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
        persistChats(next);
        return next.find((chat) => chat.id === chatId)?.muted ?? false;
      },
      ensureAiAssistantWelcomeChat({ peerName, welcomeText }) {
        const { next, chatId } = buildAiAssistantWelcomeUpdate(chats, {
          peerName,
          welcomeText,
          markUnread: true,
        });
        persistChats(next);
        return chatId;
      },
      openAiAssistantChat({ peerName, welcomeText }) {
        const { next, chatId } = buildAiAssistantWelcomeUpdate(chats, { peerName, welcomeText });
        const readNext = markChatReadInList(next, chatId);
        persistChats(readNext);
        setActiveChatId(chatId);
        writeJson(ACTIVE_CHAT_KEY, chatId);
        const target = readNext.find((chat) => chat.id === chatId);
        if (target) notifyChatRead(target.id || target.peer);
        return chatId;
      },
    }),
    [activeChat, activeChatId, chats, isLoading, persistChats, reloadFromApi, sendMessage, deleteMessage, useApi],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatStore() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatStore must be used inside ChatProvider");
  return ctx;
}
