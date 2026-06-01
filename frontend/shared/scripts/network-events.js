(function () {
  "use strict";

  var EVENTS = [
    {
      type: "career",
      name: "Marcus Dias",
      seed: "MarcusDias",
      role: "Senior Design Manager",
      company: "Microsoft",
      timeKey: "network.evTime1d",
      timeFallback: "1 day ago",
    },
    {
      type: "career",
      name: "Elena Volkov",
      seed: "ElenaVolkov",
      role: "Frontend Developer",
      company: "Stripe",
      timeKey: "network.evTime3d",
      timeFallback: "3 days ago",
    },
    {
      type: "career",
      name: "Ryan O'Brien",
      seed: "RyanOBrien",
      role: "Product Manager",
      company: "Atlassian",
      timeKey: "network.evTime1w",
      timeFallback: "1 week ago",
    },
    {
      type: "birthdays",
      name: "Sarah Chen",
      seed: "SarahChen",
      whenKey: "network.evBirthdayToday",
      whenFallback: "today",
      timeKey: "network.evTimeToday",
      timeFallback: "Today",
    },
    {
      type: "birthdays",
      name: "Joshua Cortez",
      seed: "JoshuaCortez",
      whenKey: "network.evBirthdayIn",
      whenFallback: "in 3 days",
      whenVars: { days: "3" },
      timeKey: "network.evTimeSoon",
      timeFallback: "Coming up",
    },
    {
      type: "birthdays",
      name: "Maria Rodriguez",
      seed: "MariaRodriguez",
      whenKey: "network.evBirthdayIn",
      whenFallback: "in 5 days",
      whenVars: { days: "5" },
      timeKey: "network.evTimeSoon",
      timeFallback: "Coming up",
    },
    {
      type: "education",
      name: "James Lee",
      seed: "JamesLee",
      program: "Advanced React Patterns",
      timeKey: "network.evTime4d",
      timeFallback: "4 days ago",
    },
    {
      type: "education",
      name: "Nina Petrova",
      seed: "NinaPetrova",
      program: "UX Research Certificate",
      timeKey: "network.evTime2w",
      timeFallback: "2 weeks ago",
    },
    {
      type: "education",
      name: "Priya Patel",
      seed: "PriyaPatel",
      program: "Kubernetes Administrator",
      timeKey: "network.evTime5d",
      timeFallback: "5 days ago",
    },
  ];

  function t(key, fallback) {
    return typeof window.uiT === "function" ? window.uiT(key, fallback) : fallback || key;
  }

  function tmpl(key, vars, fallback) {
    return typeof window.uiTmpl === "function" ? window.uiTmpl(key, vars) : fallback || key;
  }

  var listEl = document.getElementById("networkEventsList");
  var emptyEl = document.getElementById("networkEventsEmpty");
  var activeFilter = "all";
  var tabsEl = document.querySelector(".vac-tabs");
  var panelConn = document.getElementById("vacPanelConnections");
  var panelEvents = document.getElementById("vacPanelEvents");
  var panelFollowing = document.getElementById("vacPanelFollowing");
  var panelGroups = document.getElementById("vacPanelGroups");
  var panelPages = document.getElementById("vacPanelPages");

  function avatarFor(event) {
    if (event.avatar) return event.avatar;
    return "https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(event.seed || event.name);
  }

  function eventText(event) {
    if (event.type === "career") {
      return tmpl(
        "network.evCareerItem",
        { name: event.name, role: event.role, company: event.company },
        event.name + " started a new role as " + event.role + " at " + event.company
      );
    }
    if (event.type === "birthdays") {
      var when = event.whenVars
        ? tmpl(event.whenKey, event.whenVars, event.whenFallback)
        : t(event.whenKey, event.whenFallback);
      return tmpl("network.evBirthdayItem", { name: event.name, when: when }, event.name + " celebrates a birthday " + when);
    }
    return tmpl(
      "network.evEduItem",
      { name: event.name, program: event.program },
      event.name + " completed " + event.program
    );
  }

  function typeLabel(type) {
    if (type === "career") return t("network.evCareer", "Job changes");
    if (type === "birthdays") return t("network.evBirth", "Birthdays");
    return t("network.evEdu", "Education");
  }

  function buildEventRow(event) {
    var time = t(event.timeKey, event.timeFallback);
    return (
      '<article class="vac-event-item" data-event-type="' +
      event.type +
      '">' +
      '<img class="vac-event-item__avatar" src="' +
      avatarFor(event) +
      '" width="48" height="48" alt="" />' +
      '<div class="vac-event-item__body">' +
      '<span class="vac-event-item__badge">' +
      typeLabel(event.type) +
      "</span>" +
      '<p class="vac-event-item__text">' +
      eventText(event) +
      "</p>" +
      '<time class="vac-event-item__time">' +
      time +
      "</time>" +
      "</div>" +
      "</article>"
    );
  }

  function renderEvents() {
    if (!listEl) return;
    var filtered =
      activeFilter === "all" ? EVENTS.slice() : EVENTS.filter(function (ev) {
          return ev.type === activeFilter;
        });
    listEl.innerHTML = filtered.map(buildEventRow).join("");
    if (emptyEl) emptyEl.hidden = filtered.length > 0;
    if (listEl) listEl.hidden = filtered.length === 0;
  }

  function setFilter(next) {
    activeFilter = next || "all";
    document.querySelectorAll("[data-vac-filter]").forEach(function (chip) {
      var on = (chip.getAttribute("data-vac-filter") || "all") === activeFilter;
      chip.classList.toggle("vac-event-filter--active", on);
    });
    renderEvents();
  }

  var currentNetworkView = "";

  function setNetworkMainView(mode) {
    if (currentNetworkView === mode) return;

    var isConnections = mode === "connections";
    var isEvents = mode === "events";
    var isFollowing = mode === "following";
    var isGroups = mode === "groups";
    var isPages = mode === "pages";

    if (tabsEl) tabsEl.hidden = isFollowing || isGroups || isPages;
    if (panelConn) panelConn.hidden = !isConnections;
    if (panelEvents) panelEvents.hidden = !isEvents;
    if (panelFollowing) panelFollowing.hidden = !isFollowing;
    if (panelGroups) panelGroups.hidden = !isGroups;
    if (panelPages) panelPages.hidden = !isPages;

    if (isEvents) {
      window.history.replaceState(null, "", "#event");
    } else if (isFollowing) {
      window.history.replaceState(null, "", "#following");
    } else if (isGroups) {
      window.history.replaceState(null, "", "#groups");
      if (typeof window.initNetworkGroupsView === "function") {
        window.initNetworkGroupsView();
      }
    } else if (isPages) {
      window.history.replaceState(null, "", "#pages");
    } else {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    syncSidebarNav(mode);
    currentNetworkView = mode;
  }

  window.setNetworkMainView = setNetworkMainView;

  function showEventsTab() {
    var tab = document.getElementById("vacTabEvents");
    if (tab) tab.click();
    setNetworkMainView("events");
  }

  function showConnectionsTab() {
    var tab = document.getElementById("vacTabConnections");
    if (tab) tab.click();
    setNetworkMainView("connections");
  }

  function showFollowingTab() {
    setNetworkMainView("following");
  }

  function showGroupsTab() {
    setNetworkMainView("groups");
  }

  function showPagesTab() {
    setNetworkMainView("pages");
  }

  function syncSidebarNav(mode) {
    document.querySelectorAll("[data-network-nav]").forEach(function (link) {
      var nav = link.getAttribute("data-network-nav");
      link.classList.toggle("vac-sidebar__link--active", nav === mode);
      if (nav === mode) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  document.querySelectorAll("[data-vac-filter]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      setFilter(chip.getAttribute("data-vac-filter") || "all");
    });
  });

  document.querySelectorAll("[data-network-nav]").forEach(function (link) {
    link.addEventListener("click", function () {
      var nav = link.getAttribute("data-network-nav");
      if (nav === "events") {
        showEventsTab();
      } else if (nav === "connections") {
        showConnectionsTab();
      } else if (nav === "following") {
        showFollowingTab();
      } else if (nav === "groups") {
        showGroupsTab();
      } else if (nav === "pages") {
        showPagesTab();
      }
    });
  });

  document.getElementById("vacTabConnections") &&
    document.getElementById("vacTabConnections").addEventListener("click", function () {
      setNetworkMainView("connections");
    });

  document.getElementById("vacTabEvents") &&
    document.getElementById("vacTabEvents").addEventListener("click", function () {
      setNetworkMainView("events");
    });

  window.addEventListener("hashchange", function () {
    if (window.location.hash === "#event") setNetworkMainView("events");
    else if (window.location.hash === "#following") setNetworkMainView("following");
    else if (window.location.hash === "#groups") setNetworkMainView("groups");
    else if (window.location.hash === "#pages") setNetworkMainView("pages");
    else if (!window.location.hash) setNetworkMainView("connections");
  });

  document.addEventListener("uilangchange", renderEvents);

  renderEvents();
  if (window.location.hash === "#event") setNetworkMainView("events");
  else if (window.location.hash === "#following") setNetworkMainView("following");
  else if (window.location.hash === "#groups") setNetworkMainView("groups");
  else if (window.location.hash === "#pages") setNetworkMainView("pages");
  else setNetworkMainView("connections");

  window.showNetworkEventsTab = showEventsTab;
  window.showNetworkFollowingView = showFollowingTab;
  window.showNetworkGroupsView = showGroupsTab;
  window.showNetworkPagesView = showPagesTab;
})();
