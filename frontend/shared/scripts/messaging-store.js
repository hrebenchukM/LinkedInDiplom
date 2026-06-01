(function () {
  "use strict";

  var HOME_CHATS_KEY = "homeChats";
  var REMOVED_PEERS_KEY = "chatRemovedPeers";
  var ARCHIVED_PEERS_KEY = "chatArchivedPeers";
  var CONNECTED_PEERS_KEY = "networkConnectedPeers";

  /** Network handles / slugs that map to preset chat thread ids in chat/index.html */
  var PEER_ALIASES = {
    abramlipshutz: "abram",
    marcusdias: "marcus",
    alenacurtis: "alena",
  };

  function t(key, fallback) {
    return typeof window.uiT === "function" ? window.uiT(key) : fallback || key;
  }

  function slugPeerId(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/^@+/, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  function canonicalPeerId(value) {
    var slug = slugPeerId(value);
    if (!slug) return "";
    return PEER_ALIASES[slug] || slug;
  }

  function loadHomeChats() {
    try {
      var raw = localStorage.getItem(HOME_CHATS_KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      var seen = new Set();
      var normalized = [];
      data.forEach(function (chat) {
        var id = canonicalPeerId(chat && chat.id);
        if (!id || seen.has(id)) return;
        seen.add(id);
        normalized.push(Object.assign({}, chat, { id: id }));
      });
      return normalized;
    } catch {
      return [];
    }
  }

  function saveHomeChats(chats) {
    try {
      localStorage.setItem(HOME_CHATS_KEY, JSON.stringify(chats));
    } catch {
      /* ignore */
    }
  }

  function readConnectedSet() {
    try {
      var raw = localStorage.getItem(CONNECTED_PEERS_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr.map(canonicalPeerId).filter(Boolean) : []);
    } catch {
      return new Set();
    }
  }

  function writeConnectedSet(set) {
    try {
      localStorage.setItem(CONNECTED_PEERS_KEY, JSON.stringify([...set].filter(Boolean)));
    } catch {
      /* ignore */
    }
  }

  function clearArchivedPeer(id) {
    var slug = canonicalPeerId(id);
    if (!slug) return;
    try {
      var raw = localStorage.getItem(ARCHIVED_PEERS_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return;
      var next = arr
        .map(function (x) {
          return canonicalPeerId(x);
        })
        .filter(function (x) {
          return x && x !== slug;
        });
      localStorage.setItem(ARCHIVED_PEERS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function reconcileConnectedPeerState(id) {
    clearRemovedPeer(id);
    clearArchivedPeer(id);
  }

  function reconcileAllConnectedPeerState() {
    loadHomeChats().forEach(function (chat) {
      reconcileConnectedPeerState(chat && chat.id);
    });
    readConnectedSet().forEach(function (slug) {
      reconcileConnectedPeerState(slug);
    });
  }

  function clearRemovedPeer(id) {
    var slug = canonicalPeerId(id);
    if (!slug) return;
    try {
      var raw = localStorage.getItem(REMOVED_PEERS_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return;
      var next = arr
        .map(function (x) {
          return canonicalPeerId(x);
        })
        .filter(function (x) {
          return x && x !== slug;
        });
      localStorage.setItem(REMOVED_PEERS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function registerMessagingContact(entry) {
    var slug = canonicalPeerId(entry && entry.id);
    if (!slug) return slug;
    if (!window.MESSAGING_CONTACTS || typeof window.MESSAGING_CONTACTS !== "object") {
      window.MESSAGING_CONTACTS = {};
    }
    var existing = window.MESSAGING_CONTACTS[slug] || {};
    window.MESSAGING_CONTACTS[slug] = {
      name: String((entry && entry.name) || existing.name || slug).trim(),
      seed: String((entry && entry.seed) || existing.seed || entry.name || slug).trim(),
      avatar: String((entry && entry.avatar) || existing.avatar || "").trim(),
      phone: existing.phone || entry.phone || "",
      email: existing.email || entry.email || "",
      web: existing.web || entry.web || "",
      previewKey: "",
      timeKey: "",
    };
    return slug;
  }

  function notifyMessagingUpdated() {
    document.dispatchEvent(new CustomEvent("homechatsupdated"));
    if (typeof window.renderMessagesWidget === "function") {
      window.renderMessagesWidget();
    }
    if (typeof window.renderMessagesPanel === "function") {
      window.renderMessagesPanel();
    }
  }

  function connectPerson(entry) {
    var slug = registerMessagingContact(entry);
    if (!slug) return "";

    var name = String((entry && entry.name) || slug).trim() || slug;
    var preview = String((entry && entry.preview) || t("network.newChatPreview", "Start the conversation…")).trim();
    var time = String((entry && entry.time) || t("js.chatNow", "Now")).trim();
    var avatar = String((entry && entry.avatar) || "").trim();

    var chats = loadHomeChats().filter(function (c) {
      return canonicalPeerId(c.id) !== slug;
    });
    chats.unshift({ id: slug, name: name, preview: preview, time: time, avatar: avatar });
    saveHomeChats(chats);

    var connected = readConnectedSet();
    connected.add(slug);
    writeConnectedSet(connected);
    reconcileConnectedPeerState(slug);

    notifyMessagingUpdated();
    return slug;
  }

  function disconnectPerson(id) {
    var slug = canonicalPeerId(id);
    if (!slug) return false;

    var chats = loadHomeChats().filter(function (c) {
      return canonicalPeerId(c.id) !== slug;
    });
    saveHomeChats(chats);

    var connected = readConnectedSet();
    connected.delete(slug);
    writeConnectedSet(connected);

    notifyMessagingUpdated();
    return true;
  }

  function isPersonConnected(id) {
    var slug = canonicalPeerId(id);
    if (!slug) return false;
    try {
      var removedRaw = localStorage.getItem(REMOVED_PEERS_KEY);
      var removedArr = removedRaw ? JSON.parse(removedRaw) : [];
      if (
        Array.isArray(removedArr) &&
        removedArr.some(function (x) {
          return canonicalPeerId(x) === slug;
        })
      ) {
        return false;
      }
    } catch {
      /* ignore */
    }
    if (
      loadHomeChats().some(function (c) {
        return canonicalPeerId(c.id) === slug;
      })
    ) {
      return true;
    }
    return readConnectedSet().has(slug);
  }

  function chatUrl(peer, fromDir) {
    var base = fromDir === "chat" ? "./index.html" : "../chat/index.html";
    return base + "?with=" + encodeURIComponent(canonicalPeerId(peer) || "marcus");
  }

  window.PEER_ALIASES = PEER_ALIASES;
  window.slugPeerId = slugPeerId;
  window.canonicalPeerId = canonicalPeerId;
  window.loadHomeChats = loadHomeChats;
  window.connectPerson = connectPerson;
  window.disconnectPerson = disconnectPerson;
  window.isPersonConnected = isPersonConnected;
  window.messagingChatUrl = chatUrl;
  window.reconcileAllConnectedPeerState = reconcileAllConnectedPeerState;
})();
