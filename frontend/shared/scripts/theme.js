(function () {
  const STORAGE_KEY = "uiTheme";

  function readTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") return stored;
    } catch {
      /* ignore */
    }
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    const t = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = t;
    document.documentElement.style.colorScheme = t === "dark" ? "dark" : "light";
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }

    const dark = t === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", dark ? "true" : "false");
    });
    if (typeof window.syncThemeToggleI18n === "function") {
      window.syncThemeToggleI18n();
    } else {
      document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
        const useLight = dark;
        btn.setAttribute("aria-label", useLight ? "Switch to light theme" : "Switch to dark theme");
        btn.setAttribute("title", useLight ? "Light theme" : "Dark theme");
      });
    }
  }

  function toggleTheme() {
    applyTheme(readTheme() === "dark" ? "light" : "dark");
  }

  function init() {
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const toggle = target.closest("[data-theme-toggle]");
      if (!toggle) return;
      event.preventDefault();
      toggleTheme();
    });
    applyTheme(readTheme());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
