(function () {
  "use strict";

  var FOLLOWED_KEY = "networkPagesFollowed";

  var PAGES = [
    {
      id: "figma",
      name: "Figma",
      industryKey: "network.pageIndustryDesign",
      industryFallback: "Design · Software",
      seed: "Figma",
      followersKey: "network.pageFollowers124",
      followersFallback: "124K followers",
      descKey: "network.pageFigmaDesc",
      descFallback: "The collaborative interface design tool for teams building products together.",
      updateKey: "network.pageFigmaUpdate",
      updateFallback: "New: Dev Mode updates and improved design tokens workflow.",
    },
    {
      id: "microsoft",
      name: "Microsoft",
      industryKey: "network.pageIndustryTech",
      industryFallback: "Technology",
      seed: "Microsoft",
      followersKey: "network.pageFollowers22m",
      followersFallback: "22M followers",
      descKey: "network.pageMicrosoftDesc",
      descFallback: "Empowering every person and organization on the planet to achieve more.",
      updateKey: "network.pageMicrosoftUpdate",
      updateFallback: "We're hiring across Azure, Copilot, and design systems teams.",
    },
    {
      id: "stripe",
      name: "Stripe",
      industryKey: "network.pageIndustryFintech",
      industryFallback: "Financial technology",
      seed: "Stripe",
      followersKey: "network.pageFollowers890",
      followersFallback: "890K followers",
      descKey: "network.pageStripeDesc",
      descFallback: "Financial infrastructure for the internet — payments, billing, and more.",
      updateKey: "network.pageStripeUpdate",
      updateFallback: "Stripe Sessions 2026 registration is now open.",
    },
    {
      id: "atlassian",
      name: "Atlassian",
      industryKey: "network.pageIndustrySoftware",
      industryFallback: "Software",
      seed: "Atlassian",
      followersKey: "network.pageFollowers1m",
      followersFallback: "1.2M followers",
      descKey: "network.pageAtlassianDesc",
      descFallback: "Tools like Jira, Confluence, and Trello for agile teams worldwide.",
      updateKey: "network.pageAtlassianUpdate",
      updateFallback: "Tips for running effective sprint retrospectives with remote teams.",
    },
    {
      id: "datadog",
      name: "Datadog",
      industryKey: "network.pageIndustryDevops",
      industryFallback: "Cloud monitoring",
      seed: "Datadog",
      followersKey: "network.pageFollowers420",
      followersFallback: "420K followers",
      descKey: "network.pageDatadogDesc",
      descFallback: "Modern monitoring and security platform for cloud-scale applications.",
      updateKey: "network.pageDatadogUpdate",
      updateFallback: "Watch our webinar on SRE best practices for Kubernetes.",
    },
  ];

  var listEl = document.getElementById("networkPagesList");
  var followedSet = readFollowed();

  function t(key, fallback) {
    return typeof window.uiT === "function" ? window.uiT(key, fallback) : fallback || key;
  }

  function esc(text) {
    var d = document.createElement("div");
    d.textContent = text == null ? "" : String(text);
    return d.innerHTML;
  }

  function logoUrl(seed) {
    return "https://api.dicebear.com/7.x/shapes/svg?seed=" + encodeURIComponent(seed || "page");
  }

  function readFollowed() {
    try {
      var raw = localStorage.getItem(FOLLOWED_KEY);
      var arr = raw ? JSON.parse(raw) : null;
      if (Array.isArray(arr) && arr.length) return new Set(arr);
    } catch {
      /* ignore */
    }
    return new Set(["figma", "microsoft", "stripe"]);
  }

  function writeFollowed() {
    try {
      localStorage.setItem(FOLLOWED_KEY, JSON.stringify([...followedSet]));
    } catch {
      /* ignore */
    }
  }

  function buildPageCard(page) {
    var following = followedSet.has(page.id);
    return (
      '<article class="vac-page-card" data-page-id="' +
      page.id +
      '">' +
      '<img class="vac-page-card__logo" src="' +
      logoUrl(page.seed) +
      '" width="56" height="56" alt="" />' +
      '<div class="vac-page-card__body">' +
      '<div class="vac-page-card__head">' +
      '<h4 class="vac-page-card__name">' +
      esc(page.name) +
      "</h4>" +
      '<span class="vac-page-card__followers">' +
      esc(t(page.followersKey, page.followersFallback)) +
      "</span></div>" +
      '<p class="vac-page-card__industry">' +
      esc(t(page.industryKey, page.industryFallback)) +
      "</p>" +
      '<p class="vac-page-card__desc">' +
      esc(t(page.descKey, page.descFallback)) +
      "</p>" +
      '<p class="vac-page-card__update"><span data-i18n="network.pageLatest">Latest</span>: ' +
      esc(t(page.updateKey, page.updateFallback)) +
      "</p></div>" +
      '<button type="button" class="vac-page-card__follow' +
      (following ? " vac-page-card__follow--active" : "") +
      '" data-page-follow="' +
      page.id +
      '">' +
      esc(following ? t("network.pageFollowing", "Following") : t("network.pageFollow", "Follow")) +
      "</button></article>"
    );
  }

  function renderPages() {
    if (!listEl) return;
    listEl.innerHTML = PAGES.map(buildPageCard).join("");
    if (typeof window.applyDomTranslations === "function") {
      window.applyDomTranslations();
    }
  }

  if (listEl) {
    listEl.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-page-follow]");
      if (!btn) return;
      var id = btn.getAttribute("data-page-follow");
      if (!id) return;
      if (followedSet.has(id)) followedSet.delete(id);
      else followedSet.add(id);
      writeFollowed();
      renderPages();
    });
  }

  document.addEventListener("uilangchange", renderPages);

  renderPages();
})();
