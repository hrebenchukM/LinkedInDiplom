(function () {
  "use strict";

  var UNFOLLOWED_KEY = "networkUnfollowedHandles";

  var FOLLOWING = [
    {
      name: "Duncan Callahan",
      role: "Senior UX Researcher",
      handle: "DuncanUX",
      seed: "DuncanCallahan",
    },
    {
      name: "Sarah Chen",
      role: "Product Designer · Figma",
      handle: "SarahChen",
      seed: "SarahChen",
    },
    {
      name: "Marcus Dias",
      role: "Senior Design Manager · Microsoft",
      handle: "MarcusDias",
      seed: "MarcusDias",
    },
  ];

  function t(key, fallback) {
    return typeof window.uiT === "function" ? window.uiT(key, fallback) : fallback || key;
  }

  function readUnfollowedSet() {
    try {
      var raw = localStorage.getItem(UNFOLLOWED_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr.map(String) : []);
    } catch {
      return new Set();
    }
  }

  function writeUnfollowedSet(set) {
    try {
      localStorage.setItem(UNFOLLOWED_KEY, JSON.stringify([...set]));
    } catch {
      /* ignore */
    }
  }

  function chatPeerFor(person) {
    if (typeof window.canonicalPeerId === "function") {
      return window.canonicalPeerId(person.handle);
    }
    return String(person.handle || "").trim().toLowerCase();
  }

  var activeFollowing = FOLLOWING.filter(function (person) {
    return !readUnfollowedSet().has(person.handle);
  });

  var listEl = document.getElementById("networkFollowingList");
  var emptyEl = document.getElementById("networkFollowingEmpty");

  function avatarFor(person) {
    if (person.avatar) return person.avatar;
    return "https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(person.seed || person.name);
  }

  function buildFollowingRow(person) {
    return (
      '<article class="vac-following-row" data-following-handle="' +
      person.handle +
      '">' +
      '<img class="vac-following-row__avatar" src="' +
      avatarFor(person) +
      '" width="56" height="56" alt="" />' +
      '<div class="vac-following-row__body">' +
      '<h4 class="vac-following-row__name">' +
      person.name +
      "</h4>" +
      '<p class="vac-following-row__role">' +
      person.role +
      "</p>" +
      '<p class="vac-following-row__handle">@' +
      person.handle +
      "</p>" +
      "</div>" +
      '<div class="vac-following-row__actions">' +
      '<a class="vac-following-row__msg" href="../chat/index.html?with=' +
      encodeURIComponent(chatPeerFor(person)) +
      '" data-i18n="network.message">Message</a>' +
      '<button type="button" class="vac-following-row__unfollow" data-following-unfollow data-i18n="network.unfollow">Unfollow</button>' +
      "</div>" +
      "</article>"
    );
  }

  function renderFollowing() {
    if (!listEl) return;
    listEl.innerHTML = activeFollowing.map(buildFollowingRow).join("");
    if (typeof window.applyDomTranslations === "function") {
      window.applyDomTranslations();
    }
    if (emptyEl) emptyEl.hidden = activeFollowing.length > 0;
    if (listEl) listEl.hidden = activeFollowing.length === 0;
  }

  if (listEl) {
    listEl.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-following-unfollow]");
      if (!btn) return;
      var row = btn.closest(".vac-following-row");
      var handle = row && row.getAttribute("data-following-handle");
      if (!handle) return;
      var unfollowed = readUnfollowedSet();
      unfollowed.add(handle);
      writeUnfollowedSet(unfollowed);
      activeFollowing = activeFollowing.filter(function (p) {
        return p.handle !== handle;
      });
      renderFollowing();
    });
  }

  document.addEventListener("uilangchange", renderFollowing);

  renderFollowing();
})();
