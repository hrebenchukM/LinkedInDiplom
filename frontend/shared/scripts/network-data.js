(function () {
  "use strict";

  var NETWORK_PEOPLE = [
    {
      name: "David Jonson",
      role: "Lead UI/UX Designer",
      handle: "JonsonCPDR",
      seed: "DavidJonson",
      keywords: "design ui ux figma product",
    },
    {
      name: "Duncan Callahan",
      role: "Senior UX Researcher",
      handle: "DuncanUX",
      seed: "DuncanCallahan",
      keywords: "ux research usability testing",
    },
    {
      name: "Sarah Chen",
      role: "Product Designer · Figma",
      handle: "SarahChen",
      seed: "SarahChen",
      keywords: "design figma product ui",
    },
    {
      name: "Maria Rodriguez",
      role: "Senior UX Researcher",
      handle: "MariaRdz",
      seed: "MariaRodriguez",
      keywords: "ux research analytics",
    },
    {
      name: "James Lee",
      role: "UI Engineer",
      handle: "JamesLeeDev",
      seed: "JamesLee",
      keywords: "frontend react css engineer",
    },
    {
      name: "Joshua Cortez",
      role: "UI/UX Designer",
      handle: "JoshCortez",
      seed: "JoshuaCortez",
      keywords: "design ui ux web",
    },
    {
      name: "Marcus Dias",
      role: "Senior Design Manager · Microsoft",
      handle: "MarcusDias",
      seed: "MarcusDias",
      keywords: "design manager leadership microsoft",
    },
    {
      name: "Alena Curtis",
      role: "Product Designer",
      handle: "AlenaCurtis",
      seed: "Alena",
      keywords: "product design ui prototyping",
    },
    {
      name: "Elena Volkov",
      role: "Frontend Developer · Stripe",
      handle: "ElenaVolkov",
      seed: "ElenaVolkov",
      keywords: "frontend react typescript javascript",
    },
    {
      name: "Andrii Rotar",
      role: "Full Stack Engineer",
      handle: "AndriiRotar",
      seed: "AndriiRotar",
      keywords: "fullstack react node engineer",
    },
    {
      name: "Timur Yamchuk",
      role: "Backend Developer",
      handle: "TimurYamchuk",
      seed: "TimurYamchuk",
      avatar: "/auth/assets/timur-yamchuk-avatar.png",
      keywords: "backend java spring api",
    },
    {
      name: "Priya Patel",
      role: "DevOps Engineer · Datadog",
      handle: "PriyaDevOps",
      seed: "PriyaPatel",
      keywords: "devops kubernetes aws sre",
    },
    {
      name: "Alex Kim",
      role: "React Developer",
      handle: "AlexKimDev",
      seed: "AlexKim",
      keywords: "react javascript frontend",
    },
    {
      name: "Nina Petrova",
      role: "UX Research Lead",
      handle: "NinaPetrova",
      seed: "NinaPetrova",
      keywords: "ux research interviews usability",
    },
    {
      name: "Ryan O'Brien",
      role: "Product Manager · Atlassian",
      handle: "RyanOBrien",
      seed: "RyanOBrien",
      keywords: "product manager agile roadmap",
    },
    {
      name: "Sophie Martin",
      role: "Visual UI Designer",
      handle: "SophieMartin",
      seed: "SophieMartin",
      keywords: "ui visual design branding",
    },
    {
      name: "Liam Nguyen",
      role: "Data Analyst · Airtable",
      handle: "LiamNguyen",
      seed: "LiamNguyen",
      keywords: "data analyst sql bi metrics",
    },
    {
      name: "Abram Lipshutz",
      role: "Design Systems Engineer",
      handle: "AbramLipshutz",
      seed: "Abram",
      keywords: "design systems frontend css tokens",
    },
  ];

  function buildPersonCard(person) {
    var keywords = [person.keywords, person.name, person.role, person.handle].filter(Boolean).join(" ").toLowerCase();
    var avatarSrc = person.avatar
      ? person.avatar
      : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(person.seed || person.name);
    var handle = String(person.handle || "").replace(/^@+/, "");
    return (
      '<article class="vac-person" data-network-person data-peer-handle="' +
      handle.replace(/"/g, "") +
      '" data-peer-seed="' +
      String(person.seed || handle).replace(/"/g, "") +
      '" data-keywords="' +
      keywords.replace(/"/g, "") +
      '">' +
      '<img class="vac-person__avatar" src="' +
      avatarSrc +
      '" width="72" height="72" alt="" />' +
      '<h4 class="vac-person__name">' +
      person.name +
      "</h4>" +
      '<p class="vac-person__role">' +
      person.role +
      "</p>" +
      '<p class="vac-person__handle">@' +
      person.handle +
      "</p>" +
      '<button type="button" class="vac-person__btn">' +
      '<span class="vac-person__btn-label" data-i18n="network.connect">Connect</span>' +
      '<span class="vac-person__btn-check" aria-hidden="true">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M5 13l4 4L19 7"/>' +
      "</svg></span>" +
      '<span class="vac-person__btn-ripple" aria-hidden="true"></span>' +
      "</button>" +
      "</article>"
    );
  }

  function renderNetworkPeople() {
    var grid = document.getElementById("networkPeopleGrid");
    if (!grid) return;
    grid.innerHTML = NETWORK_PEOPLE.map(buildPersonCard).join("");
    if (typeof window.applyDomTranslations === "function") {
      window.applyDomTranslations();
    }
    document.dispatchEvent(new CustomEvent("networkpeople rendered"));
  }

  window.NETWORK_PEOPLE = NETWORK_PEOPLE;
  window.renderNetworkPeople = renderNetworkPeople;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderNetworkPeople);
  } else {
    renderNetworkPeople();
  }
})();
