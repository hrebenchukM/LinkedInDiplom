(function () {
  "use strict";

  function t(key, fallback) {
    return typeof window.uiT === "function" ? window.uiT(key, fallback) : fallback || key;
  }

  function tmpl(key, vars, fallback) {
    return typeof window.uiTmpl === "function" ? window.uiTmpl(key, vars) : fallback || key;
  }

  const searchInput = document.getElementById("networkPeopleSearch");
  const grid = document.getElementById("networkPeopleGrid");
  const emptyEl = document.getElementById("networkPeopleEmpty");
  const statsEl = document.getElementById("networkPeopleStats");
  const headingEl = document.getElementById("networkPeopleHeading");

  function getCards() {
    return grid ? Array.from(grid.querySelectorAll(".vac-person[data-network-person]")) : [];
  }

  function applyNetworkSearch() {
    if (!grid) return;
    const query = (searchInput && searchInput.value.trim().toLowerCase()) || "";
    const cards = getCards();
    let visible = 0;

    cards.forEach((card) => {
      const keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
      const text = card.textContent.toLowerCase();
      const blob = keywords + " " + text;
      const match = !query || blob.includes(query);
      card.hidden = !match;
      if (match) visible += 1;
    });

    if (emptyEl) emptyEl.hidden = visible > 0 || cards.length === 0;
    if (statsEl) {
      if (query) {
        statsEl.textContent = tmpl("network.searchStats", { visible: visible, total: cards.length }, visible + " / " + cards.length);
        statsEl.hidden = false;
      } else {
        statsEl.textContent = "";
        statsEl.hidden = true;
      }
    }
    if (headingEl) {
      headingEl.textContent = query
        ? t("network.searchResultsHeading", "Search results")
        : t("network.peopleHeading", "People in UI/UX design you may know");
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyNetworkSearch);
    searchInput.addEventListener("search", applyNetworkSearch);
  }

  document.addEventListener("networkpeople rendered", applyNetworkSearch);

  document.addEventListener("uilangchange", () => {
    applyNetworkSearch();
  });

  applyNetworkSearch();
})();
