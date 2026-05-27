(function () {
  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }

  function normalizeId(v) {
    return String(v || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  const keys = {
    authSession: "authSession",
    registeredAccount: "registeredAccount",
    mockAuthUsers: "mockAuthUsers",
    homeFeedPosts: "homeFeedPosts",
    homeChats: "homeChats",
    uiNotifications: "uiNotifications",
    vacancyApplications: "vacancyApplications",
    vacancySavedJobs: "vacancySavedJobs",
    uiLang: "uiLang",
    uiTheme: "uiTheme",
  };

  const storage = {
    keys,
    readJson,
    writeJson,
    remove,
    normalizeId,
  };

  window.spaStorage = storage;
})();
