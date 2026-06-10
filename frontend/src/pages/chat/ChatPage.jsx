import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useChatStore } from "../../features/chat/ChatStore";
import { countUnreadIncoming } from "../../shared/lib/messageRead";
import { getCallMessageText, getMessagePreview, isCallMessage } from "../../shared/lib/callMessage";
import { isPostShareMessage } from "../../shared/lib/postShare";
import { getContactAvatarUrl, getContactProfile } from "../../shared/constants/contactProfiles";
import { AI_ASSISTANT_PEER_ID } from "../../shared/constants/aiAssistant";
import { getAiCommandChips, getAiQuickPrompts, isAiAssistantChat } from "../../features/chat/aiAssistantReplies";
import { useUiSettings } from "../../app/providers/AppProviders";

export function ChatPage() {
  const {
    chats,
    activeChat,
    setActiveChat,
    sendMessage,
    archiveChat,
    clearChatMessages,
    deleteChat,
    toggleChatMute,
    markChatAsRead,
    addCallMessage,
    deleteMessage: removeMessage,
    useApi,
  } = useChatStore();
  const { t, lang } = useUiSettings();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [text, setText] = useState("");
  const [tab, setTab] = useState("chats");
  const [search, setSearch] = useState("");
  const [threadSearchOpen, setThreadSearchOpen] = useState(false);
  const [threadSearch, setThreadSearch] = useState("");
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [threadNotice, setThreadNotice] = useState("");
  const [callOverlay, setCallOverlay] = useState(null);
  const moreMenuRef = useRef(null);
  const profileRef = useRef(null);
  const threadScrollRef = useRef(null);
  const messagesEndRef = useRef(null);

  const filteredChats = chats.filter((chat) => {
    const isArchived = Boolean(chat.archived);
    if (tab === "archive" ? !isArchived : isArchived) return false;
    const query = search.trim().toLowerCase();
    if (!query) return true;
    const lastMessage = chat.messages?.[chat.messages.length - 1] || null;
    const last = getMessagePreview(lastMessage, t);
    return (
      String(chat.peer || "")
        .toLowerCase()
        .includes(query) || String(last).toLowerCase().includes(query)
    );
  });

  const activeIsAiAssistant = useMemo(() => isAiAssistantChat(activeChat), [activeChat]);

  const aiCommandChips = useMemo(() => (activeIsAiAssistant ? getAiCommandChips() : []), [activeIsAiAssistant]);

  const aiQuickPrompts = useMemo(
    () => (activeIsAiAssistant ? getAiQuickPrompts(lang) : []),
    [activeIsAiAssistant, lang],
  );

  const handleAiAction = useCallback(
    (action) => {
      if (action?.type === "navigate" && action.path) {
        navigate(action.path);
      }
    },
    [navigate],
  );

  const sendToAssistant = useCallback(
    (messageText) => {
      sendMessage(messageText, { lang, onAiAction: handleAiAction });
    },
    [sendMessage, lang, handleAiAction],
  );

  const canDeleteMessage = useCallback(
    (message) => {
      if (!activeChat || !message?.id) return false;
      if (isAiAssistantChat(activeChat)) return true;
      if (!useApi || !activeChat._api) return true;
      if (isCallMessage(message)) return true;
      return Boolean(message.fromMe);
    },
    [activeChat, useApi],
  );

  const handleDeleteMessage = useCallback(
    async (message) => {
      const result = await removeMessage(message.id);
      if (!result?.ok) {
        if (result?.error === "not_allowed") {
          showNotice(t("chat.delete.notAllowed", "You can only delete your own messages."));
        } else {
          showNotice(t("chat.delete.failed", "Could not delete the message."));
        }
        return;
      }
      showNotice(t("chat.delete.done", "Message deleted"));
    },
    [removeMessage, t],
  );

  function renderDeleteButton(message) {
    if (!canDeleteMessage(message)) return null;
    return (
      <button
        type="button"
        className="chat-msg__delete"
        aria-label={t("chat.deleteMessage", "Delete message")}
        title={t("chat.deleteMessage", "Delete message")}
        onClick={() => handleDeleteMessage(message)}
      >
        ×
      </button>
    );
  }

  const activeProfile = useMemo(
    () =>
      getContactProfile(activeChat?.peer || activeChat?.id, {
        name: activeIsAiAssistant ? t("notify.aiAssistantName", "AI Assistant") : activeChat?.peer,
      }),
    [activeChat?.id, activeChat?.peer, activeIsAiAssistant, t],
  );
  const activeAvatar = useMemo(
    () => getContactAvatarUrl(activeProfile, activeChat?.peer || "user"),
    [activeProfile, activeChat?.peer],
  );
  const callProfile = useMemo(
    () => getContactProfile(callOverlay?.peer, { name: callOverlay?.peer }),
    [callOverlay?.peer],
  );

  const threadQuery = threadSearch.trim().toLowerCase();

  const threadScrollKey = useMemo(() => {
    const msgs = activeChat?.messages || [];
    const last = msgs[msgs.length - 1];
    return `${activeChat?.id ?? ""}:${msgs.length}:${last?.id ?? ""}`;
  }, [activeChat?.id, activeChat?.messages]);

  const scrollThreadToBottom = useCallback((smooth = true) => {
    const run = () => {
      const end = messagesEndRef.current;
      if (end) {
        end.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
        return;
      }
      const el = threadScrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    };
    run();
    window.requestAnimationFrame(run);
  }, []);

  const visibleMessages = (activeChat?.messages || []).filter((message) => {
    if (!threadQuery) return true;
    const haystack = isCallMessage(message)
      ? getCallMessageText(message, t).toLowerCase()
      : isPostShareMessage(message)
        ? getMessagePreview(message, t).toLowerCase()
        : String(message.text || "").toLowerCase();
    return haystack.includes(threadQuery);
  });

  function showNotice(message) {
    setThreadNotice(message);
    window.setTimeout(() => setThreadNotice(""), 2400);
  }

  function handleCall() {
    if (!activeChat) {
      showNotice(t("chat.selectChat", "Select chat"));
      return;
    }
    setCallOverlay({
      peer: activeChat.peer,
      status: "calling",
      exiting: false,
      muted: false,
      speaker: false,
    });
  }

  function endCall() {
    if (!callOverlay || callOverlay.exiting) return;

    const chatId = activeChat?.id;
    const callStatus = callOverlay.status === "no-answer" ? "missed" : "cancelled";

    setCallOverlay((prev) => (prev ? { ...prev, exiting: true } : null));
    window.setTimeout(() => {
      setCallOverlay(null);
      if (chatId) addCallMessage(chatId, callStatus);
    }, 320);
  }

  function toggleCallMute() {
    setCallOverlay((prev) => (prev ? { ...prev, muted: !prev.muted } : prev));
  }

  function toggleCallSpeaker() {
    setCallOverlay((prev) => (prev ? { ...prev, speaker: !prev.speaker } : prev));
  }

  function handleToggleThreadSearch() {
    setThreadSearchOpen((open) => {
      if (open) setThreadSearch("");
      return !open;
    });
    setMoreMenuOpen(false);
  }

  function handleViewProfile() {
    setMoreMenuOpen(false);
    profileRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function handleToggleMute() {
    if (!activeChat) return;
    const muted = toggleChatMute(activeChat.id);
    setMoreMenuOpen(false);
    showNotice(muted ? t("chat.muted", "Notifications muted") : t("chat.unmuted", "Notifications unmuted"));
  }

  function handleArchiveChat() {
    if (!activeChat) return;
    archiveChat(activeChat.id);
    setMoreMenuOpen(false);
    setThreadSearchOpen(false);
    setThreadSearch("");
    showNotice(t("chat.archived", "Chat moved to archive"));
  }

  function handleClearHistory() {
    if (!activeChat) return;
    clearChatMessages(activeChat.id);
    setMoreMenuOpen(false);
    showNotice(t("chat.cleared", "Chat history cleared"));
  }

  function handleDeleteChat() {
    if (!activeChat) return;
    deleteChat(activeChat.id);
    setMoreMenuOpen(false);
    setThreadSearchOpen(false);
    setThreadSearch("");
    showNotice(t("chat.deleted", "Chat deleted"));
  }

  useEffect(() => {
    if (!moreMenuOpen) return undefined;

    function onPointerDown(event) {
      if (!moreMenuRef.current?.contains(event.target)) {
        setMoreMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [moreMenuOpen]);

  useEffect(() => {
    if (activeChat?.id) markChatAsRead(activeChat.id);
  }, [activeChat?.id, markChatAsRead]);

  useEffect(() => {
    const withPeer = searchParams.get("with");
    if (!withPeer) return;

    const canonicalPeerId =
      typeof window.canonicalPeerId === "function"
        ? window.canonicalPeerId
        : (value) => String(value || "").trim().toLowerCase();
    const slug = canonicalPeerId(withPeer);
    const target = chats.find((chat) => {
      const chatPeer = canonicalPeerId(chat.peer);
      const chatId = canonicalPeerId(chat.id);
      return chatPeer === slug || chatId === slug;
    });
    if (target) setActiveChat(target.id);
  }, [searchParams, chats, setActiveChat]);

  useEffect(() => {
    setThreadSearchOpen(false);
    setThreadSearch("");
    setMoreMenuOpen(false);
    setCallOverlay(null);
  }, [activeChat?.id]);

  useEffect(() => {
    if (threadQuery) return;
    scrollThreadToBottom(false);
  }, [activeChat?.id, threadQuery, scrollThreadToBottom]);

  useEffect(() => {
    if (threadQuery) return;
    scrollThreadToBottom(true);
    const afterPaint = window.setTimeout(() => scrollThreadToBottom(false), 80);
    const afterAiReply = window.setTimeout(() => scrollThreadToBottom(false), 750);
    return () => {
      window.clearTimeout(afterPaint);
      window.clearTimeout(afterAiReply);
    };
  }, [threadScrollKey, threadQuery, scrollThreadToBottom]);

  useEffect(() => {
    if (!callOverlay || callOverlay.exiting) return undefined;
    document.body.style.overflow = "hidden";

    function onKeyDown(event) {
      if (event.key === "Escape") endCall();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [callOverlay]);

  useEffect(() => {
    if (!callOverlay || callOverlay.status !== "calling" || callOverlay.exiting) return undefined;
    const timer = window.setTimeout(() => {
      setCallOverlay((prev) =>
        prev && prev.status === "calling" && !prev.exiting ? { ...prev, status: "no-answer" } : prev,
      );
    }, 9000);
    return () => window.clearTimeout(timer);
  }, [callOverlay?.status, callOverlay?.exiting]);

  return (
    <section className="page chat-page-legacy">
      <div className="chat-layout">
        <aside className="chat-col chat-col--list">
          <div className="chat-list__tabs" role="tablist">
            <button
              type="button"
              className={tab === "chats" ? "chat-list__tab chat-list__tab--active" : "chat-list__tab"}
              onClick={() => setTab("chats")}
            >
              {t("chat.tabs.chats", "Chats")}
            </button>
            <button
              type="button"
              className={tab === "archive" ? "chat-list__tab chat-list__tab--active" : "chat-list__tab"}
              onClick={() => setTab("archive")}
            >
              {t("chat.tabs.archive", "Archive")}
            </button>
          </div>
          <input
            className="chat-list__search"
            type="search"
            placeholder={t("chat.search", "Search")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="chat-list__scroll">
            {filteredChats.length === 0 ? (
              <p className="chat-list__empty">{t("chat.emptyList", "No chats found.")}</p>
            ) : (
              filteredChats.map((chat) => {
                const active = chat.id === activeChat?.id;
                const canonicalPeerId =
                  typeof window.canonicalPeerId === "function"
                    ? window.canonicalPeerId
                    : (value) => String(value || "").trim().toLowerCase();
                const isAiAssistant =
                  canonicalPeerId(chat.id || chat.peer) === canonicalPeerId(AI_ASSISTANT_PEER_ID);
                const chatProfile = getContactProfile(chat.peer || chat.id, { name: chat.peer });
                const chatAvatar = getContactAvatarUrl(chatProfile, chat.peer);
                const messages = Array.isArray(chat.messages) ? chat.messages : [];
                const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
                const last = lastMessage
                  ? getMessagePreview(lastMessage, t)
                  : t("chat.noMessages", "No messages yet");
                const unreadCount = countUnreadIncoming(chat);
                return (
                  <div
                    className={
                      active
                        ? "chat-list__row chat-list__row--active"
                        : [
                            "chat-list__row",
                            isAiAssistant ? "chat-list__row--ai" : "",
                            unreadCount > 0 ? "chat-list__row--unread" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")
                    }
                    key={chat.id}
                  >
                    <button
                      type="button"
                      className={active ? "chat-list__item chat-list__item--active" : "chat-list__item"}
                      onClick={() => setActiveChat(chat.id)}
                    >
                      <img
                        src={chatAvatar}
                        width="44"
                        height="44"
                        alt=""
                      />
                      <span className="chat-list__item-body">
                        <span className="chat-list__item-name">
                          <span className="chat-list__item-name-text">
                            {isAiAssistant ? t("notify.aiAssistantName", "AI Assistant") : chat.peer}
                          </span>
                          {!active && unreadCount > 0 ? (
                            <span className="chat-list__badge">{unreadCount}</span>
                          ) : null}
                        </span>
                        <span className="chat-list__item-preview">{last}</span>
                      </span>
                      <span className="chat-list__item-time">{active ? "2 min" : "45 min"}</span>
                    </button>
                    <button
                      type="button"
                      className="chat-list__row-toggle"
                      title={t("chat.more.archive", "Archive chat")}
                      onClick={() => {
                        archiveChat(chat.id);
                        showNotice(t("chat.archived", "Chat moved to archive"));
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z" />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <section className="chat-col">
          <div className="chat-thread__head">
            <div className="chat-thread__person">
              <img
                src={activeAvatar}
                width="44"
                height="44"
                alt=""
              />
              <div>
                <h1 className="chat-thread__name">
                  {activeChat
                    ? activeIsAiAssistant
                      ? t("notify.aiAssistantName", "AI Assistant")
                      : activeChat.peer
                    : t("chat.selectChat", "Select chat")}
                </h1>
                <div className="chat-thread__status">
                  <span className="chat-thread__status-dot" aria-hidden="true" />
                  <span>
                    {activeChat?.muted
                      ? t("chat.mutedShort", "Muted")
                      : activeChat?.online
                        ? t("chat.online", "Online")
                        : t("chat.lastSeen", "Last seen recently")}
                  </span>
                </div>
              </div>
            </div>
            <div className="chat-thread__actions-wrap" ref={moreMenuRef}>
              <div className="chat-thread__actions">
                <button
                  type="button"
                  className="chat-thread__icon-btn"
                  aria-label={t("chat.call", "Call")}
                  title={t("chat.call", "Call")}
                  onClick={handleCall}
                  disabled={!activeChat}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={threadSearchOpen ? "chat-thread__icon-btn chat-thread__icon-btn--active" : "chat-thread__icon-btn"}
                  aria-label={t("chat.searchInChat", "Search in chat")}
                  aria-pressed={threadSearchOpen ? "true" : "false"}
                  title={t("chat.searchInChat", "Search in chat")}
                  onClick={handleToggleThreadSearch}
                  disabled={!activeChat}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-4-4" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={moreMenuOpen ? "chat-thread__icon-btn chat-thread__icon-btn--active" : "chat-thread__icon-btn"}
                  aria-label={t("chat.more", "More")}
                  aria-expanded={moreMenuOpen ? "true" : "false"}
                  title={t("chat.more", "More")}
                  onClick={() => setMoreMenuOpen((open) => !open)}
                  disabled={!activeChat}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
              </div>
              {moreMenuOpen && activeChat ? (
                <div className="chat-thread__more-dropdown" role="menu">
                  <button type="button" className="chat-thread__more-item" role="menuitem" onClick={handleViewProfile}>
                    {t("chat.more.viewProfile", "View profile")}
                  </button>
                  <button type="button" className="chat-thread__more-item" role="menuitem" onClick={handleToggleMute}>
                    {activeChat.muted
                      ? t("chat.more.unmute", "Unmute notifications")
                      : t("chat.more.mute", "Mute notifications")}
                  </button>
                  {!activeChat.archived ? (
                    <button type="button" className="chat-thread__more-item" role="menuitem" onClick={handleArchiveChat}>
                      {t("chat.more.archive", "Archive chat")}
                    </button>
                  ) : null}
                  <button type="button" className="chat-thread__more-item" role="menuitem" onClick={handleClearHistory}>
                    {t("chat.more.clearHistory", "Clear chat history")}
                  </button>
                  <button
                    type="button"
                    className="chat-thread__more-item chat-thread__more-item--danger"
                    role="menuitem"
                    onClick={handleDeleteChat}
                  >
                    {t("chat.more.delete", "Delete chat")}
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {threadNotice ? <div className="chat-thread__notice">{threadNotice}</div> : null}

          {threadSearchOpen ? (
            <div className="chat-thread__search-wrap">
              <input
                className="chat-thread__search"
                type="search"
                value={threadSearch}
                onChange={(event) => setThreadSearch(event.target.value)}
                placeholder={t("chat.searchInChatPlaceholder", "Search messages in this chat...")}
                aria-label={t("chat.searchInChatPlaceholder", "Search messages in this chat...")}
                autoFocus
              />
            </div>
          ) : null}

          <div className="chat-thread__scroll" ref={threadScrollRef}>
            {visibleMessages.length === 0 ? (
              <p className="chat-list__empty">
                {threadQuery
                  ? t("chat.searchNoResults", "No messages match your search.")
                  : t("chat.noMessages", "No messages yet")}
              </p>
            ) : (
              visibleMessages.map((message) =>
                isCallMessage(message) ? (
                  <div key={message.id} className="chat-msg chat-msg--call">
                    <div className="chat-msg__call-wrap">
                      <div className="chat-msg__call">
                        <span
                          className={
                            message.callStatus === "missed"
                              ? "chat-msg__call-icon chat-msg__call-icon--missed"
                              : "chat-msg__call-icon"
                          }
                          aria-hidden="true"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                          </svg>
                        </span>
                        <span className="chat-msg__call-text">{getCallMessageText(message, t)}</span>
                      </div>
                      {renderDeleteButton(message)}
                    </div>
                  </div>
                ) : isPostShareMessage(message) ? (
                  <div
                    key={message.id}
                    className={message.fromMe ? "chat-msg chat-msg--out chat-msg--post" : "chat-msg chat-msg--in chat-msg--post"}
                  >
                    {!message.fromMe && (
                      <img className="chat-msg__avatar" src={activeAvatar} width="32" height="32" alt="" />
                    )}
                    <div className="chat-msg__content">
                      <div className="chat-msg__row">
                        <div className="chat-msg__post-card">
                        <div className="chat-msg__post-label">{t("home.post.sharedPost", "Shared post")}</div>
                        <div className="chat-msg__post-author">{message.post.author}</div>
                        {message.post.role ? (
                          <div className="chat-msg__post-role">{message.post.role}</div>
                        ) : null}
                        {message.post.text ? (
                          <p className="chat-msg__post-text">{message.post.text}</p>
                        ) : null}
                        {message.post.video ? (
                          <video
                            className="chat-msg__post-media"
                            src={message.post.video}
                            controls
                            playsInline
                          />
                        ) : null}
                        {!message.post.video && message.post.image ? (
                          <img
                            className="chat-msg__post-media chat-msg__post-media--photo"
                            src={message.post.image}
                            alt={t("home.postMedia", "Post media")}
                            loading="lazy"
                          />
                        ) : null}
                        </div>
                        {renderDeleteButton(message)}
                      </div>
                      <div className="chat-msg__time">{message.fromMe ? "now" : "2 min ago"}</div>
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className={message.fromMe ? "chat-msg chat-msg--out" : "chat-msg chat-msg--in"}>
                    {!message.fromMe && (
                      <img
                        className="chat-msg__avatar"
                        src={activeAvatar}
                        width="32"
                        height="32"
                        alt=""
                      />
                    )}
                    <div className="chat-msg__content">
                      <div className="chat-msg__row">
                        <div className="chat-msg__bubble chat-msg__bubble--pre">{message.text}</div>
                        {renderDeleteButton(message)}
                      </div>
                      <div className="chat-msg__time">{message.fromMe ? "now" : "2 min ago"}</div>
                    </div>
                  </div>
                ),
              )
            )}
            <div ref={messagesEndRef} className="chat-thread__scroll-anchor" aria-hidden="true" />
          </div>

          {activeIsAiAssistant ? (
            <div className="chat-ai-quick">
              {aiCommandChips.length > 0 ? (
                <div className="chat-ai-quick__group" role="group" aria-label={t("chat.ai.commandsLabel", "Commands")}>
                  <p className="chat-ai-quick__title">{t("chat.ai.commandsTitle", "Commands")}</p>
                  <div className="chat-ai-quick__chips">
                    {aiCommandChips.map((cmd) => (
                      <button
                        key={cmd.id}
                        type="button"
                        className="chat-ai-quick__chip chat-ai-quick__chip--cmd"
                        onClick={() => sendToAssistant(cmd.text)}
                      >
                        {cmd.text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {aiQuickPrompts.length > 0 ? (
                <div className="chat-ai-quick__group" role="group" aria-label={t("chat.ai.quickLabel", "Suggested questions")}>
                  <p className="chat-ai-quick__title">{t("chat.ai.quickTitle", "Suggested questions")}</p>
                  <div className="chat-ai-quick__chips">
                    {aiQuickPrompts.map((prompt) => (
                      <button
                        key={prompt.id}
                        type="button"
                        className="chat-ai-quick__chip"
                        onClick={() => sendToAssistant(prompt.label)}
                      >
                        {prompt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <form
            className="chat-compose"
            onSubmit={(event) => {
              event.preventDefault();
              sendToAssistant(text);
              setText("");
            }}
          >
            <input
              className="chat-compose__input"
              type="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={t("chat.ai.placeholder", "help, home-page, profile…")}
              maxLength={2000}
              disabled={!activeChat}
            />
            <div className="chat-compose__tools">
              <button type="button" className="chat-compose__tool" aria-label="Emoji">
                😊
              </button>
              <button type="button" className="chat-compose__tool" aria-label="Attach">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
                </svg>
              </button>
            </div>
          </form>
        </section>

        <aside className="chat-col chat-col--profile" ref={profileRef}>
          <div className="chat-profile">
            <img
              className="chat-profile__avatar"
              src={activeAvatar}
              width="96"
              height="96"
              alt=""
            />
            <h2 className="chat-profile__name">
              {activeChat
                ? activeIsAiAssistant
                  ? t("notify.aiAssistantName", "AI Assistant")
                  : activeChat.peer
                : t("chat.profile.none", "No contact selected")}
            </h2>
            <div className="chat-profile__block">
              <div className="chat-profile__label">{t("chat.profile.phone", "Phone")}</div>
              <div className="chat-profile__value">{activeProfile.phone}</div>
            </div>
            <div className="chat-profile__block">
              <div className="chat-profile__label">{t("chat.profile.email", "Email")}</div>
              <div className="chat-profile__value">
                <a href={`mailto:${activeProfile.email}`}>{activeProfile.email}</a>
              </div>
            </div>
            <div className="chat-profile__block">
              <div className="chat-profile__label">{t("chat.profile.position", "Current position")}</div>
              <div className="chat-profile__value">{activeProfile.position}</div>
            </div>
            <div className="chat-profile__block">
              <div className="chat-profile__label">{t("chat.profile.education", "Education")}</div>
              <div className="chat-profile__value">{activeProfile.education}</div>
            </div>
            <div className="chat-profile__block">
              <div className="chat-profile__label">{t("chat.profile.birth", "Birth date")}</div>
              <div className="chat-profile__value">{activeProfile.birth}</div>
            </div>
            <div className="chat-profile__block">
              <div className="chat-profile__label">{t("chat.profile.website", "Website")}</div>
              <div className="chat-profile__value">
                <a href={`https://${activeProfile.web}`}>{activeProfile.web}</a>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {callOverlay ? (
        <div
          className={callOverlay.exiting ? "chat-call-overlay chat-call-overlay--exit" : "chat-call-overlay"}
          role="dialog"
          aria-modal="true"
          aria-label={t("chat.callOverlay", "Voice call")}
        >
          <div className="chat-call-overlay__backdrop" aria-hidden="true" />
          <div className="chat-call-overlay__content">
            <div className="chat-call-overlay__avatar-wrap">
              <span className="chat-call-overlay__pulse chat-call-overlay__pulse--1" aria-hidden="true" />
              <span className="chat-call-overlay__pulse chat-call-overlay__pulse--2" aria-hidden="true" />
              <span className="chat-call-overlay__pulse chat-call-overlay__pulse--3" aria-hidden="true" />
              <img
                className="chat-call-overlay__avatar"
                src={getContactAvatarUrl(callProfile, callOverlay.peer)}
                width="120"
                height="120"
                alt=""
              />
            </div>
            <h2 className="chat-call-overlay__name">{callOverlay.peer}</h2>
            <p className="chat-call-overlay__status">
              {callOverlay.status === "no-answer"
                ? t("chat.callNoAnswer", "No answer")
                : (
                  <>
                    {t("chat.calling", "Calling")}
                    <span className="chat-call-overlay__dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                  </>
                )}
            </p>
            <p className="chat-call-overlay__phone">{callProfile.phone}</p>
          </div>

          <div className="chat-call-overlay__controls">
            <button
              type="button"
              className={callOverlay.muted ? "chat-call-overlay__ctrl chat-call-overlay__ctrl--active" : "chat-call-overlay__ctrl"}
              aria-label={callOverlay.muted ? t("chat.callUnmute", "Unmute") : t("chat.callMute", "Mute")}
              aria-pressed={callOverlay.muted ? "true" : "false"}
              onClick={toggleCallMute}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                {callOverlay.muted ? (
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.16l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
                ) : (
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" />
                )}
              </svg>
            </button>
            <button
              type="button"
              className="chat-call-overlay__end"
              aria-label={t("chat.callEnd", "End call")}
              onClick={endCall}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="chat-call-overlay__end-icon">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </button>
            <button
              type="button"
              className={callOverlay.speaker ? "chat-call-overlay__ctrl chat-call-overlay__ctrl--active" : "chat-call-overlay__ctrl"}
              aria-label={t("chat.callSpeaker", "Speaker")}
              aria-pressed={callOverlay.speaker ? "true" : "false"}
              onClick={toggleCallSpeaker}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
