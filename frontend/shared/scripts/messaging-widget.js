(function () {
  "use strict";

  var INBOX_TEMPLATE = [
    {
      id: "msg-sarah",
      peer: "sarahchen",
      name: "Sarah Chen",
      seed: "SarahChen",
      previewKey: "home.msgPreview1",
      timeKey: "home.msgTime1",
      tab: "sorted",
      unread: true,
    },
    {
      id: "msg-marcus",
      peer: "marcus",
      name: "Marcus Dias",
      seed: "MarcusDias",
      previewKey: "home.msgPreview2",
      timeKey: "home.msgTime2",
      tab: "sorted",
    },
    {
      id: "msg-elena",
      peer: "elenavolkov",
      name: "Elena Volkov",
      seed: "ElenaVolkov",
      previewKey: "home.msgPreview3",
      timeKey: "home.msgTime3",
      tab: "sorted",
      unread: true,
    },
    {
      id: "msg-duncan",
      peer: "duncanux",
      name: "Duncan Callahan",
      seed: "DuncanCallahan",
      previewKey: "home.msgPreview4",
      timeKey: "home.msgTime4",
      tab: "other",
    },
    {
      id: "msg-james",
      peer: "jamesleedev",
      name: "James Lee",
      seed: "JamesLee",
      previewKey: "home.msgPreview5",
      timeKey: "home.msgTime5",
      tab: "sorted",
    },
    {
      id: "msg-nina",
      peer: "ninapetrova",
      name: "Nina Petrova",
      seed: "NinaPetrova",
      previewKey: "home.msgPreview6",
      timeKey: "home.msgTime6",
      tab: "other",
      unread: true,
    },
    {
      id: "msg-timur",
      peer: "timuryamchuk",
      name: "Timur Yamchuk",
      seed: "TimurYamchuk",
      avatar: "/auth/assets/timur-yamchuk-avatar.png",
      previewKey: "home.msgPreview7",
      timeKey: "home.msgTime7",
      tab: "other",
    },
    {
      id: "msg-priya",
      peer: "priyadevops",
      name: "Priya Patel",
      seed: "PriyaPatel",
      previewKey: "home.msgPreview8",
      timeKey: "home.msgTime8",
      tab: "sorted",
    },
  ];

  function t(key, fallback) {
    return typeof window.uiT === "function" ? window.uiT(key) : fallback || key;
  }

  function shuffle(items) {
    var arr = items.slice();
    for (var i = arr.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  var messageOrder = shuffle(INBOX_TEMPLATE);

  function avatarUrl(item) {
    if (item.avatar) return item.avatar;
    return (
      "https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(item.seed || item.name)
    );
  }

  function getActiveTab() {
    var tabs = document.querySelectorAll("#homeMessagesWidgetBody .home-messages__tab");
    for (var i = 0; i < tabs.length; i += 1) {
      if (tabs[i].classList.contains("home-messages__tab--active")) {
        return i === 1 ? "other" : "sorted";
      }
    }
    return "sorted";
  }

  function getSearchQuery() {
    var input = document.querySelector("#homeMessagesWidgetBody .home-messages__search");
    return input && input.value ? input.value.trim().toLowerCase() : "";
  }

  function chatHref(peer) {
    return "../chat/index.html?with=" + encodeURIComponent(peer);
  }

  function buildRow(item, index) {
    var preview = item.preview != null ? String(item.preview) : t(item.previewKey, "");
    var time = item.time != null ? String(item.time) : t(item.timeKey, "");
    var unreadClass = item.unread ? " msg-row--unread" : "";
    return (
      '<a class="msg-row' +
      unreadClass +
      '" style="animation-delay:' +
      index * 0.07 +
      's" href="' +
      chatHref(item.peer) +
      '" data-peer="' +
      item.peer +
      '" aria-label="' +
      item.name +
      " — " +
      preview +
      '">' +
      '<img class="msg-row__avatar" src="' +
      avatarUrl(item) +
      '" width="40" height="40" alt="" loading="lazy" />' +
      '<span class="msg-row__body">' +
      '<span class="msg-row__head">' +
      '<strong class="msg-row__name">' +
      item.name +
      "</strong>" +
      '<time class="msg-row__time">' +
      time +
      "</time>" +
      "</span>" +
      '<span class="msg-row__preview">' +
      preview +
      "</span>" +
      "</span>" +
      (item.unread ? '<span class="msg-row__dot" aria-hidden="true"></span>' : "") +
      "</a>"
    );
  }

  function getConnectedInboxItems() {
    var load = typeof window.loadHomeChats === "function" ? window.loadHomeChats : function () {
      return [];
    };
    var slug = typeof window.slugPeerId === "function" ? window.slugPeerId : function (v) {
      return String(v || "").trim().toLowerCase();
    };
    return load().map(function (chat) {
      var peer = typeof window.canonicalPeerId === "function" ? window.canonicalPeerId(chat.id) : chat.id;
      if (!peer) return null;
      return {
        id: "msg-connected-" + peer,
        peer: peer,
        name: String(chat.name || peer).trim() || peer,
        seed: String(chat.name || peer).trim() || peer,
        avatar: chat.avatar || "",
        preview: String(chat.preview || t("network.newChatPreview", "Start the conversation…")).trim(),
        time: String(chat.time || t("js.chatNow", "Now")).trim(),
        tab: "connected",
        unread: true,
      };
    }).filter(Boolean);
  }

  function mergeInboxItems(tab, query) {
    var connected = getConnectedInboxItems().filter(function (item) {
      if (!query) return true;
      return (item.name + " " + item.preview).toLowerCase().indexOf(query) !== -1;
    });
    var connectedPeers = {};
    connected.forEach(function (item) {
      connectedPeers[item.peer] = true;
    });

    var staticItems = messageOrder.filter(function (item) {
      if (connectedPeers[item.peer]) return false;
      if (item.tab !== tab) return false;
      if (!query) return true;
      var preview = t(item.previewKey, "");
      return (item.name + " " + preview).toLowerCase().indexOf(query) !== -1;
    });

    if (tab === "other") {
      return connected.concat(staticItems);
    }
    return connected.concat(staticItems);
  }

  function renderWidgetList() {
    var list = document.getElementById("homeMessagesWidgetList");
    var empty = document.getElementById("homeMessagesWidgetListEmpty");
    if (!list) return;

    var tab = getActiveTab();
    var query = getSearchQuery();
    var items = mergeInboxItems(tab, query);

    list.innerHTML = items.map(buildRow).join("");
    list.hidden = items.length === 0;
    if (empty) {
      empty.hidden = items.length > 0;
      empty.textContent = t("home.msgNoResults", "No messages match your search.");
    }

    list.querySelectorAll(".msg-row").forEach(function (row) {
      row.addEventListener("click", function (event) {
        event.preventDefault();
        var peer = row.getAttribute("data-peer");
        if (peer) window.location.href = chatHref(peer);
      });
    });
  }

  function ensureWidgetStructure(body) {
    if (body.querySelector("#homeMessagesWidgetList")) return;

    var emptyBlock = body.querySelector(".home-messages__empty");
    var list = document.createElement("div");
    list.id = "homeMessagesWidgetList";
    list.className = "home-messages__list";
    list.setAttribute("role", "list");

    var emptyMsg = document.createElement("p");
    emptyMsg.id = "homeMessagesWidgetListEmpty";
    emptyMsg.className = "home-messages__list-empty";
    emptyMsg.hidden = true;
    emptyMsg.setAttribute("data-i18n", "home.msgNoResults");

    if (emptyBlock) {
      emptyBlock.replaceWith(list, emptyMsg);
    } else {
      var cta = body.querySelector(".home-messages__cta");
      if (cta) {
        body.insertBefore(emptyMsg, cta);
        body.insertBefore(list, emptyMsg);
      } else {
        body.appendChild(list);
        body.appendChild(emptyMsg);
      }
    }
  }

  function initMessagesWidget() {
    var body = document.getElementById("homeMessagesWidgetBody");
    if (!body || body.dataset.widgetLive === "1") return;

    ensureWidgetStructure(body);
    body.dataset.widgetLive = "1";

    document.querySelectorAll("#homeMessagesWidgetBody .home-messages__tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        window.setTimeout(renderWidgetList, 0);
      });
    });

    var search = body.querySelector(".home-messages__search");
    if (search) {
      search.addEventListener("input", renderWidgetList);
      search.addEventListener("search", renderWidgetList);
    }

    document.addEventListener("uilangchange", renderWidgetList);
    document.addEventListener("homechatsupdated", renderWidgetList);
    renderWidgetList();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMessagesWidget);
  } else {
    initMessagesWidget();
  }

  window.renderMessagesWidget = renderWidgetList;
})();
