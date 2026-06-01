(function () {
  try {
    if (sessionStorage.getItem("uiPageNav") === "1") {
      document.documentElement.classList.add("page-from-nav");
    }
  } catch {
    /* ignore */
  }
})();
