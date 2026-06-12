import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useBackendApi } from "../../shared/hooks/useBackendApi";
import { loadChatsFromApi } from "../messaging/loadChats";
import * as messagingApi from "../messaging/messagingApi";
import {
  applyPeerIdentity,
  isGenericChatPeer,
  mapChatDtoToUi,
  mapMessageDtoToUi,
  shouldShowChatInList,
} from "../messaging/mapMessaging";
import {
  connectMessagingHub,
  disconnectMessagingHub,
  joinMessagingChat,
  leaveMessagingChat,
  reconnectMessagingHub,
} from "../messaging/signalRService";
import {
  countIncomingMessages,
  countUnreadIncoming,
  notifyChatRead,
} from "../../shared/lib/messageRead";
import { withLoadState } from "../../shared/lib/asyncLoad";
import { readJson, writeJson } from "../../shared/lib/storage";
import { AI_ASSISTANT_PEER_ID } from "../../shared/constants/aiAssistant";
import { buildPostShareSnapshot } from "../../shared/lib/postShare";
import { isAiAssistantChat, resolveAiAssistantReply } from "./aiAssistantReplies";
import { fetchProfilesByUserIds } from "../profile/profileApi";

const CHATS_KEY = "spaChats";
const ACTIVE_CHAT_KEY = "spaActiveChatId";
const ChatContext = createContext(null);

function getCanonicalPeerId() {
  return typeof window !== "undefined" && typeof window.canonicalPeerId === "function"
    ? window.canonicalPeerId
    : (value) => String(value || "").trim().toLowerCase();
}

function isGuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

function sortMessages(messages) {
  return [...messages].sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    if (aTime !== bTime) return aTime - bTime;
    return String(a.id).localeCompare(String(b.id));
  });
}

function upsertMessage(messages, nextMessage) {
  const id = String(nextMessage.id);
  const index = messages.findIndex((message) => String(message.id) === id);
  if (index >= 0) {
    const copy = [...messages];
    copy[index] = { ...copy[index], ...nextMessage };
    return sortMessages(copy);
  }
  return sortMessages([...messages, nextMessage]);
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

function mergeApiWithMemoryChats(apiChats, memoryChats) {
  const canonical = getCanonicalPeerId();
  const aiId = canonical(AI_ASSISTANT_PEER_ID);
  const memoryById = new Map(memoryChats.map((chat) => [String(chat.id), chat]));

  const merged = apiChats.map((apiChat) => {
    const memory = memoryById.get(String(apiChat.id));
    if (!memory) return apiChat;

    const peerUserId = memory.peerUserId || apiChat.peerUserId;
    const peerName =
      memory.peer && !isGenericChatPeer(memory.peer)
        ? memory.peer
        : apiChat.peer && !isGenericChatPeer(apiChat.peer)
          ? apiChat.peer
          : memory.peer || apiChat.peer;

    return applyPeerIdentity(apiChat, {
      peerUserId,
      peerName,
      avatar: memory.avatar || apiChat.avatar,
      avatarSeed: memory.avatarSeed || apiChat.avatarSeed,
    });
  });

  const apiIds = new Set(merged.map((chat) => String(chat.id)));
  const aiChat = memoryChats.find((chat) => {
    const peer = canonical(chat.peer);
    const id = canonical(chat.id);
    return peer === aiId || id === aiId;
  });
  const withAi =
    aiChat && !apiIds.has(String(aiChat.id)) ? [...merged, aiChat] : merged;

  return withAi.filter(shouldShowChatInList);
}

function findChatByPeer(chats, { peer, peerId }) {
  const canonicalPeerId = getCanonicalPeerId();
  const targetId = canonicalPeerId(peerId || peer);
  return chats.find((chat) => {
    const chatPeer = canonicalPeerId(chat.peer);
    const chatId = canonicalPeerId(chat.id);
    const chatUserId = chat.peerUserId ? canonicalPeerId(chat.peerUserId) : "";
    return (
      chatPeer === targetId ||
      chatId === targetId ||
      (peerId && chatUserId === canonicalPeerId(peerId))
    );
  });
}

export function ChatProvider({ children }) {
  const { session } = useAuth();
  const useApi = useBackendApi();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [hubOnline, setHubOnline] = useState(false);
  const chatsRef = useRef(chats);
  const activeChatIdRef = useRef(activeChatId);
  const sessionUserIdRef = useRef(session.user?.id);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    sessionUserIdRef.current = session.user?.id;
  }, [session.user?.id]);

  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0] || null;

  const persistChats = useCallback(
    (nextOrUpdater) => {
      setChats((prev) => {
        const next = typeof nextOrUpdater === "function" ? nextOrUpdater(prev) : nextOrUpdater;
        if (!useApi) writeJson(CHATS_KEY, next);
        return next;
      });
    },
    [useApi],
  );

  const persistActiveChatId = useCallback(
    (chatId) => {
      if (!useApi) writeJson(ACTIVE_CHAT_KEY, chatId);
    },
    [useApi],
  );

  useEffect(() => {
    if (useApi) {
      try {
        localStorage.removeItem(CHATS_KEY);
        localStorage.removeItem(ACTIVE_CHAT_KEY);
      } catch {
        // ignore storage errors
      }
      return;
    }
    const saved = readJson(CHATS_KEY, []);
    if (saved.length) setChats(saved);
    const savedActive = readJson(ACTIVE_CHAT_KEY, saved[0]?.id || null);
    if (savedActive) setActiveChatId(savedActive);
  }, [useApi]);

  const reloadFromApi = useCallback(async () => {
    if (!useApi || !session.user?.id) return;
    await withLoadState({ setIsLoading, setLoadError }, async () => {
      const apiChats = await loadChatsFromApi(session.user.id);
      setChats((prev) => {
        const merged = mergeApiWithMemoryChats(apiChats, prev);
        if (!merged.some((c) => c.id === activeChatIdRef.current)) {
          const nextId = merged[0]?.id || null;
          setActiveChatId(nextId);
          persistActiveChatId(nextId);
        }
        return merged;
      });
    }, "Failed to load chats.");
  }, [useApi, session.user?.id, persistActiveChatId]);

  useEffect(() => {
    if (useApi) reloadFromApi();
  }, [useApi, session.user?.id, reloadFromApi]);

  const reloadFromApiRef = useRef(reloadFromApi);
  useEffect(() => {
    reloadFromApiRef.current = reloadFromApi;
  }, [reloadFromApi]);

  const applyIncomingMessage = useCallback(
    (dto) => {
      const userId = sessionUserIdRef.current;
      if (!userId || !dto?.id) return;
      const chatId = String(dto.chatId || dto.ChatId || "");
      if (!chatId) return;

      const uiMsg = mapMessageDtoToUi(dto, userId);
      const senderId = !uiMsg.fromMe ? String(uiMsg.senderId || "").trim() : "";

      persistChats((prev) => {
        const index = prev.findIndex((chat) => String(chat.id) === chatId);
        if (index < 0) {
          reloadFromApiRef.current?.();
          return prev;
        }

        const chat = prev[index];
        const messages = upsertMessage(chat.messages || [], uiMsg);
        let updated = { ...chat, messages };
        if (senderId && (!chat.peerUserId || isGenericChatPeer(chat.peer))) {
          updated = applyPeerIdentity(updated, { peerUserId: senderId });
        }
        const rest = prev.filter((_, idx) => idx !== index);
        return [updated, ...rest];
      });

      if (senderId) {
        fetchProfilesByUserIds([senderId])
          .then((profiles) => {
            const profile = profiles[senderId];
            if (!profile) return;
            persistChats((prev) =>
              prev.map((chat) => {
                if (String(chat.id) !== chatId) return chat;
                if (chat.peerUserId && chat.peerUserId !== senderId) return chat;
                return applyPeerIdentity(chat, { peerUserId: senderId, profile });
              }),
            );
          })
          .catch(() => {});
      }
    },
    [persistChats],
  );

  const applyUpdatedMessage = useCallback(
    (dto) => {
      applyIncomingMessage(dto);
    },
    [applyIncomingMessage],
  );

  const applyDeletedMessage = useCallback(
    (payload) => {
      const chatId = String(payload?.chatId || payload?.ChatId || "");
      const messageId = String(payload?.messageId || payload?.MessageId || "");
      if (!chatId || !messageId) return;

      persistChats((prev) =>
        prev.map((chat) => {
          if (String(chat.id) !== chatId) return chat;
          const messages = (chat.messages || []).filter((message) => String(message.id) !== messageId);
          const incoming = countIncomingMessages(messages);
          const lastRead = Math.min(Number(chat.lastReadIncomingCount) || 0, incoming);
          return { ...chat, messages, lastReadIncomingCount: lastRead };
        }),
      );
    },
    [persistChats],
  );

  const applyMessageRead = useCallback(
    (payload) => {
      const chatId = String(payload?.chatId || payload?.ChatId || "");
      const messageId = String(payload?.messageId || payload?.MessageId || "");
      if (!chatId || !messageId) return;

      persistChats((prev) =>
        prev.map((chat) => {
          if (String(chat.id) !== chatId) return chat;
          const messages = (chat.messages || []).map((message) =>
            String(message.id) === messageId ? { ...message, readAt: payload.readAt || payload.ReadAt } : message,
          );
          return { ...chat, messages };
        }),
      );
    },
    [persistChats],
  );

  const applyMessageMediaAttached = useCallback(
    (payload) => {
      const userId = sessionUserIdRef.current;
      if (!userId) return;
      const chatId = String(payload?.chatId || payload?.ChatId || "");
      const messageId = String(payload?.messageId || payload?.MessageId || "");
      const mediaDto = payload?.media || payload?.Media;
      if (!chatId || !messageId || !mediaDto) return;

      const mediaItem = {
        id: String(mediaDto.id),
        url: messagingApi.resolveMediaUrl(mediaDto.mediaUrl || mediaDto.MediaUrl),
        type: String(mediaDto.mediaType || mediaDto.MediaType || "file"),
      };

      persistChats((prev) =>
        prev.map((chat) => {
          if (String(chat.id) !== chatId) return chat;
          const messages = (chat.messages || []).map((message) => {
            if (String(message.id) !== messageId) return message;
            const existing = Array.isArray(message.media) ? message.media : [];
            const hasMedia = existing.some((item) => String(item.id) === mediaItem.id);
            return {
              ...message,
              media: hasMedia ? existing : [...existing, mediaItem],
            };
          });
          return { ...chat, messages };
        }),
      );
    },
    [persistChats],
  );

  useEffect(() => {
    if (!useApi || !session.user?.id) {
      disconnectMessagingHub();
      setHubOnline(false);
      return undefined;
    }

    let cancelled = false;

    connectMessagingHub({
      onConnected: () => {
        if (!cancelled) setHubOnline(true);
      },
      onDisconnected: () => {
        if (!cancelled) setHubOnline(false);
      },
      onReconnected: () => {
        if (!cancelled) setHubOnline(true);
      },
      onMessageCreated: applyIncomingMessage,
      onMessageUpdated: applyUpdatedMessage,
      onMessageDeleted: applyDeletedMessage,
      onMessageRead: applyMessageRead,
      onMessageMediaAttached: applyMessageMediaAttached,
    }).catch(() => {
      if (!cancelled) setHubOnline(false);
    });

    return () => {
      cancelled = true;
      disconnectMessagingHub();
      setHubOnline(false);
    };
  }, [
    useApi,
    session.user?.id,
    applyIncomingMessage,
    applyUpdatedMessage,
    applyDeletedMessage,
    applyMessageRead,
    applyMessageMediaAttached,
  ]);

  useEffect(() => {
    if (!useApi || !activeChatId || !activeChat?._api || isAiAssistantChat(activeChat)) return undefined;

    joinMessagingChat(activeChatId);
    return () => {
      leaveMessagingChat(activeChatId);
    };
  }, [useApi, activeChatId, activeChat]);

  const markIncomingMessagesRead = useCallback(
    async (chatId) => {
      const target = chatsRef.current.find((chat) => chat.id === chatId);
      if (!target) return;

      const incoming = countIncomingMessages(target.messages);
      if (Number(target.lastReadIncomingCount) === incoming) return;

      const next = chatsRef.current.map((chat) =>
        chat.id === chatId ? { ...chat, lastReadIncomingCount: incoming } : chat,
      );
      persistChats(next);
      notifyChatRead(target.id || target.peer);

      if (!useApi || !target._api) return;

      const unreadIncoming = (target.messages || []).filter((message) => !message.fromMe && message._api);
      await Promise.all(
        unreadIncoming.map(async (message) => {
          try {
            await messagingApi.markMessageRead(message.id);
          } catch {
            // local unread state already updated
          }
        }),
      );
    },
    [persistChats, useApi],
  );

  const ensureApiChatForPeer = useCallback(
    async ({ peer, peerId, avatar, avatarSeed }) => {
      const existing = findChatByPeer(chatsRef.current, { peer, peerId });
      if (existing) return existing;

      const created = await messagingApi.createChat();
      const chatDto = created?.chat || created;
      if (!chatDto?.id) throw new Error("Could not create chat.");

      let profileByUserId = {};
      const peerUserId = String(peerId || "").trim();
      if (peerUserId) {
        profileByUserId = await fetchProfilesByUserIds([peerUserId]);
      }

      const uiChat = applyPeerIdentity(mapChatDtoToUi(chatDto, session.user?.id, profileByUserId), {
        peerUserId,
        profile: profileByUserId[peerUserId],
        peerName: String(peer || "").trim(),
        avatar,
        avatarSeed,
      });

      persistChats((prev) =>
        [uiChat, ...prev.filter((chat) => chat.id !== uiChat.id)].filter(shouldShowChatInList),
      );
      return uiChat;
    },
    [persistChats, session.user?.id],
  );

  const joinChatById = useCallback(
    async (chatId) => {
      if (!useApi || !isGuid(chatId)) return null;
      try {
        await messagingApi.joinChat(chatId);
        await reloadFromApi();
        setActiveChatId(String(chatId));
        persistActiveChatId(String(chatId));
        await joinMessagingChat(String(chatId));
        return chatsRef.current.find((chat) => String(chat.id) === String(chatId)) || null;
      } catch {
        return null;
      }
    },
    [useApi, reloadFromApi, persistActiveChatId],
  );

  const appendAiAssistantExchange = useCallback(
    (chatId, userText, lang, onAiAction) => {
      const userMsg = { id: crypto.randomUUID(), fromMe: true, text: userText };
      persistChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, messages: [...chat.messages, userMsg] } : chat,
        ),
      );

      window.setTimeout(() => {
        const { text: replyText, action } = resolveAiAssistantReply(userText, lang);
        const assistantMsg = { id: crypto.randomUUID(), fromMe: false, text: replyText };
        persistChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId ? { ...chat, messages: [...chat.messages, assistantMsg] } : chat,
          ),
        );

        if (action && typeof onAiAction === "function") {
          window.setTimeout(() => onAiAction(action), 500);
        }
      }, 650);
    },
    [persistChats],
  );

  const sendMessage = useCallback(
    async (text, options = {}) => {
      if (!activeChat || (!text.trim() && !options.file)) return;
      const trimmed = text.trim();

      if (isAiAssistantChat(activeChat)) {
        if (!trimmed) return;
        appendAiAssistantExchange(activeChat.id, trimmed, options.lang, options.onAiAction);
        return;
      }

      if (useApi && activeChat._api) {
        try {
          let chatId = activeChat.id;
          if (!isGuid(chatId)) {
            const ensured = await ensureApiChatForPeer({
              peer: activeChat.peer,
              peerId: activeChat.peerUserId,
              avatar: activeChat.avatar,
              avatarSeed: activeChat.avatarSeed,
            });
            chatId = ensured.id;
            setActiveChatId(chatId);
            persistActiveChatId(chatId);
          }

          const content = trimmed || (options.file ? "📎" : "");
          if (!content) return;

          const raw = await messagingApi.sendChatMessage(chatId, content);
          const dto = raw?.message || raw;

          if (options.file && dto?.id) {
            await messagingApi.uploadMessageMedia(dto.id, options.file);
          }
        } catch {
          // REST errors are surfaced by apiClient; avoid local-only fallback in API mode
        }
        return;
      }

      if (!trimmed) return;
      const next = chats.map((chat) => {
        if (chat.id !== activeChat.id) return chat;
        return {
          ...chat,
          messages: [...chat.messages, { id: crypto.randomUUID(), fromMe: true, text: trimmed }],
        };
      });
      persistChats(next);
    },
    [
      activeChat,
      chats,
      persistChats,
      persistActiveChatId,
      useApi,
      appendAiAssistantExchange,
      ensureApiChatForPeer,
    ],
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

      persistChats(applyRemoval(chats));
      return { ok: true };
    },
    [activeChat, chats, persistChats, useApi],
  );

  const reconnectHub = useCallback(async () => {
    if (!useApi || !session.user?.id) return;
    try {
      await reconnectMessagingHub();
      setHubOnline(true);
      if (activeChatIdRef.current && activeChat?._api) {
        await joinMessagingChat(activeChatIdRef.current);
      }
    } catch {
      setHubOnline(false);
    }
  }, [useApi, session.user?.id, activeChat?._api]);

  const value = useMemo(
    () => ({
      useApi,
      hubOnline,
      isLoading,
      loadError,
      reloadFromApi,
      reconnectHub,
      joinChatById,
      deleteMessage,
      chats,
      activeChat,
      totalUnreadCount: chats.reduce((total, chat) => total + countUnreadIncoming(chat), 0),
      setActiveChat(chatId) {
        if (!chatId) return;
        setActiveChatId(chatId);
        persistActiveChatId(chatId);
        markIncomingMessagesRead(chatId);
      },
      markChatAsRead(chatId) {
        markIncomingMessagesRead(chatId);
      },
      markChatAsReadByPeer(peer) {
        const canonicalPeerId = getCanonicalPeerId();
        const slug = canonicalPeerId(peer);
        const target = chats.find((chat) => {
          const chatPeer = canonicalPeerId(chat.peer);
          const chatId = canonicalPeerId(chat.id);
          return chatPeer === slug || chatId === slug;
        });
        if (target) {
          markIncomingMessagesRead(target.id);
        } else {
          notifyChatRead(peer);
        }
      },
      ensureChat({ peer, peerId, avatar, avatarSeed }) {
        const displayPeer = String(peer || "").trim();
        if (!displayPeer) return null;

        const existing = findChatByPeer(chats, { peer, peerId });
        if (existing) return existing;

        if (useApi && !isAiAssistantChat({ id: peerId || displayPeer, peer: displayPeer })) {
          ensureApiChatForPeer({ peer: displayPeer, peerId, avatar, avatarSeed }).catch(() => {});
          return null;
        }

        const targetId = getCanonicalPeerId()(peerId || displayPeer);
        const newChat = {
          id: targetId || crypto.randomUUID(),
          peer: displayPeer,
          peerUserId: peerId || null,
          avatar: avatar || "",
          avatarSeed: avatarSeed || "",
          online: true,
          messages: [],
          lastReadIncomingCount: 0,
        };
        persistChats([newChat, ...chats]);
        return newChat;
      },
      ensureApiChatForPeer,
      sendMessage,
      sharePostToContact({ peer, peerId, post }) {
        const displayPeer = String(peer || "").trim();
        if (!displayPeer || !post) return null;

        if (useApi) return null;

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
          persistActiveChatId(nextId);
        }
      },
      clearChatMessages(chatId) {
        if (useApi) return;
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
          persistActiveChatId(nextId);
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
        persistActiveChatId(chatId);
        const target = readNext.find((chat) => chat.id === chatId);
        if (target) notifyChatRead(target.id || target.peer);
        return chatId;
      },
    }),
    [
      activeChat,
      activeChatId,
      chats,
      hubOnline,
      isLoading,
      loadError,
      persistChats,
      persistActiveChatId,
      reloadFromApi,
      reconnectHub,
      joinChatById,
      sendMessage,
      deleteMessage,
      useApi,
      ensureApiChatForPeer,
      markIncomingMessagesRead,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatStore() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatStore must be used inside ChatProvider");
  return ctx;
}
