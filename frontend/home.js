(function () {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

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

  function safeAvatarUrl(avatar, name, id) {
    if (typeof avatar === "string") {
      const t = avatar.trim();
      if (/^https:\/\//i.test(t) && !t.includes('"') && !t.includes("'")) {
        return t;
      }
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
      const name = chat.name || (typeof window.uiT === "function" ? window.uiT("js.chatDefault") : "Chat");
      const preview = chat.preview || "";
      const time = chat.time || "";
      const avatarUrl = safeAvatarUrl(chat.avatar, name, id);

      const wrap = document.createElement("div");
      wrap.className = "home-msg-panel__chat-wrap";
      wrap.setAttribute("role", "listitem");

      const row = document.createElement("div");
      row.className = "home-msg-panel__chat";
      row.setAttribute("role", "button");
      row.tabIndex = 0;
      row.dataset.chatId = id;
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
        const slug = String(id)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");
        window.location.href = `./chat.html?with=${encodeURIComponent(slug || "marcus")}`;
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
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    ["sidebarAvatar", "headerAvatar", "composerAvatar"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.src = avatarUrl;
    });
  }

  applyRegisteredUserToDom();
  document.addEventListener("uilangchange", applyRegisteredUserToDom);
})();

(function homeFeedComposer() {
  const FEED_KEY = "homeFeedPosts";
  const form = document.getElementById("homeComposerForm");
  const textarea = document.getElementById("homeComposerText");
  const postBtn = document.getElementById("homeComposerPostBtn");
  const container = document.getElementById("homeUserPosts");
  if (!form || !textarea || !postBtn || !container) return;

  function T(key) {
    return typeof window.uiT === "function" ? window.uiT(key) : key;
  }

  function buildFooterHtml() {
    return `
    <div class="home-post__footer">
      <button type="button" class="home-post__action">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
        ${T("feed.like")}
      </button>
      <button type="button" class="home-post__action">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/></svg>
        ${T("feed.comment")}
      </button>
      <button type="button" class="home-post__action">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
        ${T("feed.share")}
      </button>
      <button type="button" class="home-post__action">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        ${T("feed.send")}
      </button>
    </div>
  `;
  }

  function safeAvatarUrl(u) {
    const t = String(u || "").trim();
    if (/^https:\/\/api\.dicebear\.com\//i.test(t)) return t;
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

  function loadPosts() {
    try {
      const raw = localStorage.getItem(FEED_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];

      const uid = () =>
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `p-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

      let needsSave = false;
      const posts = data
        .filter((post) => post && typeof post === "object")
        .map((post) => {
          const id = post.id != null ? String(post.id).trim() : "";
          if (id) return post;
          needsSave = true;
          return { ...post, id: uid() };
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

  function renderFeed() {
    const posts = loadPosts().sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
    container.replaceChildren();

    posts.forEach((p) => {
      const article = document.createElement("article");
      article.className = "home-card home-post home-post--user";
      article.dataset.postId = String(p.id || "");

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

      const postId = String(p.id || "").trim();
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!postId) return;
        const next = loadPosts().filter((x) => String(x.id || "").trim() !== postId);
        savePosts(next);
        renderFeed();
      });

      head.append(img, meta, delBtn);

      const textP = document.createElement("p");
      textP.className = "home-post__text home-post__text--multiline";
      textP.textContent = p.text || "";

      article.append(head, textP);

      const wrap = document.createElement("div");
      wrap.innerHTML = buildFooterHtml();
      const footerEl = wrap.firstElementChild;
      if (footerEl) article.appendChild(footerEl);

      container.appendChild(article);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  function publishFromComposer() {
    const text = textarea.value.trim();
    if (!text) return;

    const { name, avatar } = authorFromDom();
    const post = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}`,
      text,
      authorName: name,
      avatarUrl: avatar,
      createdAt: Date.now(),
    };

    const posts = loadPosts();
    posts.push(post);
    savePosts(posts);
    textarea.value = "";
    syncPostButton();
    renderFeed();
    textarea.focus();
  }

  postBtn.addEventListener("click", () => {
    publishFromComposer();
  });

  textarea.addEventListener("input", syncPostButton);

  document.addEventListener("uilangchange", () => {
    renderFeed();
  });

  syncPostButton();
  renderFeed();
})();

(function prefetchMainNav() {
  const prefetched = new Set();
  let timer = null;

  function queuePrefetch(urlString, delayMs) {
    const d = delayMs == null ? 80 : delayMs;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (prefetched.has(urlString)) return;
      prefetched.add(urlString);
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = urlString;
      document.head.appendChild(link);
    }, d);
  }

  document
    .querySelectorAll(".home-nav a.home-nav__item[href], a.home-logo[href], a.home-user[href]")
    .forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const clear = () => clearTimeout(timer);

      function prefetchFromAnchor(delayMs) {
        try {
          const url = new URL(a.href);
          if (url.origin !== window.location.origin) return;
          queuePrefetch(url.href, delayMs);
        } catch {
          /* ignore */
        }
      }

      a.addEventListener("pointerdown", (e) => {
        if (!e.isPrimary || e.button !== 0) return;
        prefetchFromAnchor(0);
      });

      a.addEventListener("mouseenter", () => {
        prefetchFromAnchor(80);
      });

      a.addEventListener("mouseleave", clear);
      a.addEventListener("blur", clear);
    });
})();

(function smoothPrimaryNav() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  if (typeof document.startViewTransition !== "function") {
    requestAnimationFrame(() => {
      document.body?.classList.add("home-soft-page-enter");
    });
    return;
  }

  document.addEventListener(
    "click",
    (e) => {
      const a = e.target.closest("a[href]");
      if (!a) return;

      const isPrimary =
        a.matches("a.home-logo") ||
        a.matches("a.home-user") ||
        (a.matches("a.home-nav__item") && a.closest(".home-nav"));

      if (!isPrimary) return;
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;

      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      const lastSeg = (url.pathname.split("/").pop() || "").toLowerCase();
      const looksLikeStaticPage =
        lastSeg.endsWith(".html") || lastSeg === "" || (lastSeg && !lastSeg.includes("."));

      if (!looksLikeStaticPage) return;

      e.preventDefault();
      try {
        document.startViewTransition(() => {
          window.location.assign(url.href);
        });
      } catch {
        window.location.assign(url.href);
      }
    },
    false
  );
})();
