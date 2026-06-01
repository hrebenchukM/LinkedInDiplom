(function () {
  const tabs = document.querySelectorAll(".home-messages__tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.toggle("home-messages__tab--active", t === tab);
        t.setAttribute("aria-selected", String(t === tab));
      });
    });
  });

  const messagesWidget = document.getElementById("homeMessagesWidget");
  const messagesWidgetBody = document.getElementById("homeMessagesWidgetBody");
  const messagesWidgetToggle = document.getElementById("messagesWidgetToggle");

  function widgetToggleAriaLabel(collapsed) {
    const T = typeof window.uiT === "function" ? window.uiT : () => "";
    return collapsed ? T("widget.expand") : T("widget.collapse");
  }

  if (messagesWidget && messagesWidgetBody && messagesWidgetToggle) {
    messagesWidgetToggle.addEventListener("click", () => {
      const collapsed = messagesWidget.classList.toggle("home-messages--collapsed");
      messagesWidgetToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
      messagesWidgetToggle.setAttribute("aria-label", widgetToggleAriaLabel(collapsed));
    });
    document.addEventListener("uilangchange", () => {
      const collapsed = messagesWidget.classList.contains("home-messages--collapsed");
      messagesWidgetToggle.setAttribute("aria-label", widgetToggleAriaLabel(collapsed));
    });
  }

  const CHATS_STORAGE_KEY = "homeChats";
  const UI_NOTIFICATIONS_STORAGE_KEY = "uiNotifications";

  const notificationsWrap = document.getElementById("notificationsDropdownWrap");
  const messagesWrap = document.getElementById("messagesDropdownWrap");
  const navNotifications = document.getElementById("navNotifications");
  const navMessages = document.getElementById("navMessages");
  const notificationsPanel = document.getElementById("notificationsPanel");
  const notificationsPanelClose = document.getElementById("notificationsPanelClose");
  const messagesPanel = document.getElementById("messagesPanel");
  const messagesPanelClose = document.getElementById("messagesPanelClose");
  const messagesPanelList = document.getElementById("messagesPanelList");
  const messagesPanelEmpty = document.getElementById("messagesPanelEmpty");
  const notificationsPanelEmpty = notificationsPanel
    ? notificationsPanel.querySelector(".home-notify-panel__empty")
    : null;
  let notificationsPanelList = null;

  let notificationsOutsideListener = null;
  let messagesOutsideListener = null;

  function detachNotificationsOutside() {
    if (notificationsOutsideListener) {
      document.removeEventListener("click", notificationsOutsideListener);
      notificationsOutsideListener = null;
    }
  }

  function detachMessagesOutside() {
    if (messagesOutsideListener) {
      document.removeEventListener("click", messagesOutsideListener);
      messagesOutsideListener = null;
    }
  }

  function closeNotificationsPanel() {
    if (!notificationsPanel || !navNotifications) return;
    notificationsPanel.hidden = true;
    navNotifications.setAttribute("aria-expanded", "false");
    detachNotificationsOutside();
  }

  function closeMessagesPanel() {
    if (!messagesPanel || !navMessages) return;
    messagesPanel.hidden = true;
    navMessages.setAttribute("aria-expanded", "false");
    detachMessagesOutside();
  }

  function openNotificationsPanel() {
    if (!notificationsPanel || !navNotifications) return;
    closeMessagesPanel();
    renderNotificationsPanel();
    notificationsPanel.hidden = false;
    navNotifications.setAttribute("aria-expanded", "true");
    detachNotificationsOutside();
    notificationsOutsideListener = (e) => {
      if (notificationsWrap && !notificationsWrap.contains(e.target)) {
        closeNotificationsPanel();
      }
    };
    setTimeout(() => document.addEventListener("click", notificationsOutsideListener), 0);
  }

  function escHtml(text) {
    const div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
  }

  function loadNotifications() {
    try {
      const raw = localStorage.getItem(UI_NOTIFICATIONS_STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveNotifications(items) {
    try {
      localStorage.setItem(UI_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }

  function ensureNotificationsList() {
    if (!notificationsPanel) return null;
    if (notificationsPanelList) return notificationsPanelList;
    notificationsPanelList = document.createElement("ul");
    notificationsPanelList.className = "home-notify-panel__list";
    notificationsPanelList.hidden = true;
    if (notificationsPanelEmpty && notificationsPanelEmpty.parentNode) {
      notificationsPanelEmpty.parentNode.insertBefore(notificationsPanelList, notificationsPanelEmpty);
    } else {
      notificationsPanel.appendChild(notificationsPanelList);
    }
    return notificationsPanelList;
  }

  function renderNotificationsPanel() {
    const list = ensureNotificationsList();
    if (!list || !notificationsPanelEmpty) return;
    const items = loadNotifications();
    list.innerHTML = "";
    if (!items.length) {
      list.hidden = true;
      notificationsPanelEmpty.hidden = false;
      return;
    }
    notificationsPanelEmpty.hidden = true;
    list.hidden = false;
    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "home-notify-panel__item";
      const title = document.createElement("p");
      title.className = "home-notify-panel__item-title";
      title.textContent = String(item.text || "");
      const time = document.createElement("p");
      time.className = "home-notify-panel__item-time";
      const date = Date.parse(String(item.ts || ""));
      time.textContent = Number.isFinite(date) ? new Date(date).toLocaleString() : "";
      li.append(title, time);
      list.appendChild(li);
    });
  }

  function pushUiNotification(text) {
    const clean = String(text || "").trim();
    if (!clean) return;
    const list = loadNotifications();
    list.unshift({ text: clean, ts: new Date().toISOString() });
    saveNotifications(list.slice(0, 24));
    renderNotificationsPanel();
  }

  window.pushUiNotification = pushUiNotification;

  function isUsableAvatarUrl(raw) {
    const value = String(raw || "").trim();
    if (!value || value.includes('"') || value.includes("'")) return false;
    return value.startsWith("data:image/") || /^https?:\/\//i.test(value) || value.startsWith("/");
  }

  function safeAvatarUrl(avatar, name, id) {
    if (typeof avatar === "string") {
      const t = avatar.trim();
      if (isUsableAvatarUrl(t)) return t;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(name) + String(id))}`;
  }

  function loadChats() {
    try {
      const raw = localStorage.getItem(CHATS_STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function normalizeChatId(v) {
    return String(v || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function saveChats(chats) {
    try {
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
    } catch {
      /* ignore */
    }
  }

  function appendHomePanelChat(entry) {
    if (typeof window.connectPerson === "function") {
      window.connectPerson(entry);
      return;
    }
    const id = normalizeChatId(entry && entry.id);
    if (!id) return;
    const name = String((entry && entry.name) || "").trim() || id;
    const preview = String((entry && entry.preview) || "").trim();
    const time = String((entry && entry.time) || "").trim();
    const avatar = String((entry && entry.avatar) || "").trim();
    let chats = loadChats().filter((c) => normalizeChatId(c.id) !== id);
    chats.unshift({ id, name, preview, time, avatar });
    saveChats(chats);
    if (messagesPanelList && messagesPanelEmpty) {
      renderMessagesPanel();
    }
  }

  window.removeHomePanelChatById = function (rawId) {
    if (typeof window.disconnectPerson === "function") {
      window.disconnectPerson(rawId);
      if (messagesPanelList && messagesPanelEmpty) {
        renderMessagesPanel();
      }
      return;
    }
    const id =
      typeof window.canonicalPeerId === "function"
        ? window.canonicalPeerId(rawId)
        : normalizeChatId(rawId);
    if (!id) return;
    const chats = loadChats().filter((c) => {
      const chatId =
        typeof window.canonicalPeerId === "function"
          ? window.canonicalPeerId(c.id)
          : normalizeChatId(c.id);
      return chatId !== id;
    });
    saveChats(chats);
    document.dispatchEvent(new CustomEvent("homechatsupdated"));
    if (messagesPanelList && messagesPanelEmpty) {
      renderMessagesPanel();
    }
  };

  window.appendHomePanelChat = appendHomePanelChat;
  window.openHomeMessagesPanel = function () {
    openMessagesPanel();
  };

  function renderMessagesPanel() {
    if (!messagesPanelList || !messagesPanelEmpty) return;
    const chats = loadChats();
    messagesPanelList.innerHTML = "";

    if (chats.length === 0) {
      messagesPanelList.hidden = true;
      messagesPanelEmpty.hidden = false;
      return;
    }

    messagesPanelEmpty.hidden = true;
    messagesPanelList.hidden = false;

    chats.forEach((chat, index) => {
      const id = chat.id != null ? String(chat.id) : `chat-${index}`;
      const slug = normalizeChatId(id) || `chat-${index}`;
      const name = chat.name || (typeof window.uiT === "function" ? window.uiT("js.chatDefault") : "Chat");
      const preview = chat.preview || "";
      const time = chat.time || "";
      const avatarUrl = safeAvatarUrl(chat.avatar, name, slug);

      const wrap = document.createElement("div");
      wrap.className = "home-msg-panel__chat-wrap";
      wrap.setAttribute("role", "listitem");

      const row = document.createElement("div");
      row.className = "home-msg-panel__chat";
      row.setAttribute("role", "button");
      row.tabIndex = 0;
      row.dataset.chatId = slug;
      row.innerHTML = `
        <img class="home-msg-panel__avatar" width="40" height="40" alt="" decoding="async" />
        <div class="home-msg-panel__chat-main">
          <span class="home-msg-panel__chat-name">${escHtml(name)}</span>
          <span class="home-msg-panel__chat-preview">${escHtml(preview)}</span>
        </div>
        ${time ? `<span class="home-msg-panel__chat-time">${escHtml(time)}</span>` : ""}
      `;

      const avatarImg = row.querySelector(".home-msg-panel__avatar");
      if (avatarImg) avatarImg.src = avatarUrl;

      function openChat() {
        const href =
          typeof window.messagingChatUrl === "function"
            ? window.messagingChatUrl(slug, "network")
            : `../chat/index.html?with=${encodeURIComponent(slug || "marcus")}`;
        window.location.href = href;
      }

      row.addEventListener("click", (e) => {
        e.stopPropagation();
        openChat();
      });
      row.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openChat();
        }
      });

      wrap.appendChild(row);
      messagesPanelList.appendChild(wrap);
    });
  }

  window.renderMessagesPanel = renderMessagesPanel;

  function openMessagesPanel() {
    if (!messagesPanel || !navMessages) return;
    closeNotificationsPanel();
    renderMessagesPanel();
    messagesPanel.hidden = false;
    navMessages.setAttribute("aria-expanded", "true");
    detachMessagesOutside();
    messagesOutsideListener = (e) => {
      if (messagesWrap && !messagesWrap.contains(e.target)) {
        closeMessagesPanel();
      }
    };
    setTimeout(() => document.addEventListener("click", messagesOutsideListener), 0);
  }

  function toggleNotificationsPanel() {
    if (!notificationsPanel) return;
    if (notificationsPanel.hidden) {
      openNotificationsPanel();
    } else {
      closeNotificationsPanel();
    }
  }

  function toggleMessagesPanel() {
    if (!messagesPanel) return;
    if (messagesPanel.hidden) {
      openMessagesPanel();
    } else {
      closeMessagesPanel();
    }
  }

  function ensureUiNoticeRoot() {
    let root = document.getElementById("uiNotice");
    if (root) return root;
    root = document.createElement("div");
    root.id = "uiNotice";
    root.style.position = "fixed";
    root.style.left = "50%";
    root.style.bottom = "22px";
    root.style.transform = "translateX(-50%)";
    root.style.padding = "10px 14px";
    root.style.borderRadius = "10px";
    root.style.background = "rgba(17,24,39,0.92)";
    root.style.color = "#fff";
    root.style.fontSize = "14px";
    root.style.fontWeight = "600";
    root.style.zIndex = "9999";
    root.style.opacity = "0";
    root.style.pointerEvents = "none";
    root.style.transition = "opacity .18s ease";
    document.body.appendChild(root);
    return root;
  }

  let noticeTimer = null;
  function showUiNotice(message) {
    const root = ensureUiNoticeRoot();
    root.textContent = String(message || "Действие выполнено");
    root.style.opacity = "1";
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => {
      root.style.opacity = "0";
    }, 1400);
  }

  window.showUiNotice = showUiNotice;

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest('a[href="#"]');
    if (!anchor) return;
    if (event.defaultPrevented) return;
    event.preventDefault();
    showUiNotice(anchor.dataset.uiPlaceholderMessage || "Этот раздел скоро будет доступен");
  });

  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-ui-placeholder-action]");
    if (!btn) return;
    if (event.defaultPrevented) return;
    event.preventDefault();
    showUiNotice(btn.dataset.uiPlaceholderAction || "Действие выполнено");
  });

  document.querySelectorAll('.home-messages__icon-btn[data-i18n-aria="widget.more"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      showUiNotice("Дополнительные действия появятся в следующем обновлении");
    });
  });

  document.querySelectorAll('.home-messages__icon-btn[data-i18n-aria="widget.compose"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = new URL("../chat/index.html", window.location.href);
      window.location.href = target.href;
    });
  });

  if (navNotifications) {
    navNotifications.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleNotificationsPanel();
    });
  }

  if (navMessages) {
    navMessages.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMessagesPanel();
    });
  }

  if (notificationsPanelClose) {
    notificationsPanelClose.addEventListener("click", (e) => {
      e.stopPropagation();
      closeNotificationsPanel();
    });
  }

  renderNotificationsPanel();

  if (messagesPanelClose) {
    messagesPanelClose.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMessagesPanel();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (notificationsPanel && !notificationsPanel.hidden) {
      closeNotificationsPanel();
    }
    if (messagesPanel && !messagesPanel.hidden) {
      closeMessagesPanel();
    }
  });

  const raw = localStorage.getItem("registeredAccount");
  if (!raw) return;

  let user;
  try {
    user = JSON.parse(raw);
  } catch {
    return;
  }

  const sidebarName = document.getElementById("sidebarName");
  const sidebarTitle = document.getElementById("sidebarTitle");
  const headerLabel = document.getElementById("headerProfileLabel");

  function applyRegisteredUserToDom() {
    const first = (user.firstName || "").trim();
    const last = (user.lastName || "").trim();
    const member = typeof window.uiT === "function" ? window.uiT("js.member") : "Member";
    const displayName = [first, last].filter(Boolean).join(" ") || user.userName || member;
    const un = (user.userName || "").trim();
    const title =
      un && typeof window.uiTmpl === "function"
        ? window.uiTmpl("js.profTitle", { u: un })
        : typeof window.uiT === "function"
          ? window.uiT("js.defaultRole")
          : "Junior UI/UX Designer — Microsoft";

    if (sidebarName) sidebarName.textContent = displayName;
    if (sidebarTitle) sidebarTitle.textContent = title;
    if (headerLabel) {
      headerLabel.textContent = displayName;
      headerLabel.removeAttribute("data-i18n");
    }

    const seed = encodeURIComponent(user.userName || user.email || displayName);
    const rawAvatar = typeof user.avatarDataUrl === "string" ? user.avatarDataUrl.trim() : "";
    const safeExternalAvatar = isUsableAvatarUrl(rawAvatar);
    const avatarUrl =
      rawAvatar.startsWith("data:image/") || safeExternalAvatar
        ? rawAvatar
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    ["sidebarAvatar", "headerAvatar", "composerAvatar"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.src = avatarUrl;
    });
  }

  applyRegisteredUserToDom();
  document.addEventListener("uilangchange", applyRegisteredUserToDom);
})();

(function globalSiteSearch() {
  const SEARCH_MODAL_ID = "globalSearchModal";
  let modal = null;
  let inputEl = null;
  let listEl = null;
  let emptyEl = null;

  function t(key, fallback) {
    return typeof window.uiT === "function" ? window.uiT(key) : fallback;
  }

  function searchItems() {
    const items = [
      { title: t("nav.home", "Главная"), href: "../home/index.html", kind: t("search.kindPage", "Страница") },
      { title: t("nav.network", "Сеть"), href: "../network/index.html", kind: t("search.kindPage", "Страница") },
      { title: t("nav.vacancies", "Вакансии"), href: "../vacancies/index.html", kind: t("search.kindPage", "Страница") },
      { title: t("nav.messages", "Сообщения"), href: "../chat/index.html", kind: t("search.kindPage", "Страница") },
      { title: t("user.myProfile", "Мой профиль"), href: "../profile/index.html?v=20260516-2", kind: t("search.kindPage", "Страница") },
    ];
    try {
      const apps = Object.values(JSON.parse(localStorage.getItem("vacancyApplications") || "{}"));
      apps.slice(0, 8).forEach((item) => {
        items.push({
          title: `${item.role || "Role"} — ${item.company || "Company"}`,
          href: "../vacancies/index.html",
          kind: t("search.kindApplication", "Отклик"),
        });
      });
    } catch {
      /* ignore */
    }
    return items;
  }

  function ensureModal() {
    if (modal) return;
    modal = document.createElement("div");
    modal.id = SEARCH_MODAL_ID;
    modal.className = "home-search-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="home-search-modal__backdrop" data-search-close></div>
      <section class="home-search-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="homeSearchTitle">
        <div class="home-search-modal__head">
          <h3 id="homeSearchTitle">${t("search.title", "Поиск по сайту")}</h3>
          <button type="button" class="home-search-modal__close" data-search-close aria-label="${t("nav.close", "Закрыть")}">×</button>
        </div>
        <input id="homeSearchInput" class="home-search-modal__input" type="search" placeholder="${t("search.placeholder", "Люди, компании, страницы")}" />
        <ul id="homeSearchList" class="home-search-modal__list"></ul>
        <p id="homeSearchEmpty" class="home-search-modal__empty" hidden>${t("search.empty", "Ничего не найдено")}</p>
      </section>
    `;
    document.body.appendChild(modal);
    inputEl = modal.querySelector("#homeSearchInput");
    listEl = modal.querySelector("#homeSearchList");
    emptyEl = modal.querySelector("#homeSearchEmpty");

    modal.querySelectorAll("[data-search-close]").forEach((el) => {
      el.addEventListener("click", closeSearch);
    });
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSearch();
    });
    inputEl.addEventListener("input", renderSearchResults);
  }

  function renderSearchResults() {
    if (!listEl || !inputEl || !emptyEl) return;
    const query = String(inputEl.value || "").trim().toLowerCase();
    const rows = searchItems().filter((item) => {
      if (!query) return true;
      return `${item.title} ${item.kind}`.toLowerCase().includes(query);
    });
    listEl.innerHTML = "";
    if (!rows.length) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;
    rows.forEach((item) => {
      const li = document.createElement("li");
      li.className = "home-search-modal__item";
      const a = document.createElement("a");
      a.href = item.href;
      a.className = "home-search-modal__link";
      a.innerHTML = `<span class="home-search-modal__name">${item.title}</span><span class="home-search-modal__kind">${item.kind}</span>`;
      li.appendChild(a);
      listEl.appendChild(li);
    });
  }

  function openSearch() {
    ensureModal();
    modal.hidden = false;
    if (typeof window.lockBodyScroll === "function") {
      window.lockBodyScroll();
    } else {
      document.body.style.overflow = "hidden";
    }
    inputEl.value = "";
    renderSearchResults();
    setTimeout(() => inputEl.focus({ preventScroll: true }), 0);
  }

  function closeSearch() {
    if (!modal) return;
    modal.hidden = true;
    if (typeof window.unlockBodyScroll === "function") {
      window.unlockBodyScroll();
    } else {
      document.body.style.overflow = "";
    }
  }

  document.querySelectorAll(".home-search").forEach((trigger) => {
    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-label", t("search.open", "Открыть поиск"));
    trigger.addEventListener("click", openSearch);
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openSearch();
      }
    });
  });
})();

function homeIsSameCommentAuthor(a, b) {
  return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
}

const HOME_COMMENT_DELETE_SVG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';

(function homeFeedComposer() {
  const FEED_KEY = "homeFeedPosts";
  const form = document.getElementById("homeComposerForm");
  const textarea = document.getElementById("homeComposerText");
  const postBtn = document.getElementById("homeComposerPostBtn");
  const container = document.getElementById("homeUserPosts");
  const photoBtn = document.getElementById("homeComposerPhotoBtn");
  const photoInput = document.getElementById("homeComposerPhotoInput");
  const photoPreview = document.getElementById("homeComposerPhotoPreview");
  const photoPreviewImg = document.getElementById("homeComposerPhotoPreviewImg");
  const photoRemove = document.getElementById("homeComposerPhotoRemove");
  if (!form || !textarea || !postBtn || !container) return;

  let pendingImage = null;

  function T(key) {
    return typeof window.uiT === "function" ? window.uiT(key) : key;
  }

  function newId(prefix) {
    return typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  }

  function resizeImageFileToJpeg(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let w = img.naturalWidth;
          let h = img.naturalHeight;
          const maxW = 1280;
          if (w > maxW) {
            h = Math.round((h * maxW) / w);
            w = maxW;
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("canvas"));
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          let q = 0.88;
          let url = canvas.toDataURL("image/jpeg", q);
          let approx = (url.length * 3) / 4;
          while (approx > 700000 && q > 0.45) {
            q -= 0.07;
            url = canvas.toDataURL("image/jpeg", q);
            approx = (url.length * 3) / 4;
          }
          resolve(url);
        };
        img.onerror = () => reject(new Error("img"));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error("read"));
      reader.readAsDataURL(file);
    });
  }

  function safeAvatarUrl(u) {
    const t = String(u || "").trim();
    if (t.startsWith("data:image/") || /^https?:\/\//i.test(t) || t.startsWith("/")) return t;
    return "https://api.dicebear.com/7.x/avataaars/svg?seed=user";
  }

  function formatTime(ts) {
    const t = Number(ts);
    const loc = typeof window.getUiLang === "function" && window.getUiLang() === "en" ? "en-US" : "ru-RU";
    if (!Number.isFinite(t) || t <= 0) return T("js.recently");
    const diff = (Date.now() - t) / 1000;
    if (diff < 45) return T("js.justNow");
    if (diff < 3600) {
      return typeof window.uiTmpl === "function"
        ? window.uiTmpl("js.minAgo", { n: String(Math.floor(diff / 60)) })
        : `${Math.floor(diff / 60)} min`;
    }
    if (diff < 86400) {
      return typeof window.uiTmpl === "function"
        ? window.uiTmpl("js.hourAgo", { n: String(Math.floor(diff / 3600)) })
        : `${Math.floor(diff / 3600)} h`;
    }
    return new Date(t).toLocaleDateString(loc, { month: "short", day: "numeric" });
  }

  function authorFromDom() {
    const nameEl = document.getElementById("sidebarName");
    const label = document.getElementById("headerProfileLabel");
    const imgEl = document.getElementById("composerAvatar");
    const you = T("js.you");
    const name =
      (nameEl && nameEl.textContent.trim()) || (label && label.textContent.trim()) || you;
    const avatar = (imgEl && imgEl.getAttribute("src")) || "";
    return { name, avatar };
  }

  function normalizePost(post) {
    const uid = () => newId("p");
    const id = post.id != null ? String(post.id).trim() : "";
    const rawComments = Array.isArray(post.comments) ? post.comments : [];
    const comments = rawComments
      .filter((cm) => cm && typeof cm === "object" && String(cm.text || "").trim())
      .map((cm) => ({
        id: String(cm.id != null && String(cm.id).trim() ? cm.id : newId("c")),
        text: String(cm.text).trim().slice(0, 500),
        authorName: String(cm.authorName || "").trim().slice(0, 120) || T("js.you"),
        createdAt: Number(cm.createdAt) || Date.now(),
      }));
    let likes = Number(post.likes);
    if (!Number.isFinite(likes) || likes < 0) likes = 0;
    likes = Math.floor(likes);
    return {
      ...post,
      id: id || uid(),
      text: typeof post.text === "string" ? post.text : "",
      imageDataUrl:
        typeof post.imageDataUrl === "string" && post.imageDataUrl.startsWith("data:")
          ? post.imageDataUrl
          : undefined,
      likes,
      liked: Boolean(post.liked),
      comments,
      commentsOpen: Boolean(post.commentsOpen),
    };
  }

  function postNeedsPersistMigration(post) {
    if (!post || typeof post !== "object") return true;
    if (post.id == null || !String(post.id).trim()) return true;
    if (!Array.isArray(post.comments)) return true;
    if (typeof post.likes !== "number" || Number.isNaN(post.likes)) return true;
    if (typeof post.liked !== "boolean") return true;
    if (post.commentsOpen != null && typeof post.commentsOpen !== "boolean") return true;
    return false;
  }

  function loadPosts() {
    try {
      const raw = localStorage.getItem(FEED_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];

      let needsSave = false;
      const posts = data
        .filter((post) => post && typeof post === "object")
        .map((post) => {
          if (postNeedsPersistMigration(post)) needsSave = true;
          return normalizePost(post);
        });

      const idSet = new Set();
      posts.forEach((p) => {
        const id = String(p.id || "").trim();
        if (!id || idSet.has(id)) {
          p.id = newId("p");
          needsSave = true;
        }
        idSet.add(String(p.id));
      });

      if (needsSave) savePosts(posts);
      return posts;
    } catch {
      return [];
    }
  }

  function savePosts(posts) {
    localStorage.setItem(FEED_KEY, JSON.stringify(posts));
  }

  function svgLike() {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("width", "18");
    s.setAttribute("height", "18");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", "currentColor");
    s.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"
    );
    s.appendChild(path);
    return s;
  }

  function svgComment() {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("width", "18");
    s.setAttribute("height", "18");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", "currentColor");
    s.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"
    );
    s.appendChild(path);
    return s;
  }

  function svgShare() {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("width", "18");
    s.setAttribute("height", "18");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", "currentColor");
    s.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"
    );
    s.appendChild(path);
    return s;
  }

  function svgSend() {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("width", "18");
    s.setAttribute("height", "18");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", "currentColor");
    s.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z");
    s.appendChild(path);
    return s;
  }

  function appendUserPostSocial(article, p, postId) {
    const footer = document.createElement("div");
    footer.className = "home-post__footer";

    const likeBtn = document.createElement("button");
    likeBtn.type = "button";
    likeBtn.className = "home-post__action" + (p.liked ? " home-post__action--liked" : "");
    likeBtn.setAttribute("aria-pressed", p.liked ? "true" : "false");
    likeBtn.append(svgLike());
    const likeLabel = document.createElement("span");
    likeLabel.className = "home-post__action-label";
    likeLabel.textContent = T("feed.like");
    const likeCount = document.createElement("span");
    likeCount.className = "home-post__action-count";
    likeCount.textContent = String(p.likes);
    likeCount.setAttribute("aria-label", T("feed.likeCountAria"));
    likeBtn.append(likeLabel, likeCount);

    const commentBtn = document.createElement("button");
    commentBtn.type = "button";
    commentBtn.className = "home-post__action home-post__action--comments";
    commentBtn.append(svgComment());
    const commentLabel = document.createElement("span");
    commentLabel.className = "home-post__action-label";
    commentLabel.textContent = T("feed.comment");
    const commentCount = document.createElement("span");
    commentCount.className = "home-post__action-count";
    commentCount.textContent = p.comments.length ? String(p.comments.length) : "";
    commentBtn.setAttribute("aria-expanded", p.commentsOpen ? "true" : "false");
    commentBtn.append(commentLabel, commentCount);

    const shareBtn = document.createElement("button");
    shareBtn.type = "button";
    shareBtn.className = "home-post__action";
    shareBtn.append(svgShare());
    const shareLabel = document.createElement("span");
    shareLabel.className = "home-post__action-label";
    shareLabel.textContent = T("feed.share");
    shareBtn.append(shareLabel);

    const sendBtn = document.createElement("button");
    sendBtn.type = "button";
    sendBtn.className = "home-post__action";
    sendBtn.append(svgSend());
    const sendLabel = document.createElement("span");
    sendLabel.className = "home-post__action-label";
    sendLabel.textContent = T("feed.send");
    sendBtn.append(sendLabel);

    footer.append(likeBtn, commentBtn, shareBtn, sendBtn);

    const commentsSection = document.createElement("section");
    commentsSection.className = "home-post__comments";
    commentsSection.hidden = !p.commentsOpen;
    commentsSection.setAttribute("aria-label", T("feed.commentsHeading"));

    const commentsHead = document.createElement("h3");
    commentsHead.className = "home-post__comments-head";
    commentsHead.textContent = T("feed.commentsHeading");

    const listEl = document.createElement("ul");
    listEl.className = "home-post__comment-list";

    const emptyEl = document.createElement("p");
    emptyEl.className = "home-post__comments-empty";
    emptyEl.textContent = T("feed.noComments");
    emptyEl.hidden = p.comments.length > 0;

    function renderCommentList(comments) {
      listEl.replaceChildren();
      const me = authorFromDom().name;
      comments.forEach((cm) => {
        const li = document.createElement("li");
        li.className = "home-post__comment";
        const top = document.createElement("div");
        top.className = "home-post__comment-top";
        const meta = document.createElement("div");
        meta.className = "home-post__comment-meta";
        const au = document.createElement("span");
        au.className = "home-post__comment-author";
        au.textContent = cm.authorName || T("js.you");
        const ti = document.createElement("span");
        ti.textContent = formatTime(cm.createdAt);
        meta.append(au, ti);
        top.appendChild(meta);
        if (homeIsSameCommentAuthor(cm.authorName, me)) {
          const del = document.createElement("button");
          del.type = "button";
          del.className = "home-post__comment-delete";
          del.setAttribute("aria-label", T("feed.deleteComment"));
          del.title = T("js.delete");
          del.innerHTML = HOME_COMMENT_DELETE_SVG;
          const cid = String(cm.id || "");
          del.addEventListener("click", () => {
            const posts = loadPosts();
            const i = posts.findIndex((x) => String(x.id || "").trim() === postId);
            if (i < 0) return;
            posts[i].comments = posts[i].comments.filter((c) => String(c.id || "") !== cid);
            savePosts(posts);
            renderFeed();
          });
          top.appendChild(del);
        }
        const body = document.createElement("div");
        body.className = "home-post__comment-body";
        body.textContent = cm.text;
        li.append(top, body);
        listEl.appendChild(li);
      });
    }

    renderCommentList(p.comments);

    const formEl = document.createElement("form");
    formEl.className = "home-post__comment-form";
    const inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.className = "home-post__comment-input";
    inputEl.maxLength = 500;
    inputEl.placeholder = T("feed.commentPh");
    inputEl.setAttribute("aria-label", T("feed.commentPh"));
    const submitEl = document.createElement("button");
    submitEl.type = "submit";
    submitEl.className = "home-post__comment-submit";
    submitEl.textContent = T("feed.commentPost");
    formEl.append(inputEl, submitEl);

    commentsSection.append(commentsHead, emptyEl, listEl, formEl);
    article.append(footer, commentsSection);

    likeBtn.addEventListener("click", () => {
      const posts = loadPosts();
      const i = posts.findIndex((x) => String(x.id || "").trim() === postId);
      if (i < 0) return;
      const cur = posts[i];
      if (cur.liked) {
        cur.liked = false;
        cur.likes = Math.max(0, (Number(cur.likes) || 0) - 1);
      } else {
        cur.liked = true;
        cur.likes = (Number(cur.likes) || 0) + 1;
      }
      savePosts(posts);
      renderFeed();
    });

    commentBtn.addEventListener("click", () => {
      const posts = loadPosts();
      const i = posts.findIndex((x) => String(x.id || "").trim() === postId);
      if (i < 0) return;
      const open = !posts[i].commentsOpen;
      posts[i].commentsOpen = open;
      savePosts(posts);
      commentsSection.hidden = !open;
      commentBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    formEl.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const text = inputEl.value.trim();
      if (!text) return;
      const { name } = authorFromDom();
      const posts = loadPosts();
      const i = posts.findIndex((x) => String(x.id || "").trim() === postId);
      if (i < 0) return;
      posts[i].comments.push({
        id: newId("c"),
        text,
        authorName: name,
        createdAt: Date.now(),
      });
      posts[i].commentsOpen = true;
      savePosts(posts);
      renderFeed();
    });
  }

  function renderFeed() {
    const posts = loadPosts().sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
    container.replaceChildren();

    posts.forEach((p) => {
      const article = document.createElement("article");
      article.className = "home-card home-post home-post--user";
      const postId = String(p.id || "").trim();
      article.dataset.postId = postId;

      const head = document.createElement("div");
      head.className = "home-post__head";

      const img = document.createElement("img");
      img.className = "home-post__avatar";
      img.width = 48;
      img.height = 48;
      img.alt = "";
      img.src = safeAvatarUrl(p.avatarUrl);

      const meta = document.createElement("div");
      meta.className = "home-post__meta";

      const nameP = document.createElement("p");
      nameP.className = "home-post__name";
      nameP.textContent = p.authorName || T("js.you");

      const subP = document.createElement("p");
      subP.className = "home-post__sub";
      subP.textContent = formatTime(p.createdAt);

      meta.append(nameP, subP);

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "home-post__delete";
      delBtn.setAttribute("aria-label", T("js.deletePost"));
      delBtn.title = T("js.delete");
      delBtn.innerHTML =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';

      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!postId) return;
        const next = loadPosts().filter((x) => String(x.id || "").trim() !== postId);
        savePosts(next);
        renderFeed();
      });

      head.append(img, meta, delBtn);
      article.appendChild(head);

      const textTrim = (p.text || "").trim();
      if (textTrim) {
        const textP = document.createElement("p");
        textP.className = "home-post__text home-post__text--multiline";
        textP.textContent = p.text || "";
        article.appendChild(textP);
      }

      if (p.imageDataUrl) {
        const media = document.createElement("div");
        media.className = "home-post__media";
        const mi = document.createElement("img");
        mi.src = p.imageDataUrl;
        mi.alt = "";
        media.appendChild(mi);
        article.appendChild(media);
      }

      appendUserPostSocial(article, p, postId);
      container.appendChild(article);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  function clearComposerPhoto() {
    pendingImage = null;
    if (photoInput) photoInput.value = "";
    if (photoPreviewImg) photoPreviewImg.removeAttribute("src");
    if (photoPreview) {
      photoPreview.hidden = true;
      photoPreview.classList.add("home-composer__preview--hidden");
    }
  }

  function syncPostButton() {
    const has = Boolean(textarea.value.trim() || pendingImage);
    postBtn.disabled = !has;
  }

  function publishFromComposer() {
    const text = textarea.value.trim();
    if (!text && !pendingImage) return;

    const { name, avatar } = authorFromDom();
    const post = {
      id: newId("p"),
      text,
      authorName: name,
      avatarUrl: avatar,
      createdAt: Date.now(),
      likes: 0,
      liked: false,
      comments: [],
      commentsOpen: false,
    };
    if (pendingImage) post.imageDataUrl = pendingImage;

    const posts = loadPosts();
    posts.push(normalizePost(post));
    savePosts(posts);
    textarea.value = "";
    clearComposerPhoto();
    syncPostButton();
    renderFeed();
    textarea.focus();
  }

  postBtn.addEventListener("click", () => {
    publishFromComposer();
  });

  textarea.addEventListener("input", syncPostButton);

  if (photoBtn && photoInput) {
    photoBtn.addEventListener("click", () => photoInput.click());
  }

  if (photoInput) {
    photoInput.addEventListener("change", () => {
      const file = photoInput.files && photoInput.files[0];
      photoInput.value = "";
      if (!file || !file.type.startsWith("image/")) return;
      resizeImageFileToJpeg(file)
        .then((dataUrl) => {
          pendingImage = dataUrl;
          if (photoPreviewImg) photoPreviewImg.src = dataUrl;
          if (photoPreview) {
            photoPreview.hidden = false;
            photoPreview.classList.remove("home-composer__preview--hidden");
          }
          syncPostButton();
        })
        .catch(() => {
          /* ignore */
        });
    });
  }

  if (photoRemove) {
    photoRemove.addEventListener("click", () => {
      clearComposerPhoto();
      syncPostButton();
    });
  }

  document.addEventListener("uilangchange", () => {
    renderFeed();
  });

  syncPostButton();
  renderFeed();
})();

(function homeStaticFeedSocial() {
  const STATIC_KEY = "homeFeedStaticSocial";
  const DEFAULTS = {
    "demo-1": { likes: 48, liked: false },
    "demo-2": { likes: 112, liked: false },
  };

  function T(key) {
    return typeof window.uiT === "function" ? window.uiT(key) : key;
  }

  function newId(prefix) {
    return typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  }

  function formatTime(ts) {
    const t = Number(ts);
    const loc = typeof window.getUiLang === "function" && window.getUiLang() === "en" ? "en-US" : "ru-RU";
    if (!Number.isFinite(t) || t <= 0) return T("js.recently");
    const diff = (Date.now() - t) / 1000;
    if (diff < 45) return T("js.justNow");
    if (diff < 3600) {
      return typeof window.uiTmpl === "function"
        ? window.uiTmpl("js.minAgo", { n: String(Math.floor(diff / 60)) })
        : `${Math.floor(diff / 60)} min`;
    }
    if (diff < 86400) {
      return typeof window.uiTmpl === "function"
        ? window.uiTmpl("js.hourAgo", { n: String(Math.floor(diff / 3600)) })
        : `${Math.floor(diff / 3600)} h`;
    }
    return new Date(t).toLocaleDateString(loc, { month: "short", day: "numeric" });
  }

  function readStore() {
    try {
      const raw = localStorage.getItem(STATIC_KEY);
      const o = raw ? JSON.parse(raw) : {};
      return o && typeof o === "object" ? o : {};
    } catch {
      return {};
    }
  }

  function writeStore(o) {
    localStorage.setItem(STATIC_KEY, JSON.stringify(o));
  }

  function getBundle(staticId) {
    const base = DEFAULTS[staticId] || { likes: 0, liked: false };
    const row = readStore()[staticId];
    const r = row && typeof row === "object" ? row : {};
    const rl = Number(r.likes);
    const likes = Number.isFinite(rl) ? Math.max(0, Math.floor(rl)) : base.likes;
    const rawComments = Array.isArray(r.comments) ? r.comments : [];
    const comments = rawComments
      .filter((cm) => cm && typeof cm === "object" && String(cm.text || "").trim())
      .map((cm) => ({
        id: String(cm.id != null && String(cm.id).trim() ? cm.id : newId("c")),
        text: String(cm.text).trim().slice(0, 500),
        authorName: String(cm.authorName || "").trim().slice(0, 120) || T("js.you"),
        createdAt: Number(cm.createdAt) || Date.now(),
      }));
    return {
      likes,
      liked: Boolean(r.liked),
      comments,
      commentsOpen: Boolean(r.commentsOpen),
    };
  }

  function saveBundle(staticId, bundle) {
    const all = readStore();
    all[staticId] = bundle;
    writeStore(all);
  }

  function authorFromDom() {
    const nameEl = document.getElementById("sidebarName");
    const label = document.getElementById("headerProfileLabel");
    const you = T("js.you");
    const name =
      (nameEl && nameEl.textContent.trim()) || (label && label.textContent.trim()) || you;
    return { name };
  }

  function svgLike() {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("width", "18");
    s.setAttribute("height", "18");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", "currentColor");
    s.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"
    );
    s.appendChild(path);
    return s;
  }

  function svgComment() {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("width", "18");
    s.setAttribute("height", "18");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", "currentColor");
    s.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"
    );
    s.appendChild(path);
    return s;
  }

  function svgShare() {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("width", "18");
    s.setAttribute("height", "18");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", "currentColor");
    s.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"
    );
    s.appendChild(path);
    return s;
  }

  function svgSend() {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("width", "18");
    s.setAttribute("height", "18");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", "currentColor");
    s.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z");
    s.appendChild(path);
    return s;
  }

  function mountStaticArticle(article) {
    const staticId = article.getAttribute("data-static-feed-id");
    if (!staticId) return;

    const oldFooter = article.querySelector(".home-post__footer");
    const oldComments = article.querySelector(".home-post__comments");
    if (oldFooter) oldFooter.remove();
    if (oldComments) oldComments.remove();

    let bundle = getBundle(staticId);

    const footer = document.createElement("div");
    footer.className = "home-post__footer";

    const likeBtn = document.createElement("button");
    likeBtn.type = "button";
    const likeLabel = document.createElement("span");
    likeLabel.className = "home-post__action-label";
    likeLabel.textContent = T("feed.like");
    const likeCount = document.createElement("span");
    likeCount.className = "home-post__action-count";
    likeCount.setAttribute("aria-label", T("feed.likeCountAria"));

    const commentBtn = document.createElement("button");
    commentBtn.type = "button";

    const commentLabel = document.createElement("span");
    commentLabel.className = "home-post__action-label";
    commentLabel.textContent = T("feed.comment");
    const commentCount = document.createElement("span");
    commentCount.className = "home-post__action-count";

    function paintLikeComment() {
      likeBtn.className = "home-post__action" + (bundle.liked ? " home-post__action--liked" : "");
      likeBtn.setAttribute("aria-pressed", bundle.liked ? "true" : "false");
      likeCount.textContent = String(bundle.likes);
      commentBtn.className = "home-post__action home-post__action--comments";
      commentCount.textContent = bundle.comments.length ? String(bundle.comments.length) : "";
      commentBtn.setAttribute("aria-expanded", bundle.commentsOpen ? "true" : "false");
    }

    likeBtn.append(svgLike(), likeLabel, likeCount);
    commentBtn.append(svgComment(), commentLabel, commentCount);

    const shareBtn = document.createElement("button");
    shareBtn.type = "button";
    shareBtn.className = "home-post__action";
    const shareLabel = document.createElement("span");
    shareLabel.className = "home-post__action-label";
    shareLabel.textContent = T("feed.share");
    shareBtn.append(svgShare(), shareLabel);

    const sendBtn = document.createElement("button");
    sendBtn.type = "button";
    sendBtn.className = "home-post__action";
    const sendLabel = document.createElement("span");
    sendLabel.className = "home-post__action-label";
    sendLabel.textContent = T("feed.send");
    sendBtn.append(svgSend(), sendLabel);

    footer.append(likeBtn, commentBtn, shareBtn, sendBtn);

    const commentsSection = document.createElement("section");
    commentsSection.className = "home-post__comments";
    commentsSection.hidden = !bundle.commentsOpen;
    commentsSection.setAttribute("aria-label", T("feed.commentsHeading"));

    const commentsHead = document.createElement("h3");
    commentsHead.className = "home-post__comments-head";
    commentsHead.textContent = T("feed.commentsHeading");

    const emptyEl = document.createElement("p");
    emptyEl.className = "home-post__comments-empty";
    emptyEl.textContent = T("feed.noComments");

    const listEl = document.createElement("ul");
    listEl.className = "home-post__comment-list";

    function renderList() {
      listEl.replaceChildren();
      const me = authorFromDom().name;
      bundle.comments.forEach((cm) => {
        const li = document.createElement("li");
        li.className = "home-post__comment";
        const top = document.createElement("div");
        top.className = "home-post__comment-top";
        const meta = document.createElement("div");
        meta.className = "home-post__comment-meta";
        const au = document.createElement("span");
        au.className = "home-post__comment-author";
        au.textContent = cm.authorName || T("js.you");
        const ti = document.createElement("span");
        ti.textContent = formatTime(cm.createdAt);
        meta.append(au, ti);
        top.appendChild(meta);
        if (homeIsSameCommentAuthor(cm.authorName, me)) {
          const del = document.createElement("button");
          del.type = "button";
          del.className = "home-post__comment-delete";
          del.setAttribute("aria-label", T("feed.deleteComment"));
          del.title = T("js.delete");
          del.innerHTML = HOME_COMMENT_DELETE_SVG;
          const cid = String(cm.id || "");
          del.addEventListener("click", () => {
            bundle = getBundle(staticId);
            bundle.comments = bundle.comments.filter((c) => String(c.id || "") !== cid);
            saveBundle(staticId, bundle);
            paintLikeComment();
            renderList();
          });
          top.appendChild(del);
        }
        const body = document.createElement("div");
        body.className = "home-post__comment-body";
        body.textContent = cm.text;
        li.append(top, body);
        listEl.appendChild(li);
      });
      emptyEl.hidden = bundle.comments.length > 0;
    }

    const formEl = document.createElement("form");
    formEl.className = "home-post__comment-form";
    const inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.className = "home-post__comment-input";
    inputEl.maxLength = 500;
    inputEl.placeholder = T("feed.commentPh");
    inputEl.setAttribute("aria-label", T("feed.commentPh"));
    const submitEl = document.createElement("button");
    submitEl.type = "submit";
    submitEl.className = "home-post__comment-submit";
    submitEl.textContent = T("feed.commentPost");
    formEl.append(inputEl, submitEl);

    commentsSection.append(commentsHead, emptyEl, listEl, formEl);
    article.append(footer, commentsSection);

    paintLikeComment();
    renderList();
    commentsSection.hidden = !bundle.commentsOpen;

    likeBtn.addEventListener("click", () => {
      bundle = getBundle(staticId);
      if (bundle.liked) {
        bundle.liked = false;
        bundle.likes = Math.max(0, bundle.likes - 1);
      } else {
        bundle.liked = true;
        bundle.likes += 1;
      }
      saveBundle(staticId, bundle);
      paintLikeComment();
    });

    commentBtn.addEventListener("click", () => {
      bundle = getBundle(staticId);
      bundle.commentsOpen = !bundle.commentsOpen;
      saveBundle(staticId, bundle);
      commentsSection.hidden = !bundle.commentsOpen;
      commentBtn.setAttribute("aria-expanded", bundle.commentsOpen ? "true" : "false");
    });

    formEl.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const text = inputEl.value.trim();
      if (!text) return;
      bundle = getBundle(staticId);
      bundle.comments.push({
        id: newId("c"),
        text,
        authorName: authorFromDom().name,
        createdAt: Date.now(),
      });
      bundle.commentsOpen = true;
      saveBundle(staticId, bundle);
      inputEl.value = "";
      paintLikeComment();
      renderList();
      commentsSection.hidden = false;
      commentBtn.setAttribute("aria-expanded", "true");
    });
  }

  function initStaticFeed() {
    document.querySelectorAll(".home-post[data-static-feed-id]").forEach((article) => {
      mountStaticArticle(article);
    });
  }

  initStaticFeed();
  document.addEventListener("uilangchange", initStaticFeed);
})();
