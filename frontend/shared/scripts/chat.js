(function () {
  const ARCHIVE_KEY = "chatArchivedPeers";
  const HOME_CHATS_STORAGE_KEY = "homeChats";
  const CHAT_PEER_IDS = new Set(["marcus", "alena", "abram"]);
  const KNOWN_PEER_AVATARS = {
    timuryamchuk: "/auth/assets/timur-yamchuk-avatar.png",
    andriirotar: "/auth/assets/andrii-rotar-avatar.png",
  };

  function getMessagingContactsMap() {
    const raw = window.MESSAGING_CONTACTS;
    return raw && typeof raw === "object" ? raw : {};
  }

  function isUsableAvatarUrl(raw) {
    const value = String(raw || "").trim();
    if (!value || value.includes('"') || value.includes("'")) return false;
    return value.startsWith("data:image/") || /^https?:\/\//i.test(value) || value.startsWith("/");
  }

  function peerAvatarUrl(peer, chatRecord) {
    const fromPeer = peer && typeof peer.avatar === "string" ? peer.avatar.trim() : "";
    if (isUsableAvatarUrl(fromPeer)) return fromPeer;
    const fromChat = chatRecord && typeof chatRecord.avatar === "string" ? chatRecord.avatar.trim() : "";
    if (isUsableAvatarUrl(fromChat)) return fromChat;
    const slug = chatRecord ? slugPeerId(chatRecord.id) : "";
    if (KNOWN_PEER_AVATARS[slug]) return KNOWN_PEER_AVATARS[slug];
    const seed = peer && peer.seed ? peer.seed : "user";
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  }

  function slugPeerId(v) {
    if (typeof window.slugPeerId === "function") return window.slugPeerId(v);
    return String(v || "")
      .trim()
      .toLowerCase()
      .replace(/^@+/, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  function canonicalPeerId(v) {
    if (typeof window.canonicalPeerId === "function") return window.canonicalPeerId(v);
    return slugPeerId(v);
  }

  function loadHomeChatsArray() {
    if (typeof window.loadHomeChats === "function") return window.loadHomeChats();
    try {
      const raw = localStorage.getItem(HOME_CHATS_STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  const CHAT_REMOVED_KEY = "chatRemovedPeers";

  function readRemovedPeerSet() {
    try {
      const raw = localStorage.getItem(CHAT_REMOVED_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr.map((x) => slugPeerId(x)).filter(Boolean) : []);
    } catch {
      return new Set();
    }
  }

  function writeRemovedPeerSet(set) {
    try {
      const ids = [...set].map((x) => slugPeerId(x)).filter(Boolean);
      localStorage.setItem(CHAT_REMOVED_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }

  function firstFallbackPeerSlug(excludeSlug) {
    const removed = readRemovedPeerSet();
    const ex = slugPeerId(excludeSlug);
    for (const id of ["marcus", "alena", "abram"]) {
      if (id !== ex && !removed.has(id)) return id;
    }
    for (const id of Object.keys(getMessagingContactsMap())) {
      const slug = slugPeerId(id);
      if (slug && slug !== ex && !removed.has(slug)) return slug;
    }
    for (const c of loadHomeChatsArray()) {
      const id = slugPeerId(c.id);
      if (id && id !== ex && !removed.has(id)) return id;
    }
    for (const id of ["marcus", "alena", "abram"]) {
      if (!removed.has(id)) return id;
    }
    return "marcus";
  }

  function allKnownPeerIds() {
    const removed = readRemovedPeerSet();
    const connectedIds = new Set(
      loadHomeChatsArray()
        .map((c) => canonicalPeerId(c.id))
        .filter(Boolean)
    );
    const s = new Set();
    CHAT_PEER_IDS.forEach((id) => {
      if (!removed.has(id) || connectedIds.has(id)) s.add(id);
    });
    Object.keys(getMessagingContactsMap()).forEach((id) => {
      const slug = canonicalPeerId(id);
      if (slug && (!removed.has(slug) || connectedIds.has(slug))) s.add(slug);
    });
    loadHomeChatsArray().forEach((c) => {
      const id = canonicalPeerId(c.id);
      if (id) s.add(id);
    });
    return s;
  }

  function normalizePeerId(v) {
    const s = canonicalPeerId(v);
    if (!s) return "";
    return allKnownPeerIds().has(s) ? s : "";
  }

  const SVG_ARCHIVE_BTN =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>';

  const SVG_UNARCHIVE_BTN =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-.9-2-2-2zm-5 12H9v-2h6v2zm0-4H9V8h6v2zM20 7H4V4h16v3z"/></svg>';

  function T(key) {
    return typeof window.uiT === "function" ? window.uiT(key) : key;
  }

  function notify(text) {
    if (typeof window.showUiNotice === "function") {
      window.showUiNotice(text);
      return;
    }
    window.alert(text);
  }

  function readArchivedSet() {
    try {
      const raw = localStorage.getItem(ARCHIVE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      const allowed = allKnownPeerIds();
      const ids = Array.isArray(arr)
        ? arr.map((x) => slugPeerId(x)).filter((id) => id && allowed.has(id))
        : [];
      return new Set(ids);
    } catch {
      return new Set();
    }
  }

  function writeArchivedSet(set) {
    try {
      const allowed = allKnownPeerIds();
      const ids = [...set].map((id) => slugPeerId(id)).filter((id) => id && allowed.has(id));
      localStorage.setItem(ARCHIVE_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }

  function escapeHtmlText(text) {
    const d = document.createElement("div");
    d.textContent = text == null ? "" : String(text);
    return d.innerHTML;
  }

  function avatarUrlForHomeChatList(chat) {
    return peerAvatarUrl({ seed: seedFromHomeChat(chat) }, chat);
  }

  function localizedContactField(contact, fieldKey) {
    if (!contact) return "";
    const key = contact[fieldKey];
    if (!key) return "";
    return typeof window.uiT === "function" ? window.uiT(key) : "";
  }

  function createChatListRow(id, name, preview, time, imgSrc) {
    const row = document.createElement("div");
    row.className = "chat-list__row";
    row.dataset.peer = id;
    row.dataset.dynamicHomeChat = "1";
    row.innerHTML = `
      <button type="button" class="chat-list__item">
        <img src="" width="44" height="44" alt="" />
        <span class="chat-list__item-body">
          <span class="chat-list__item-name">
            <span class="chat-list__item-name-text">${escapeHtmlText(name)}</span>
          </span>
          <span class="chat-list__item-preview">${escapeHtmlText(preview)}</span>
        </span>
        ${time ? `<span class="chat-list__item-time">${escapeHtmlText(time)}</span>` : ""}
      </button>
      <button type="button" class="chat-list__row-toggle" data-archive-toggle data-i18n-aria="chat.archiveChat" title=""></button>
    `;
    const img = row.querySelector("img");
    if (img) img.src = imgSrc;
    return row;
  }

  function updateChatListRow(row, name, preview, time, imgSrc) {
    const nameEl = row.querySelector(".chat-list__item-name-text");
    const previewEl = row.querySelector(".chat-list__item-preview");
    const timeEl = row.querySelector(".chat-list__item-time");
    const imgEl = row.querySelector(".chat-list__item img");
    if (nameEl) nameEl.textContent = name;
    if (previewEl) {
      previewEl.textContent = preview;
      previewEl.removeAttribute("data-i18n");
    }
    if (timeEl) {
      timeEl.textContent = time;
      timeEl.removeAttribute("data-i18n");
    }
    if (imgEl && imgSrc) imgEl.src = imgSrc;
  }

  function isActiveConnectedPeer(slug) {
    const id = canonicalPeerId(slug);
    if (!id) return false;
    return loadHomeChatsArray().some((chat) => canonicalPeerId(chat.id) === id);
  }

  function injectDynamicChatRows() {
    const scroll = document.getElementById("chatListScroll");
    if (!scroll) return;

    if (typeof window.reconcileAllConnectedPeerState === "function") {
      window.reconcileAllConnectedPeerState();
    }

    scroll.querySelectorAll(".chat-list__row[data-dynamic-home-chat]").forEach((n) => n.remove());

    const connectedChats = loadHomeChatsArray()
      .map((chat) => ({
        chat,
        peer: canonicalPeerId(chat.id),
      }))
      .filter((entry) => entry.peer);

    const connectedPeers = new Set(connectedChats.map((entry) => entry.peer));
    const emptyElNode = document.getElementById("chatListEmpty");
    let insertBefore = emptyElNode ? emptyElNode.nextElementSibling : scroll.firstElementChild;

    connectedChats.forEach(({ chat, peer }) => {
      const name = String(chat.name || peer).trim() || peer;
      const preview = String(chat.preview || T("network.newChatPreview") || "Start the conversation…").trim();
      const time = String(chat.time || T("js.chatNow") || "Now").trim();
      const imgSrc = avatarUrlForHomeChatList(chat);
      let row = scroll.querySelector(`.chat-list__row[data-peer="${peer}"]`);

      if (row) {
        updateChatListRow(row, name, preview, time, imgSrc);
        row.classList.add("chat-list__row--connected");
        if (insertBefore && row !== insertBefore) {
          scroll.insertBefore(row, insertBefore);
        }
        insertBefore = row.nextElementSibling;
        return;
      }

      const dynamicRow = createChatListRow(peer, name, preview, time, imgSrc);
      dynamicRow.classList.add("chat-list__row--connected");
      if (insertBefore) scroll.insertBefore(dynamicRow, insertBefore);
      else scroll.appendChild(dynamicRow);
      insertBefore = dynamicRow.nextElementSibling;
    });

    scroll.querySelectorAll(".chat-list__row[data-peer]").forEach((row) => {
      const peer = canonicalPeerId(row.getAttribute("data-peer"));
      if (connectedPeers.has(peer)) return;
      row.classList.remove("chat-list__row--connected");

      if (row.dataset.dynamicHomeChat === "1") return;

      const presetPreviewKeys = {
        marcus: "chat.previewMarcus",
        alena: "chat.previewAlena",
        abram: "chat.previewAbram",
      };
      const previewKey = presetPreviewKeys[peer];
      if (!previewKey) return;

      const previewEl = row.querySelector(".chat-list__item-preview");
      const timeEl = row.querySelector(".chat-list__item-time");
      if (previewEl) {
        previewEl.dataset.i18n = previewKey;
        previewEl.textContent = T(previewKey);
      }
      if (timeEl && timeEl.dataset.i18n) {
        timeEl.textContent = T(timeEl.dataset.i18n);
      }
    });
  }

  injectDynamicChatRows();

  document.addEventListener("homechatsupdated", () => {
    if (typeof window.reconcileAllConnectedPeerState === "function") {
      window.reconcileAllConnectedPeerState();
    }
    archivedSet = readArchivedSet();
    injectDynamicChatRows();
    applyListFilters();
  });

  let archivedSet = readArchivedSet();
  let listTab = "inbox";

  const tabInbox = document.getElementById("chatTabInbox");
  const tabArchive = document.getElementById("chatTabArchive");
  const searchInput = document.getElementById("chatListSearch");
  const emptyEl = document.getElementById("chatListEmpty");

  function syncToggleButton(row) {
    const peer = normalizePeerId(row.getAttribute("data-peer"));
    const btn = row.querySelector("[data-archive-toggle]");
    if (!peer || !btn) return;
    const isArchived = archivedSet.has(peer);
    row.dataset.archived = isArchived ? "true" : "false";
    const restore = isArchived;
    btn.innerHTML = restore ? SVG_UNARCHIVE_BTN : SVG_ARCHIVE_BTN;
    const label = restore ? T("chat.unarchiveChat") : T("chat.archiveChat");
    btn.setAttribute("aria-label", label);
    btn.title = label;
  }

  function rowMatchesSearch(row) {
    const q = (searchInput && searchInput.value.trim().toLowerCase()) || "";
    if (!q) return true;
    return row.textContent.toLowerCase().includes(q);
  }

  function applyListFilters() {
    const inArchiveView = listTab === "archive";
    const connectedIds = new Set(
      loadHomeChatsArray()
        .map((c) => canonicalPeerId(c.id))
        .filter(Boolean)
    );
    const rows = document.querySelectorAll(".chat-list__row[data-peer]");
    let visible = 0;
    rows.forEach((row) => {
      const raw = canonicalPeerId(row.getAttribute("data-peer"));
      if (!raw) {
        row.hidden = true;
        return;
      }
      const isConnected = connectedIds.has(raw);
      if (readRemovedPeerSet().has(raw) && !isConnected) {
        row.hidden = true;
        return;
      }
      const peer = normalizePeerId(row.getAttribute("data-peer"));
      if (!peer && !isConnected) {
        row.hidden = true;
        return;
      }
      syncToggleButton(row);
      const peerId = peer || raw;
      const isArchived = archivedSet.has(peerId);
      const tabOk = inArchiveView ? isArchived : !isArchived;
      const searchOk = rowMatchesSearch(row);
      const show = tabOk && searchOk;
      row.hidden = !show;
      if (show) visible += 1;
    });
    if (emptyEl) {
      if (visible > 0) {
        emptyEl.hidden = true;
      } else {
        emptyEl.hidden = false;
        const q = (searchInput && searchInput.value.trim()) || "";
        if (q) emptyEl.textContent = T("chat.emptySearch");
        else if (inArchiveView) emptyEl.textContent = T("chat.emptyArchive");
        else emptyEl.textContent = T("chat.emptyInboxAll");
      }
    }
  }

  function setListTab(tab) {
    listTab = tab === "archive" ? "archive" : "inbox";
    const inbox = listTab === "inbox";
    if (tabInbox) {
      tabInbox.classList.toggle("chat-list__tab--active", inbox);
      tabInbox.setAttribute("aria-selected", inbox ? "true" : "false");
    }
    if (tabArchive) {
      tabArchive.classList.toggle("chat-list__tab--active", !inbox);
      tabArchive.setAttribute("aria-selected", inbox ? "false" : "true");
    }
    applyListFilters();
  }

  if (tabInbox) tabInbox.addEventListener("click", () => setListTab("inbox"));
  if (tabArchive) tabArchive.addEventListener("click", () => setListTab("archive"));
  if (searchInput) searchInput.addEventListener("input", applyListFilters);

  const chatListScroll = document.getElementById("chatListScroll");
  if (chatListScroll) {
    chatListScroll.addEventListener("click", (e) => {
      const item = e.target.closest(".chat-list__item");
      if (!item || !chatListScroll.contains(item)) return;
      if (e.target.closest("[data-archive-toggle]")) return;
      const row = item.closest(".chat-list__row");
      const id = row && row.getAttribute("data-peer");
      if (!id) return;
      window.location.href = `./index.html?with=${encodeURIComponent(canonicalPeerId(id) || id)}`;
    });
  }

  if (chatListScroll) {
    chatListScroll.addEventListener("click", (e) => {
      const toggle = e.target.closest("[data-archive-toggle]");
      if (!toggle || !chatListScroll.contains(toggle)) return;
      e.preventDefault();
      e.stopPropagation();
      const row = toggle.closest(".chat-list__row");
      const peer = normalizePeerId(row && row.getAttribute("data-peer"));
      if (!peer) return;
      if (archivedSet.has(peer)) archivedSet.delete(peer);
      else archivedSet.add(peer);
      writeArchivedSet(archivedSet);
      applyListFilters();
      const params = new URLSearchParams(window.location.search);
      const current = normalizePeerId(params.get("with") || "marcus") || "marcus";
      if (current === peer && archivedSet.has(peer)) setListTab("archive");
    });
  }

  const params = new URLSearchParams(window.location.search);
  const peerParam = params.get("with");
  const recentConnected = loadHomeChatsArray()[0];
  const peer = peerParam || (recentConnected && recentConnected.id) || null;

  function readChatFromHomeChats(slug) {
    const s = canonicalPeerId(slug);
    if (!s) return null;
    return loadHomeChatsArray().find((c) => canonicalPeerId(c.id) === s) || null;
  }

  function seedFromHomeChat(chat) {
    if (!chat || typeof chat.avatar !== "string") return String(chat?.name || "user");
    const m = chat.avatar.match(/[?&]seed=([^&]+)/i);
    if (!m) return String(chat.name || "user");
    try {
      return decodeURIComponent(m[1]);
    } catch {
      return m[1];
    }
  }

  const presets = {
    marcus: {
      name: "Marcus Dias",
      seed: "MarcusDias",
      phone: "+880 789 569 895",
      email: "MarcusAntonioDias@gmail.com",
      web: "www.marcusdias.com",
    },
    alena: {
      name: "Alena Curtis",
      seed: "Alena",
      phone: "+1 415 555 0192",
      email: "alena.curtis@example.com",
      web: "www.alenacurtis.design",
    },
    abram: {
      name: "Abram Lipshutz",
      seed: "Abram",
      phone: "+44 20 7946 0958",
      email: "abram.l@example.com",
      web: "www.abramlipshutz.io",
    },
  };

  function resolvePeerProfile(slugParam) {
    const slug = canonicalPeerId(slugParam);
    if (!slug) return null;

    const storedChat = readChatFromHomeChats(slug);
    const messaging = getMessagingContactsMap()[slug] || getMessagingContactsMap()[slugPeerId(slugParam)];
    const preset = presets[slug];

    if (preset || messaging || storedChat) {
      const name =
        (storedChat && String(storedChat.name || "").trim()) ||
        (messaging && messaging.name) ||
        (preset && preset.name) ||
        slug;
      return {
        key: slug,
        p: {
          name,
          seed: (messaging && messaging.seed) || (preset && preset.seed) || seedFromHomeChat(storedChat) || slug,
          avatar:
            (storedChat && typeof storedChat.avatar === "string" ? storedChat.avatar.trim() : "") ||
            (messaging && messaging.avatar) ||
            "",
          phone: (preset && preset.phone) || (messaging && messaging.phone) || "—",
          email: (preset && preset.email) || (messaging && messaging.email) || "—",
          web: (preset && preset.web) || (messaging && messaging.web) || "",
          previewKey: storedChat ? "" : (messaging && messaging.previewKey) || "",
          timeKey: storedChat ? "" : (messaging && messaging.timeKey) || "",
          storedPreview: storedChat ? String(storedChat.preview || "").trim() : "",
        },
        source: storedChat ? "homeChats" : messaging ? "messaging" : "preset",
        storedChat: storedChat || null,
      };
    }

    return null;
  }

  const slugParam = peer ? canonicalPeerId(peer) : "";

  if (slugParam && readRemovedPeerSet().has(slugParam) && !isActiveConnectedPeer(slugParam)) {
    const next = firstFallbackPeerSlug(slugParam);
    window.location.replace(`./index.html?with=${encodeURIComponent(next)}`);
    return;
  }

  let resolved = slugParam ? resolvePeerProfile(slugParam) : null;
  if (!resolved) {
    resolved = resolvePeerProfile("marcus") || { key: "marcus", p: presets.marcus, source: "preset" };
  }

  let key = resolved.key;
  let p = resolved.p;
  let storedChat = resolved.storedChat || null;
  const peerSource = resolved.source;
  const useStaticMarcusThread = key === "marcus";

  if (readRemovedPeerSet().has(key) && !isActiveConnectedPeer(key)) {
    const next = firstFallbackPeerSlug(key);
    window.location.replace(`./index.html?with=${encodeURIComponent(next)}`);
    return;
  }

  if (archivedSet.has(key)) {
    setListTab("archive");
  } else {
    applyListFilters();
  }

  const avatarUrl = peerAvatarUrl(p, storedChat || readChatFromHomeChats(key));

  const threadAvatar = document.getElementById("threadAvatar");
  const profileAvatar = document.getElementById("profileAvatar");
  if (threadAvatar) threadAvatar.src = avatarUrl;
  if (profileAvatar) profileAvatar.src = avatarUrl;

  if (useStaticMarcusThread) {
    document.querySelectorAll(".chat-msg--in .chat-msg__avatar").forEach((img) => {
      img.src = avatarUrl;
    });
  }

  const threadName = document.getElementById("threadName");
  const profileName = document.getElementById("profileName");
  if (threadName) threadName.textContent = p.name;
  if (profileName) profileName.textContent = p.name;

  const phoneEl = document.getElementById("profilePhone");
  const emailEl = document.getElementById("profileEmail");
  const webEl = document.getElementById("profileWeb");
  if (phoneEl) phoneEl.textContent = p.phone;
  if (emailEl) {
    emailEl.textContent = p.email;
    emailEl.href = `mailto:${p.email}`;
  }
  if (webEl) {
    const w = String(p.web || "").trim();
    webEl.textContent = w || "—";
    if (w) {
      const href = /^https?:\/\//i.test(w) ? w : `https://${w}`;
      webEl.setAttribute("href", href);
      webEl.setAttribute("rel", "noopener noreferrer");
    } else {
      webEl.setAttribute("href", "#");
      webEl.removeAttribute("rel");
    }
  }

  document.querySelectorAll(".chat-list__row[data-peer]").forEach((row) => {
    const btn = row.querySelector(".chat-list__item");
    if (!btn) return;
    const rowPeer = canonicalPeerId(row.getAttribute("data-peer"));
    const match = rowPeer === key;
    row.classList.toggle("chat-list__row--active", match);
    btn.classList.toggle("chat-list__item--active", match);
  });

  const scrollEl = document.getElementById("threadScroll");
  const endEl = document.getElementById("threadEnd");
  const form = document.getElementById("chatCompose");
  const input = document.getElementById("chatInput");
  const listSearch = document.getElementById("chatListSearch");
  const callBtn = document.getElementById("chatCallBtn");
  const searchThreadBtn = document.querySelector('.chat-thread__icon-btn[data-i18n-aria="chat.searchThread"]');
  const emojiBtn = document.querySelector('.chat-compose__tool[data-i18n-aria="chat.emoji"]');
  const attachBtn = document.querySelector('.chat-compose__tool[data-i18n-aria="chat.attach"]');
  let attachInput = null;

  const callModal = document.getElementById("chatCallModal");
  const callAvatar = document.getElementById("chatCallAvatar");
  const callNameEl = document.getElementById("chatCallName");
  const callStatusEl = document.getElementById("chatCallStatus");
  const callTimerEl = document.getElementById("chatCallTimer");
  const callEndBtn = document.getElementById("chatCallEndBtn");
  const callMuteBtn = document.getElementById("chatCallMuteBtn");
  const callSpeakerBtn = document.getElementById("chatCallSpeakerBtn");
  const callCloseTargets = document.querySelectorAll("[data-chat-call-close]");
  let callTimerId = null;
  let callPhaseTimers = [];
  let callStartedAt = 0;
  let callMuted = false;
  let callSpeaker = false;

  function clearCallTimers() {
    if (callTimerId) {
      window.clearInterval(callTimerId);
      callTimerId = null;
    }
    callPhaseTimers.forEach((id) => window.clearTimeout(id));
    callPhaseTimers = [];
  }

  function formatCallDuration(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function setCallStatus(key, fallback) {
    if (!callStatusEl) return;
    callStatusEl.textContent = T(key) || fallback;
  }

  function updateCallControlLabels() {
    if (callMuteBtn) {
      const label = callMuted ? T("chat.callUnmute") : T("chat.callMute");
      const span = callMuteBtn.querySelector("span");
      if (span) span.textContent = label;
      callMuteBtn.setAttribute("aria-label", label);
      callMuteBtn.classList.toggle("chat-call-modal__ctrl--active", callMuted);
    }
    if (callSpeakerBtn) {
      callSpeakerBtn.classList.toggle("chat-call-modal__ctrl--active", callSpeaker);
      callSpeakerBtn.classList.toggle("chat-call-modal__ctrl--speaker", callSpeaker);
    }
  }

  function replayCallControlAnimations() {
    if (!callModal) return;
    callModal.classList.remove("chat-call-modal--controls-in");
    void callModal.offsetWidth;
    callModal.classList.add("chat-call-modal--controls-in");
  }

  function triggerCallCtrlTap(btn) {
    if (!btn) return;
    btn.classList.remove("chat-call-modal__ctrl--tap");
    void btn.offsetWidth;
    btn.classList.add("chat-call-modal__ctrl--tap");
    window.setTimeout(() => btn.classList.remove("chat-call-modal__ctrl--tap"), 460);
  }

  function closeCallModal(showEnded) {
    clearCallTimers();
    if (!callModal) return;
    callModal.classList.remove("chat-call-modal--ringing", "chat-call-modal--connected", "chat-call-modal--controls-in");
    if (showEnded && callStatusEl) {
      callStatusEl.textContent = T("chat.callEnded");
      callPhaseTimers.push(
        window.setTimeout(() => {
          callModal.hidden = true;
          document.body.style.overflow = "";
        }, 700)
      );
      return;
    }
    callModal.hidden = true;
    document.body.style.overflow = "";
  }

  function startConnectedPhase() {
    if (!callModal) return;
    callModal.classList.remove("chat-call-modal--ringing");
    callModal.classList.add("chat-call-modal--connected");
    setCallStatus("chat.callConnected", "Connected");
    if (callTimerEl) {
      callTimerEl.hidden = false;
      callStartedAt = Date.now();
      callTimerEl.textContent = "00:00";
      callTimerId = window.setInterval(() => {
        if (callTimerEl) callTimerEl.textContent = formatCallDuration(Date.now() - callStartedAt);
      }, 1000);
    }
  }

  function openCallModal(name, avatar, phone) {
    if (!callModal || !callAvatar || !callNameEl) return;
    clearCallTimers();
    callMuted = false;
    callSpeaker = false;
    updateCallControlLabels();

    callAvatar.src = avatar || avatarUrl;
    callAvatar.alt = name || "";
    callNameEl.textContent = name || "—";
    if (callTimerEl) {
      callTimerEl.hidden = true;
      callTimerEl.textContent = "00:00";
    }

    callModal.hidden = false;
    callModal.classList.add("chat-call-modal--ringing");
    callModal.classList.remove("chat-call-modal--connected");
    replayCallControlAnimations();
    document.body.style.overflow = "hidden";
    setCallStatus("chat.callRinging", "Calling…");

    callPhaseTimers.push(
      window.setTimeout(() => {
        setCallStatus("chat.callConnecting", "Connecting…");
      }, 1400)
    );
    callPhaseTimers.push(window.setTimeout(startConnectedPhase, 2800));

    if (phone && phone !== "—") {
      /* mock in-app call — phone shown in profile only */
    }
  }

  function renderContactThread(profile, threadAvatarUrl) {
    if (!scrollEl || !endEl) return;
    scrollEl.querySelectorAll(".chat-msg, .chat-divider, .chat-thread__empty-hint").forEach((node) => node.remove());
    const starterPreview = T("network.newChatPreview") || "Start the conversation…";
    const storedPreview = String(profile.storedPreview || "").trim();
    const previewFromKey =
      profile.previewKey && typeof window.uiT === "function" ? window.uiT(profile.previewKey) : "";
    const previewText = storedPreview && storedPreview !== starterPreview ? storedPreview : previewFromKey;
    const timeText =
      profile.timeKey && typeof window.uiT === "function"
        ? window.uiT(profile.timeKey)
        : typeof window.uiT === "function"
          ? window.uiT("js.chatNow")
          : "Now";

    if (!previewText) {
      const hint = document.createElement("p");
      hint.className = "chat-thread__empty-hint";
      hint.dataset.i18n = "chat.emptyThreadHint";
      hint.textContent = typeof window.uiT === "function" ? window.uiT("chat.emptyThreadHint") : "";
      scrollEl.insertBefore(hint, endEl);
      return;
    }

    const wrap = document.createElement("div");
    wrap.className = "chat-msg chat-msg--in";
    wrap.innerHTML = `
      <img class="chat-msg__avatar" src="${escapeHtmlText(threadAvatarUrl)}" width="32" height="32" alt="" />
      <div>
        <div class="chat-msg__bubble">${escapeHtmlText(previewText)}</div>
        <div class="chat-msg__time">${escapeHtmlText(timeText)}</div>
      </div>
    `;
    scrollEl.insertBefore(wrap, endEl);
  }

  if (!useStaticMarcusThread) {
    renderContactThread(p, avatarUrl);
  }

  function scrollThreadToBottom() {
    if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
  }

  scrollThreadToBottom();

  function nowLabel() {
    return typeof window.uiT === "function" ? window.uiT("js.chatNow") : "Now";
  }

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function appendOutgoing(text) {
    if (!scrollEl || !endEl) return;
    scrollEl.querySelectorAll(".chat-thread__empty-hint").forEach((n) => n.remove());
    const wrap = document.createElement("div");
    wrap.className = "chat-msg chat-msg--out";
    wrap.innerHTML = `
      <div>
        <div class="chat-msg__bubble">${esc(text)}</div>
        <div class="chat-msg__time">${esc(nowLabel())}</div>
      </div>
    `;
    scrollEl.insertBefore(wrap, endEl);
    scrollThreadToBottom();
  }

  if (form && input) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      appendOutgoing(text);
      input.value = "";
      input.focus();
    });
  }

  if (callBtn) {
    callBtn.addEventListener("click", () => {
      openCallModal(p.name, avatarUrl, phoneEl ? phoneEl.textContent : "");
    });
  }

  if (callEndBtn) {
    callEndBtn.addEventListener("click", () => {
      triggerCallCtrlTap(callEndBtn);
      window.setTimeout(() => closeCallModal(true), 280);
    });
  }

  if (callCloseTargets.length) {
    callCloseTargets.forEach((el) => {
      el.addEventListener("click", () => closeCallModal(true));
    });
  }

  if (callMuteBtn) {
    callMuteBtn.addEventListener("click", () => {
      triggerCallCtrlTap(callMuteBtn);
      callMuted = !callMuted;
      updateCallControlLabels();
    });
  }

  if (callSpeakerBtn) {
    callSpeakerBtn.addEventListener("click", () => {
      triggerCallCtrlTap(callSpeakerBtn);
      callSpeaker = !callSpeaker;
      updateCallControlLabels();
    });
  }

  if (searchThreadBtn) {
    searchThreadBtn.addEventListener("click", () => {
      if (listSearch) {
        listSearch.focus();
        listSearch.select();
        notify(T("chat.searchThreadFocus"));
      } else {
        notify(T("chat.searchThreadOpen"));
      }
    });
  }

  if (emojiBtn && input) {
    emojiBtn.addEventListener("click", () => {
      const start = input.selectionStart == null ? input.value.length : input.selectionStart;
      const end = input.selectionEnd == null ? input.value.length : input.selectionEnd;
      input.value = input.value.slice(0, start) + "😊" + input.value.slice(end);
      input.focus();
      const pos = start + 2;
      input.setSelectionRange(pos, pos);
    });
  }

  if (attachBtn) {
    attachBtn.addEventListener("click", () => {
      if (!attachInput) {
        attachInput = document.createElement("input");
        attachInput.type = "file";
        attachInput.accept = "image/*,.pdf,.doc,.docx";
        attachInput.hidden = true;
        attachInput.addEventListener("change", () => {
          const file = attachInput && attachInput.files && attachInput.files[0];
          if (!file) return;
          notify(String(T("chat.attachDone")).replace("{{name}}", file.name));
          if (input) {
            input.value = (input.value ? input.value + " " : "") + `[${file.name}]`;
            input.focus();
          }
          attachInput.value = "";
        });
        document.body.appendChild(attachInput);
      }
      attachInput.click();
    });
  }

  const moreBtn = document.getElementById("chatThreadMoreBtn");
  const moreMenu = document.getElementById("chatThreadMoreMenu");
  const deletePeerBtn = document.getElementById("chatThreadDeletePeer");

  function closeMoreMenu() {
    if (!moreMenu || !moreBtn) return;
    moreMenu.hidden = true;
    moreBtn.setAttribute("aria-expanded", "false");
  }

  function openMoreMenu() {
    if (!moreMenu || !moreBtn) return;
    moreMenu.hidden = false;
    moreBtn.setAttribute("aria-expanded", "true");
  }

  if (moreBtn && moreMenu) {
    moreBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (moreMenu.hidden) openMoreMenu();
      else closeMoreMenu();
    });
  }

  document.addEventListener("click", (e) => {
    if (!moreMenu || moreMenu.hidden) return;
    if (moreBtn && !moreBtn.contains(e.target) && !moreMenu.contains(e.target)) {
      closeMoreMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMoreMenu();
      if (callModal && !callModal.hidden) closeCallModal(true);
    }
  });

  function removePeerFromChatsAndRedirect(slug) {
    const s = canonicalPeerId(slug);
    if (!s) return;
    const gone = readRemovedPeerSet();
    gone.add(s);
    writeRemovedPeerSet(gone);
    if (typeof window.disconnectPerson === "function") {
      window.disconnectPerson(s);
    } else if (typeof window.removeHomePanelChatById === "function") {
      window.removeHomePanelChatById(s);
    }
    archivedSet.delete(s);
    writeArchivedSet(archivedSet);
    document.querySelectorAll(".chat-list__row[data-peer]").forEach((row) => {
      if (canonicalPeerId(row.getAttribute("data-peer")) === s) row.remove();
    });
    injectDynamicChatRows();
    applyListFilters();
    const next = firstFallbackPeerSlug(s);
    window.location.href = `./index.html?with=${encodeURIComponent(next)}`;
  }

  if (deletePeerBtn) {
    deletePeerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMoreMenu();
      if (!window.confirm(T("chat.deletePeerConfirm"))) return;
      removePeerFromChatsAndRedirect(key);
    });
  }

  document.addEventListener("uilangchange", () => {
    document.querySelectorAll(".chat-msg--out .chat-msg__time").forEach((el) => {
      el.textContent = nowLabel();
    });
    document.querySelectorAll(".chat-thread__empty-hint[data-i18n]").forEach((el) => {
      const k = el.getAttribute("data-i18n");
      if (k && typeof window.uiT === "function") el.textContent = window.uiT(k);
    });
    if (deletePeerBtn && deletePeerBtn.dataset.i18n && typeof window.uiT === "function") {
      deletePeerBtn.textContent = window.uiT(deletePeerBtn.dataset.i18n);
    }
    document.querySelectorAll(".chat-list__row[data-peer]").forEach((row) => {
      syncToggleButton(row);
    });
    applyListFilters();
    if (callModal && !callModal.hidden) {
      if (callModal.classList.contains("chat-call-modal--connected")) {
        setCallStatus("chat.callConnected", "Connected");
      } else if (callStatusEl && /connect/i.test(callStatusEl.textContent)) {
        setCallStatus("chat.callConnecting", "Connecting…");
      } else {
        setCallStatus("chat.callRinging", "Calling…");
      }
      updateCallControlLabels();
    }
  });
})();
