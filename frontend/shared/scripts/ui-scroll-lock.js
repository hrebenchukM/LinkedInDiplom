(function () {
  "use strict";

  function lockBodyScroll() {
    if (document.body.dataset.uiScrollLocked === "1") return;
    var scrollY = window.scrollY;
    document.body.dataset.uiScrollLocked = "1";
    document.body.dataset.uiScrollY = String(scrollY);
    document.body.style.position = "fixed";
    document.body.style.top = "-" + scrollY + "px";
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
  }

  function unlockBodyScroll() {
    if (document.body.dataset.uiScrollLocked !== "1") return;
    var scrollY = Number(document.body.dataset.uiScrollY || 0) || 0;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    delete document.body.dataset.uiScrollLocked;
    delete document.body.dataset.uiScrollY;
    window.scrollTo(0, scrollY);
  }

  window.lockBodyScroll = lockBodyScroll;
  window.unlockBodyScroll = unlockBodyScroll;
})();
