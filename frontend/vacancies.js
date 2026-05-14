(function () {
  function sentLabel() {
    return typeof window.uiT === "function" ? window.uiT("network.sent") : "Sent";
  }

  const tabConn = document.getElementById("vacTabConnections");
  const tabEvents = document.getElementById("vacTabEvents");
  const panelConn = document.getElementById("vacPanelConnections");
  const panelEvents = document.getElementById("vacPanelEvents");

  function setVacTab(connections) {
    if (!tabConn || !tabEvents || !panelConn || !panelEvents) return;
    tabConn.classList.toggle("vac-tabs__btn--active", connections);
    tabEvents.classList.toggle("vac-tabs__btn--active", !connections);
    tabConn.setAttribute("aria-selected", String(connections));
    tabEvents.setAttribute("aria-selected", String(!connections));
    panelConn.hidden = !connections;
    panelEvents.hidden = connections;
    if (!connections) {
      window.history.replaceState(null, "", "#event");
    } else {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  if (tabConn) {
    tabConn.addEventListener("click", () => setVacTab(true));
  }
  if (tabEvents) {
    tabEvents.addEventListener("click", () => setVacTab(false));
  }

  document.querySelectorAll(".vac-person__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      const card = btn.closest(".vac-person");
      const nameEl = card && card.querySelector(".vac-person__name");
      const avatarEl = card && card.querySelector(".vac-person__avatar");
      const handleEl = card && card.querySelector(".vac-person__handle");
      const name = nameEl ? nameEl.textContent.trim() : "";
      let id = "";
      if (handleEl) {
        id = handleEl.textContent.replace(/^@+/, "").trim();
      }
      if (!id && name) {
        id = name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
      }
      const avatar = avatarEl && avatarEl.getAttribute("src") ? String(avatarEl.getAttribute("src")).trim() : "";
      const preview =
        typeof window.uiT === "function" ? window.uiT("network.newChatPreview") : "";
      if (typeof window.appendHomePanelChat === "function") {
        window.appendHomePanelChat({ id, name, avatar, preview, time: "" });
      }
      if (typeof window.openHomeMessagesPanel === "function") {
        window.openHomeMessagesPanel();
      }
      btn.textContent = sentLabel();
      btn.disabled = true;
    });
  });

  document.addEventListener("uilangchange", () => {
    document.querySelectorAll(".vac-person__btn[disabled]").forEach((b) => {
      b.textContent = sentLabel();
    });
  });

  document.querySelectorAll("[data-vac-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("[data-vac-filter]").forEach((c) => {
        c.classList.toggle("vac-event-filter--active", c === chip);
      });
    });
  });

  const expandBtn = document.getElementById("vacExpandNetwork");
  if (expandBtn) {
    expandBtn.addEventListener("click", () => setVacTab(true));
  }

  if (window.location.hash === "#event") {
    setVacTab(false);
  }

  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#event") {
      setVacTab(false);
    }
  });

  document.querySelectorAll(".vac-job-row__dismiss").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest(".vac-job-row");
      if (row) row.remove();
    });
  });

  const queriesDismiss = document.getElementById("vacQueriesDismiss");
  const queriesCard = document.getElementById("vacRecommendedQueries");
  if (queriesDismiss && queriesCard) {
    queriesDismiss.addEventListener("click", () => {
      queriesCard.classList.add("vac-job-card--hidden");
    });
  }
})();
