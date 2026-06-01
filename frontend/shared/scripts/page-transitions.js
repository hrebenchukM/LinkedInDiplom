(function () {
  "use strict";

  var STORAGE_KEY = "uiPageNav";
  var EXIT_MS = 380;
  var MAIN_PAGE = /\/(?:home|network|vacancies|chat)\/index\.html$/i;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var exiting = false;

  function isMainAppLink(anchor) {
    try {
      if (!anchor || anchor.tagName !== "A") return false;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return false;
      var url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return false;
      if (!MAIN_PAGE.test(url.pathname)) return false;
      if (url.pathname === window.location.pathname && url.search === window.location.search && !url.hash) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  function ensureOverlay() {
    var overlay = document.querySelector(".page-transition-overlay");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.className = "page-transition-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = '<div class="page-transition-overlay__glow"></div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function navigateWithTransition(url) {
    if (reducedMotion || exiting) {
      window.location.href = url;
      return;
    }

    exiting = true;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }

    document.documentElement.classList.add("page-exit");
    var overlay = ensureOverlay();
    requestAnimationFrame(function () {
      overlay.classList.add("page-transition-overlay--active");
    });

    window.setTimeout(function () {
      window.location.href = url;
    }, EXIT_MS);
  }

  function runEnter() {
    if (reducedMotion) {
      document.documentElement.classList.remove("page-from-nav");
      return;
    }

    var fromNav = document.documentElement.classList.contains("page-from-nav");

    function startEnter() {
      document.documentElement.classList.remove("page-from-nav");
      document.documentElement.classList.add("page-enter-stage");
      window.setTimeout(function () {
        document.documentElement.classList.remove("page-enter-stage");
      }, 980);
    }

    if (fromNav) {
      requestAnimationFrame(function () {
        requestAnimationFrame(startEnter);
      });
      return;
    }

    document.documentElement.classList.add("page-enter-soft");
    window.setTimeout(function () {
      document.documentElement.classList.remove("page-enter-soft");
    }, 720);
  }

  function waitForHomeRoot(callback) {
    var root = document.getElementById("root");
    if (!root) {
      callback();
      return;
    }
    if (root.querySelector(".home-root")) {
      callback();
      return;
    }

    var done = false;
    function finish() {
      if (done) return;
      done = true;
      observer.disconnect();
      callback();
    }

    var observer = new MutationObserver(function () {
      if (root.querySelector(".home-root")) finish();
    });
    observer.observe(root, { childList: true, subtree: true });
    window.setTimeout(finish, 3200);
  }

  function bindNavigation() {
    document.addEventListener("click", function (event) {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (event.button !== 0) return;

      var anchor = event.target.closest("a");
      if (!isMainAppLink(anchor)) return;

      event.preventDefault();
      navigateWithTransition(anchor.href);
    });
  }

  function bindPrefetch() {
    var prefetched = new Set();
    var timer = null;

    function queuePrefetch(urlString, delayMs) {
      var delay = delayMs == null ? 80 : delayMs;
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (prefetched.has(urlString)) return;
        prefetched.add(urlString);
        var link = document.createElement("link");
        link.rel = "prefetch";
        link.href = urlString;
        document.head.appendChild(link);
      }, delay);
    }

    document.querySelectorAll(".home-nav a.home-nav__item[href], a.home-logo[href]").forEach(function (anchor) {
      var href = anchor.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;

      anchor.addEventListener("pointerdown", function (event) {
        if (!event.isPrimary || event.button !== 0) return;
        try {
          queuePrefetch(new URL(href, window.location.href).href, 0);
        } catch {
          /* ignore */
        }
      });

      anchor.addEventListener("mouseenter", function () {
        try {
          queuePrefetch(new URL(href, window.location.href).href, 80);
        } catch {
          /* ignore */
        }
      });

      anchor.addEventListener("mouseleave", function () {
        clearTimeout(timer);
      });
    });
  }

  function init() {
    bindNavigation();
    bindPrefetch();
    waitForHomeRoot(runEnter);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
