(function () {
  const ARCHIVE_KEY = "chatArchivedPeers";
  const HOME_CHATS_STORAGE_KEY = "homeChats";
  const CHAT_PEER_IDS = new Set(["marcus", "alena", "abram"]);

  function slugPeerId(v) {
    return String(v || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function loadHomeChatsArray() {
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
    const s = new Set();
    CHAT_PEER_IDS.forEach((id) => {
      if (!removed.has(id)) s.add(id);
    });
    loadHomeChatsArray().forEach((c) => {
      const id = slugPeerId(c.id);
      if (id && !removed.has(id)) s.add(id);
    });
    return s;
  }

  function normalizePeerId(v) {
    const s = slugPeerId(v);
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
    const av = typeof chat.avatar === "string" ? chat.avatar.trim() : "";
    if (/^https:\/\//i.test(av) && !av.includes('"') && !av.includes("'")) return av;
    const name = String(chat.name || chat.id || "user");
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name + String(chat.id || ""))}`;
  }

  function injectDynamicChatRows() {
    const scroll = document.getElementById("chatListScroll");
    if (!scroll) return;
    scroll.querySelectorAll(".chat-list__row[data-dynamic-home-chat]").forEach((n) => n.remove());
    const presetIds = new Set(["marcus", "alena", "abram"]);
    const marcusRow = scroll.querySelector('.chat-list__row[data-peer="marcus"]');
    let anchor = marcusRow || scroll.querySelector(".chat-list__row[data-peer]");
    const byId = new Map();
    loadHomeChatsArray().forEach((c) => {
      const id = slugPeerId(c.id);
      if (!id || presetIds.has(id) || readRemovedPeerSet().has(id)) return;
      if (!byId.has(id)) byId.set(id, c);
    });
    const ordered = [...byId.values()].reverse();
    ordered.forEach((chat) => {
      const id = slugPeerId(chat.id);
      const name = String(chat.name || id).trim() || id;
      const preview = String(chat.preview || "").trim();
      const time = String(chat.time || "").trim();
      const imgSrc = avatarUrlForHomeChatList(chat);
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
      if (anchor) scroll.insertBefore(row, anchor);
      else scroll.appendChild(row);
      anchor = row;
    });
  }

  injectDynamicChatRows();

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
    const rows = document.querySelectorAll(".chat-list__row[data-peer]");
    let visible = 0;
    rows.forEach((row) => {
      const raw = slugPeerId(row.getAttribute("data-peer"));
      if (!raw) return;
      if (readRemovedPeerSet().has(raw)) {
        row.hidden = true;
        return;
      }
      const peer = normalizePeerId(row.getAttribute("data-peer"));
      if (!peer) return;
      syncToggleButton(row);
      const isArchived = archivedSet.has(peer);
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
  const peer = params.get("with");

  function readChatFromHomeChats(slug) {
    const s = slugPeerId(slug);
    if (!s) return null;
    return loadHomeChatsArray().find((c) => slugPeerId(c.id) === s) || null;
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

  const slugParam = peer && String(peer).trim() ? String(peer).trim().toLowerCase().replace(/\s+/g, "-") : "";

  if (slugParam && readRemovedPeerSet().has(slugParam)) {
    const next = firstFallbackPeerSlug(slugParam);
    window.location.replace(`./index.html?with=${encodeURIComponent(next)}`);
    return;
  }

  let key;
  let p;
  let customThreadFromContact = false;
  if (slugParam && presets[slugParam]) {
    key = slugParam;
    p = presets[key];
  } else if (slugParam) {
    const stored = readChatFromHomeChats(slugParam);
    if (stored && String(stored.name || "").trim()) {
      key = slugParam;
      customThreadFromContact = true;
      p = {
        name: String(stored.name).trim(),
        seed: seedFromHomeChat(stored),
        phone: "—",
        email: "—",
        web: "",
      };
    } else {
      key = "marcus";
      p = presets.marcus;
    }
  } else {
    key = "marcus";
    p = presets.marcus;
  }

  if (readRemovedPeerSet().has(key)) {
    const next = firstFallbackPeerSlug(key);
    window.location.replace(`./index.html?with=${encodeURIComponent(next)}`);
    return;
  }

  if (archivedSet.has(key)) {
    setListTab("archive");
  } else {
    applyListFilters();
  }

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.seed)}`;

  const threadAvatar = document.getElementById("threadAvatar");
  const profileAvatar = document.getElementById("profileAvatar");
  if (threadAvatar) threadAvatar.src = avatarUrl;
  if (profileAvatar) profileAvatar.src = avatarUrl;

  if (!customThreadFromContact) {
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
    const nameEl = row.querySelector(".chat-list__item-name-text") || row.querySelector(".chat-list__item-name");
    const text = nameEl ? nameEl.textContent.replace(/\d+/g, "").trim() : "";
    const match = text === p.name;
    row.classList.toggle("chat-list__row--active", match);
    btn.classList.toggle("chat-list__item--active", match);
  });

  document.querySelectorAll(".chat-list__row[data-peer] .chat-list__item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest(".chat-list__row");
      const id = row && row.getAttribute("data-peer");
      if (!id) return;
      window.location.href = `./index.html?with=${encodeURIComponent(id)}`;
    });
  });

  const scrollEl = document.getElementById("threadScroll");
  const endEl = document.getElementById("threadEnd");
  const form = document.getElementById("chatCompose");
  const input = document.getElementById("chatInput");
  const listSearch = document.getElementById("chatListSearch");
  const callBtn = document.querySelector('.chat-thread__icon-btn[data-i18n-aria="chat.call"]');
  const searchThreadBtn = document.querySelector('.chat-thread__icon-btn[data-i18n-aria="chat.searchThread"]');
  const emojiBtn = document.querySelector('.chat-compose__tool[data-i18n-aria="chat.emoji"]');
  const attachBtn = document.querySelector('.chat-compose__tool[data-i18n-aria="chat.attach"]');
  let attachInput = null;

  if (customThreadFromContact && scrollEl && endEl) {
    scrollEl.querySelectorAll(".chat-msg, .chat-divider").forEach((n) => n.remove());
    const hint = document.createElement("p");
    hint.className = "chat-thread__empty-hint";
    hint.dataset.i18n = "chat.emptyThreadHint";
    hint.textContent = typeof window.uiT === "function" ? window.uiT("chat.emptyThreadHint") : "";
    scrollEl.insertBefore(hint, endEl);
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
      const phone = (phoneEl && phoneEl.textContent ? phoneEl.textContent : "").trim();
      if (!phone || phone === "—") {
        notify("Номер телефона не указан");
        return;
      }
      const clean = phone.replace(/[^\d+]/g, "");
      if (!clean) {
        notify("Невозможно начать звонок");
        return;
      }
      window.location.href = `tel:${clean}`;
    });
  }

  if (searchThreadBtn) {
    searchThreadBtn.addEventListener("click", () => {
      if (listSearch) {
        listSearch.focus();
        listSearch.select();
        notify("Введите имя собеседника в поиск");
      } else {
        notify("Поиск чата открыт");
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
          notify("Файл прикреплен: " + file.name);
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
    if (e.key === "Escape") closeMoreMenu();
  });

  function removePeerFromChatsAndRedirect(slug) {
    const s = slugPeerId(slug);
    if (!s) return;
    const gone = readRemovedPeerSet();
    gone.add(s);
    writeRemovedPeerSet(gone);
    if (typeof window.removeHomePanelChatById === "function") {
      window.removeHomePanelChatById(s);
    }
    archivedSet.delete(s);
    writeArchivedSet(archivedSet);
    document.querySelectorAll(".chat-list__row[data-peer]").forEach((row) => {
      if (slugPeerId(row.getAttribute("data-peer")) === s) row.remove();
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
  });
})();
