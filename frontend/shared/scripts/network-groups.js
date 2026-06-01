(function () {
  "use strict";

  var STORAGE_KEY = "networkGroupChats";
  var activeGroupId = null;

  var GROUPS = [
    {
      id: "ux-design-hub",
      nameKey: "network.groupUxName",
      nameFallback: "UI/UX Design Hub",
      descKey: "network.groupUxDesc",
      descFallback: "Design critiques, Figma tips, and portfolio feedback.",
      members: [
        { name: "Sarah Chen", seed: "SarahChen" },
        { name: "Duncan Callahan", seed: "DuncanCallahan" },
        { name: "David Jonson", seed: "DavidJonson" },
      ],
      seed: "UxDesignHub",
      seedMessages: [
        {
          id: "m1",
          author: "Sarah Chen",
          authorSeed: "SarahChen",
          out: false,
          textKey: "network.groupUxMsg1",
          textFallback: "Anyone free for a quick design critique at 3pm?",
        },
        {
          id: "m2",
          author: "Duncan Callahan",
          authorSeed: "DuncanCallahan",
          out: false,
          textKey: "network.groupUxMsg2",
          textFallback: "I can join — share the Figma link here.",
        },
      ],
      replyPool: [
        { author: "Sarah Chen", authorSeed: "SarahChen", textKey: "network.groupUxReply1", textFallback: "Great point — I'll update the mockups." },
        { author: "David Jonson", authorSeed: "DavidJonson", textKey: "network.groupUxReply2", textFallback: "Thanks! Let's sync on this tomorrow." },
      ],
    },
    {
      id: "frontend-circle",
      nameKey: "network.groupFeName",
      nameFallback: "Frontend Circle",
      descKey: "network.groupFeDesc",
      descFallback: "React, TypeScript, and code review for UI engineers.",
      members: [
        { name: "James Lee", seed: "JamesLee" },
        { name: "Elena Volkov", seed: "ElenaVolkov" },
        { name: "Alex Kim", seed: "AlexKim" },
      ],
      seed: "FrontendCircle",
      seedMessages: [
        {
          id: "m1",
          author: "James Lee",
          authorSeed: "JamesLee",
          out: false,
          textKey: "network.groupFeMsg1",
          textFallback: "Pushed a PR for the new filter component — reviews welcome.",
        },
        {
          id: "m2",
          author: "Elena Volkov",
          authorSeed: "ElenaVolkov",
          out: false,
          textKey: "network.groupFeMsg2",
          textFallback: "Left a few comments on accessibility — overall looks solid.",
        },
      ],
      replyPool: [
        { author: "Alex Kim", authorSeed: "AlexKim", textKey: "network.groupFeReply1", textFallback: "Merged — thanks for the quick review!" },
        { author: "James Lee", authorSeed: "JamesLee", textKey: "network.groupFeReply2", textFallback: "I'll pick that up in the next sprint." },
      ],
    },
  ];

  var listEl = document.getElementById("networkGroupsList");
  var chatEl = document.getElementById("networkGroupChat");
  var chatTitleEl = document.getElementById("networkGroupChatTitle");
  var chatMetaEl = document.getElementById("networkGroupChatMeta");
  var chatAvatarsEl = document.getElementById("networkGroupChatAvatars");
  var messagesEl = document.getElementById("networkGroupChatMessages");
  var formEl = document.getElementById("networkGroupChatForm");
  var inputEl = document.getElementById("networkGroupChatInput");

  function t(key, fallback) {
    return typeof window.uiT === "function" ? window.uiT(key, fallback) : fallback || key;
  }

  function tmpl(key, vars, fallback) {
    return typeof window.uiTmpl === "function" ? window.uiTmpl(key, vars) : fallback || key;
  }

  function esc(text) {
    var d = document.createElement("div");
    d.textContent = text == null ? "" : String(text);
    return d.innerHTML;
  }

  function avatarUrl(seed) {
    return "https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(seed || "group");
  }

  function groupById(id) {
    return GROUPS.find(function (g) {
      return g.id === id;
    });
  }

  function loadAllStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveAllStored(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }

  function resolveMessageText(msg) {
    if (msg.text) return msg.text;
    return t(msg.textKey, msg.textFallback || "");
  }

  function seedMessagesForGroup(group) {
    return (group.seedMessages || []).map(function (m) {
      return {
        id: m.id,
        author: m.author,
        authorSeed: m.authorSeed,
        out: !!m.out,
        text: t(m.textKey, m.textFallback || ""),
        ts: Date.now() - 3600000,
      };
    });
  }

  function getGroupMessages(groupId) {
    var stored = loadAllStored();
    if (Array.isArray(stored[groupId]) && stored[groupId].length) {
      return stored[groupId];
    }
    var group = groupById(groupId);
    if (!group) return [];
    var seeded = seedMessagesForGroup(group);
    stored[groupId] = seeded;
    saveAllStored(stored);
    return seeded;
  }

  function persistGroupMessages(groupId, messages) {
    var stored = loadAllStored();
    stored[groupId] = messages;
    saveAllStored(stored);
  }

  function groupDisplayName(group) {
    return t(group.nameKey, group.nameFallback || group.id);
  }

  function groupDescription(group) {
    return t(group.descKey, group.descFallback || "");
  }

  function lastPreview(groupId) {
    var msgs = getGroupMessages(groupId);
    if (!msgs.length) return t("network.groupNoMessages", "No messages yet");
    var last = msgs[msgs.length - 1];
    var text = last.text || "";
    if (last.out) text = t("network.groupYouPrefix", "You") + ": " + text;
    else if (last.author) text = last.author + ": " + text;
    return text.length > 52 ? text.slice(0, 52) + "…" : text;
  }

  function buildMemberStack(members) {
    return (members || [])
      .slice(0, 3)
      .map(function (m) {
        return (
          '<img class="vac-group-card__member" src="' +
          avatarUrl(m.seed) +
          '" width="24" height="24" alt="" title="' +
          esc(m.name) +
          '" />'
        );
      })
      .join("");
  }

  function renderGroupList() {
    if (!listEl) return;
    listEl.innerHTML = GROUPS.map(function (group) {
      var active = group.id === activeGroupId;
      return (
        '<button type="button" class="vac-group-card' +
        (active ? " vac-group-card--active" : "") +
        '" data-group-id="' +
        group.id +
        '">' +
        '<img class="vac-group-card__icon" src="' +
        avatarUrl(group.seed) +
        '" width="44" height="44" alt="" />' +
        '<span class="vac-group-card__body">' +
        '<span class="vac-group-card__name">' +
        esc(groupDisplayName(group)) +
        "</span>" +
        '<span class="vac-group-card__preview">' +
        esc(lastPreview(group.id)) +
        "</span>" +
        '<span class="vac-group-card__members">' +
        buildMemberStack(group.members) +
        '<span class="vac-group-card__count">' +
        tmpl("network.groupMemberCount", { count: String(group.members.length) }, group.members.length + " members") +
        "</span></span></span></button>"
      );
    }).join("");
  }

  function renderChatHeader(group) {
    if (!group) return;
    if (chatTitleEl) chatTitleEl.textContent = groupDisplayName(group);
    if (chatMetaEl) chatMetaEl.textContent = groupDescription(group);
    if (chatAvatarsEl) {
      chatAvatarsEl.innerHTML = (group.members || [])
        .map(function (m) {
          return '<img src="' + avatarUrl(m.seed) + '" width="28" height="28" alt="" title="' + esc(m.name) + '" />';
        })
        .join("");
    }
  }

  function nowLabel() {
    return t("js.chatNow", "Now");
  }

  function formatTime(ts) {
    if (!ts) return nowLabel();
    var diff = (Date.now() - ts) / 1000;
    if (diff < 60) return nowLabel();
    if (diff < 3600) {
      return tmpl("js.minAgo", { n: String(Math.floor(diff / 60)) }, Math.floor(diff / 60) + " min");
    }
    return tmpl("js.hourAgo", { n: String(Math.floor(diff / 3600)) }, Math.floor(diff / 3600) + " hr");
  }

  function renderMessages(groupId) {
    if (!messagesEl) return;
    var messages = getGroupMessages(groupId);
    messagesEl.innerHTML = messages
      .map(function (msg) {
        var cls = msg.out ? "vac-group-chat__msg vac-group-chat__msg--out" : "vac-group-chat__msg vac-group-chat__msg--in";
        var inner =
          msg.out
            ? '<div class="vac-group-chat__bubble">' +
              esc(msg.text) +
              '</div><div class="vac-group-chat__time">' +
              esc(formatTime(msg.ts)) +
              "</div>"
            : '<img class="vac-group-chat__msg-avatar" src="' +
              avatarUrl(msg.authorSeed) +
              '" width="28" height="28" alt="" />' +
              '<div><div class="vac-group-chat__author">' +
              esc(msg.author) +
              '</div><div class="vac-group-chat__bubble">' +
              esc(msg.text) +
              '</div><div class="vac-group-chat__time">' +
              esc(formatTime(msg.ts)) +
              "</div></div>";
        return '<div class="' + cls + '">' + inner + "</div>";
      })
      .join("");
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function selectGroup(groupId) {
    var group = groupById(groupId);
    if (!group) return;
    activeGroupId = groupId;
    renderGroupList();
    renderChatHeader(group);
    renderMessages(groupId);
    if (chatEl) chatEl.hidden = false;
    if (inputEl) inputEl.focus();
  }

  function appendMessage(groupId, msg) {
    var messages = getGroupMessages(groupId);
    messages.push(msg);
    persistGroupMessages(groupId, messages);
    renderMessages(groupId);
    renderGroupList();
  }

  function maybeMockReply(group) {
    if (!group || !group.replyPool || !group.replyPool.length) return;
    var pick = group.replyPool[Math.floor(Math.random() * group.replyPool.length)];
    window.setTimeout(function () {
      appendMessage(group.id, {
        id: "r-" + Date.now(),
        author: pick.author,
        authorSeed: pick.authorSeed,
        out: false,
        text: t(pick.textKey, pick.textFallback || ""),
        ts: Date.now(),
      });
    }, 1200 + Math.random() * 800);
  }

  function sendMessage(text) {
    if (!activeGroupId || !text) return;
    appendMessage(activeGroupId, {
      id: "u-" + Date.now(),
      author: t("network.groupYou", "You"),
      out: true,
      text: text,
      ts: Date.now(),
    });
    maybeMockReply(groupById(activeGroupId));
  }

  if (listEl) {
    listEl.addEventListener("click", function (e) {
      var card = e.target.closest("[data-group-id]");
      if (!card) return;
      selectGroup(card.getAttribute("data-group-id"));
    });
  }

  if (formEl && inputEl) {
    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = inputEl.value.trim();
      if (!text) return;
      sendMessage(text);
      inputEl.value = "";
      inputEl.focus();
    });
  }

  document.addEventListener("uilangchange", function () {
    renderGroupList();
    if (activeGroupId) {
      renderChatHeader(groupById(activeGroupId));
      renderMessages(activeGroupId);
    }
  });

  window.initNetworkGroupsView = function () {
    if (!activeGroupId && GROUPS.length) selectGroup(GROUPS[0].id);
    else if (activeGroupId) selectGroup(activeGroupId);
  };
})();
