(function () {
  const APPLICATIONS_KEY = "vacancyApplications";
  const SAVED_JOBS_KEY = "vacancySavedJobs";
  const MAX_RESUME_SIZE = 1_800_000;

  function notify(text) {
    if (typeof window.showUiNotice === "function") {
      window.showUiNotice(text);
      return;
    }
    window.alert(text);
  }

  function sentLabel() {
    return typeof window.uiT === "function" ? window.uiT("network.sent") : "Sent";
  }

  function appliedLabel() {
    return typeof window.uiT === "function" ? window.uiT("vac.applied") : "Отклик отправлен";
  }

  function t(key, fallback) {
    return typeof window.uiT === "function" ? window.uiT(key) : fallback;
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : fallback;
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

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("read_file_error"));
      reader.readAsDataURL(file);
    });
  }

  function getRowJobId(row) {
    const role = String(row.getAttribute("data-role") || "").trim().toLowerCase();
    const company = String(row.getAttribute("data-company") || "").trim().toLowerCase();
    const location = String(row.getAttribute("data-location") || "").trim().toLowerCase();
    return [role, company, location].join("|");
  }

  function snapshotJob(row) {
    return {
      id: getRowJobId(row),
      role: String(row.getAttribute("data-role") || "").trim(),
      company: String(row.getAttribute("data-company") || "").trim(),
      location: String(row.getAttribute("data-location") || "").trim(),
      salary: String(row.querySelector(".vac-job-row__salary")?.textContent || "").trim(),
      meta: String(row.querySelector(".vac-job-row__meta")?.textContent || "").trim(),
    };
  }

  function setApplyLinkState(link, applied) {
    if (!link) return;
    if (applied) {
      link.textContent = appliedLabel();
      link.setAttribute("aria-disabled", "true");
      link.style.pointerEvents = "none";
      return;
    }
    link.textContent = t("vac.apply", "Откликнуться");
    link.removeAttribute("aria-disabled");
    link.style.pointerEvents = "";
  }

  function setSaveButtonState(btn, saved) {
    if (!btn) return;
    btn.classList.toggle("vac-job-row__save--active", saved);
    btn.textContent = saved ? t("vac.saved", "Сохранено") : t("vac.save", "Сохранить");
    btn.setAttribute("aria-pressed", saved ? "true" : "false");
  }

  function refreshAppliedRows() {
    const applications = readJson(APPLICATIONS_KEY, {});
    document.querySelectorAll(".vac-job-row[data-role]").forEach((row) => {
      const id = getRowJobId(row);
      const link = row.querySelector("[data-vac-apply]");
      setApplyLinkState(link, !!applications[id]);
    });
  }

  function refreshSavedRows() {
    const saved = readJson(SAVED_JOBS_KEY, {});
    document.querySelectorAll(".vac-job-row[data-role]").forEach((row) => {
      const id = getRowJobId(row);
      const btn = row.querySelector("[data-vac-save]");
      setSaveButtonState(btn, !!saved[id]);
    });
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

  const queriesDismiss = document.getElementById("vacQueriesDismiss");
  const queriesCard = document.getElementById("vacRecommendedQueries");
  if (queriesDismiss && queriesCard) {
    queriesDismiss.addEventListener("click", () => {
      queriesCard.classList.add("vac-job-card--hidden");
    });
  }

  const searchForm = document.getElementById("vacSearchForm");
  const searchStats = document.getElementById("vacSearchStats");
  const noResultsCard = document.getElementById("vacNoResults");
  const searchQuery = document.getElementById("vacSearchQuery");
  const searchLocation = document.getElementById("vacSearchLocation");
  const searchType = document.getElementById("vacSearchType");
  const searchLevel = document.getElementById("vacSearchLevel");
  const searchSalaryMin = document.getElementById("vacSearchSalaryMin");
  const searchSort = document.getElementById("vacSearchSort");
  const searchRemoteOnly = document.getElementById("vacSearchRemoteOnly");
  const searchReset = document.getElementById("vacSearchReset");
  const quickChips = Array.from(document.querySelectorAll("[data-vac-quick]"));
  const hubTabApplied = document.getElementById("vacHubTabApplied");
  const hubTabSaved = document.getElementById("vacHubTabSaved");
  const hubPanelApplied = document.getElementById("vacHubPanelApplied");
  const hubPanelSaved = document.getElementById("vacHubPanelSaved");
  const appliedList = document.getElementById("vacAppliedList");
  const savedList = document.getElementById("vacSavedList");
  const appliedEmpty = document.getElementById("vacAppliedEmpty");
  const savedEmpty = document.getElementById("vacSavedEmpty");
  const appliedSkeleton = document.getElementById("vacAppliedSkeleton");
  const savedSkeleton = document.getElementById("vacSavedSkeleton");

  function formatDate(iso) {
    const ms = Date.parse(String(iso || ""));
    if (!Number.isFinite(ms)) return "—";
    const lang = typeof window.getUiLang === "function" && window.getUiLang() === "en" ? "en-US" : "ru-RU";
    return new Date(ms).toLocaleDateString(lang, { day: "2-digit", month: "short", year: "numeric" });
  }

  function setHubTab(appliedActive) {
    if (!hubTabApplied || !hubTabSaved || !hubPanelApplied || !hubPanelSaved) return;
    hubTabApplied.classList.toggle("vac-user-hub__tab--active", appliedActive);
    hubTabSaved.classList.toggle("vac-user-hub__tab--active", !appliedActive);
    hubTabApplied.setAttribute("aria-selected", appliedActive ? "true" : "false");
    hubTabSaved.setAttribute("aria-selected", appliedActive ? "false" : "true");
    hubPanelApplied.hidden = !appliedActive;
    hubPanelSaved.hidden = appliedActive;
  }

  function renderAppliedList() {
    if (!appliedList || !appliedEmpty) return;
    const applications = Object.values(readJson(APPLICATIONS_KEY, {}));
    appliedList.innerHTML = "";
    if (!applications.length) {
      appliedList.hidden = true;
      appliedEmpty.hidden = false;
      return;
    }
    appliedEmpty.hidden = true;
    appliedList.hidden = false;
    applications
      .sort((a, b) => Date.parse(String(b.submittedAt || "")) - Date.parse(String(a.submittedAt || "")))
      .forEach((item) => {
        const li = document.createElement("li");
        li.className = "vac-user-hub__item";
        li.innerHTML =
          `<p class="vac-user-hub__item-title">${item.role || "Role"} — ${item.company || "Company"}</p>` +
          `<p class="vac-user-hub__item-meta">${item.location || ""} · ${t("vac.appliedOn", "Отправлено")}: ${formatDate(item.submittedAt)}</p>` +
          `<p class="vac-user-hub__item-meta">${t("vac.resume", "Резюме")}: ${item.resumeName || "—"}</p>`;
        const actions = document.createElement("div");
        actions.className = "vac-user-hub__item-actions";
        const withdraw = document.createElement("button");
        withdraw.type = "button";
        withdraw.className = "vac-user-hub__btn";
        withdraw.textContent = t("vac.withdraw", "Отозвать");
        withdraw.addEventListener("click", () => {
          const map = readJson(APPLICATIONS_KEY, {});
          delete map[item.id];
          writeJson(APPLICATIONS_KEY, map);
          refreshAppliedRows();
          renderAppliedList();
          if (typeof window.pushUiNotification === "function") {
            window.pushUiNotification(t("vac.withdrawDone", "Отклик отозван"));
          }
          notify(t("vac.withdrawDone", "Отклик отозван"));
        });
        actions.appendChild(withdraw);
        li.appendChild(actions);
        appliedList.appendChild(li);
      });
  }

  function renderSavedList() {
    if (!savedList || !savedEmpty) return;
    const saved = Object.values(readJson(SAVED_JOBS_KEY, {}));
    savedList.innerHTML = "";
    if (!saved.length) {
      savedList.hidden = true;
      savedEmpty.hidden = false;
      return;
    }
    savedEmpty.hidden = true;
    savedList.hidden = false;
    saved.forEach((item) => {
      const li = document.createElement("li");
      li.className = "vac-user-hub__item";
      li.innerHTML =
        `<p class="vac-user-hub__item-title">${item.role || "Role"} — ${item.company || "Company"}</p>` +
        `<p class="vac-user-hub__item-meta">${item.location || ""} · ${item.salary || "—"}</p>` +
        `<p class="vac-user-hub__item-meta">${item.meta || ""}</p>`;
      const actions = document.createElement("div");
      actions.className = "vac-user-hub__item-actions";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "vac-user-hub__btn";
      remove.textContent = t("vac.removeSaved", "Убрать");
      remove.addEventListener("click", () => {
        const map = readJson(SAVED_JOBS_KEY, {});
        delete map[item.id];
        writeJson(SAVED_JOBS_KEY, map);
        refreshSavedRows();
        renderSavedList();
      });
      actions.appendChild(remove);
      li.appendChild(actions);
      savedList.appendChild(li);
    });
  }

  function renderHub() {
    if (appliedSkeleton) appliedSkeleton.hidden = false;
    if (savedSkeleton) savedSkeleton.hidden = false;
    setTimeout(() => {
      if (appliedSkeleton) appliedSkeleton.hidden = true;
      if (savedSkeleton) savedSkeleton.hidden = true;
      renderAppliedList();
      renderSavedList();
    }, 120);
  }

  if (searchForm) {
    let jobRows = Array.from(document.querySelectorAll(".vac-job-row[data-role]"));
    const jobCards = Array.from(document.querySelectorAll(".vac-jobs-feed .vac-job-card")).filter((card) =>
      card.querySelector(".vac-job-row[data-role]")
    );

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function rowMatchesFilters(row) {
      const ds = row.dataset;
      const query = normalize(searchQuery && searchQuery.value);
      const location = normalize(searchLocation && searchLocation.value);
      const type = normalize(searchType && searchType.value);
      const level = normalize(searchLevel && searchLevel.value);
      const remoteOnly = !!(searchRemoteOnly && searchRemoteOnly.checked);
      const minSalary = Number((searchSalaryMin && searchSalaryMin.value) || 0) || 0;

      const textBlob = normalize(
        [ds.role, ds.company, ds.location, row.querySelector(".vac-job-row__title")?.textContent || ""].join(" ")
      );
      const rowLocation = normalize(ds.location);
      const rowType = normalize(ds.type);
      const rowLevel = normalize(ds.level);
      const rowRemote = normalize(ds.remote) === "yes";
      const rowSalary = Number(ds.salaryMin || 0) || 0;

      if (query && !textBlob.includes(query)) return false;
      if (location && !rowLocation.includes(location)) return false;
      if (type && rowType !== type) return false;
      if (level && rowLevel !== level) return false;
      if (remoteOnly && !rowRemote) return false;
      if (minSalary && rowSalary < minSalary) return false;

      return true;
    }

    function sortRowsForList(listRows) {
      const sortValue = normalize(searchSort && searchSort.value) || "relevance";
      if (sortValue === "salary_desc") {
        return [...listRows].sort((a, b) => Number(b.dataset.salaryMin || 0) - Number(a.dataset.salaryMin || 0));
      }
      if (sortValue === "salary_asc") {
        return [...listRows].sort((a, b) => Number(a.dataset.salaryMin || 0) - Number(b.dataset.salaryMin || 0));
      }
      if (sortValue === "newest") {
        return [...listRows].sort((a, b) => Number(a.dataset.postedDays || 0) - Number(b.dataset.postedDays || 0));
      }
      return listRows;
    }

    function updateQuickChips() {
      const query = normalize(searchQuery && searchQuery.value);
      quickChips.forEach((chip) => {
        const quickValue = normalize(chip.dataset.vacQuick);
        const isActive =
          (quickValue === "remote" && !!(searchRemoteOnly && searchRemoteOnly.checked)) ||
          (quickValue !== "remote" && query === quickValue);
        chip.classList.toggle("vac-quick-chip--active", isActive);
      });
    }

    function updateStats(visibleCount, totalCount) {
      if (searchStats) {
        searchStats.textContent = "Найдено: " + visibleCount + " из " + totalCount + " вакансий";
      }
      if (noResultsCard) {
        noResultsCard.hidden = visibleCount > 0;
      }
    }

    function toggleCardsVisibility() {
      jobCards.forEach((card) => {
        const hasVisibleRows = Array.from(card.querySelectorAll(".vac-job-row[data-role]")).some(
          (row) => row.style.display !== "none"
        );
        card.classList.toggle("vac-job-card--empty", !hasVisibleRows);
      });
    }

    function applyAdvancedSearch() {
      jobRows = Array.from(document.querySelectorAll(".vac-job-row[data-role]"));

      const grouped = new Map();
      jobRows.forEach((row) => {
        const list = row.closest(".vac-job-list");
        if (!list) return;
        if (!grouped.has(list)) grouped.set(list, []);
        grouped.get(list).push(row);
      });

      grouped.forEach((rows, list) => {
        const sorted = sortRowsForList(rows);
        sorted.forEach((row) => list.appendChild(row));
      });

      let visibleCount = 0;
      jobRows.forEach((row) => {
        const visible = rowMatchesFilters(row);
        row.style.display = visible ? "" : "none";
        if (visible) visibleCount += 1;
      });

      toggleCardsVisibility();
      updateQuickChips();
      updateStats(visibleCount, jobRows.length);
    }

    window.refreshVacancySearch = applyAdvancedSearch;

    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      applyAdvancedSearch();
    });

    [searchQuery, searchLocation, searchType, searchLevel, searchSalaryMin, searchSort, searchRemoteOnly].forEach((el) => {
      if (!el) return;
      const eventName = el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(eventName, applyAdvancedSearch);
    });

    if (searchReset) {
      searchReset.addEventListener("click", () => {
        searchForm.reset();
        applyAdvancedSearch();
      });
    }

    quickChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const quickValue = normalize(chip.dataset.vacQuick);
        if (quickValue === "remote") {
          if (searchRemoteOnly) searchRemoteOnly.checked = !searchRemoteOnly.checked;
        } else if (searchQuery) {
          searchQuery.value = searchQuery.value.trim().toLowerCase() === quickValue ? "" : quickValue;
        }
        applyAdvancedSearch();
      });
    });

    document.querySelectorAll("[data-vac-query]").forEach((pill) => {
      pill.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const q = normalize(pill.getAttribute("data-vac-query"));
        if (searchQuery) searchQuery.value = q;
        applyAdvancedSearch();
      });
    });

    document.querySelectorAll("[data-vac-show-all]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        if (searchForm) searchForm.reset();
        applyAdvancedSearch();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    applyAdvancedSearch();
  }

  if (hubTabApplied && hubTabSaved) {
    hubTabApplied.addEventListener("click", () => setHubTab(true));
    hubTabSaved.addEventListener("click", () => setHubTab(false));
  }

  document.querySelectorAll("[data-vac-save]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest(".vac-job-row");
      if (!row) return;
      const id = getRowJobId(row);
      const map = readJson(SAVED_JOBS_KEY, {});
      if (map[id]) {
        delete map[id];
        writeJson(SAVED_JOBS_KEY, map);
        refreshSavedRows();
        renderSavedList();
        notify(t("vac.unsaved", "Вакансия удалена из сохранённых"));
        return;
      }
      map[id] = snapshotJob(row);
      writeJson(SAVED_JOBS_KEY, map);
      refreshSavedRows();
      renderSavedList();
      if (typeof window.pushUiNotification === "function") {
        window.pushUiNotification(t("vac.savedNotice", "Вакансия сохранена"));
      }
      notify(t("vac.savedNotice", "Вакансия сохранена"));
    });
  });

  document.querySelectorAll(".vac-job-row__dismiss").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest(".vac-job-row");
      if (row) row.remove();
      if (typeof window.refreshVacancySearch === "function") {
        window.refreshVacancySearch();
      }
    });
  });

  const applyModal = document.getElementById("vacApplyModal");
  const applyForm = document.getElementById("vacApplyForm");
  const applySummary = document.getElementById("vacApplyJobSummary");
  const applyName = document.getElementById("vacApplyName");
  const applyEmail = document.getElementById("vacApplyEmail");
  const applyPhone = document.getElementById("vacApplyPhone");
  const applyAbout = document.getElementById("vacApplyAbout");
  const applyResumeName = document.getElementById("vacApplyResumeName");
  const applyUseSavedBtn = document.getElementById("vacApplyUseSavedBtn");
  const applyUploadBtn = document.getElementById("vacApplyUploadBtn");
  const applyResumeInput = document.getElementById("vacApplyResumeInput");
  const applyError = document.getElementById("vacApplyError");
  const applyCloseTargets = document.querySelectorAll("[data-vac-apply-close]");
  let activeJobRow = null;
  let selectedResumeName = "";
  let selectedResumeData = "";

  function readProfileData() {
    const account = readJson("registeredAccount", {});
    const session = readJson("authSession", {});
    return { account, session };
  }

  function fillApplyDefaults() {
    const { account, session } = readProfileData();
    const fullName = [account.firstName, account.lastName].filter(Boolean).join(" ").trim();
    applyName.value = fullName || session.userName || "";
    applyEmail.value = account.email || session.email || "";
    applyPhone.value = account.phone || "";
    applyAbout.value = "";
    selectedResumeName = account.resumeName || "";
    selectedResumeData = account.resumeDataUrl || "";
    applyResumeName.textContent = selectedResumeName || t("vac.applyResumeEmpty", "Файл не выбран");
  }

  function closeApplyModal() {
    if (!applyModal) return;
    applyModal.hidden = true;
    document.body.style.overflow = "";
    activeJobRow = null;
    if (applyError) {
      applyError.hidden = true;
      applyError.textContent = "";
    }
  }

  function openApplyModal(row) {
    if (!applyModal || !applyForm || !applySummary) return;
    activeJobRow = row;
    const title = row.querySelector(".vac-job-row__title")?.textContent?.trim() || "";
    const salary = row.querySelector(".vac-job-row__salary")?.textContent?.trim() || "";
    applySummary.textContent = [title, salary].filter(Boolean).join(" • ");
    fillApplyDefaults();
    if (applyError) {
      applyError.hidden = true;
      applyError.textContent = "";
    }
    applyModal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function saveResumeToProfile(name, dataUrl) {
    if (!name || !dataUrl) return;
    const account = readJson("registeredAccount", {});
    const session = readJson("authSession", {});
    writeJson("registeredAccount", { ...account, resumeName: name, resumeDataUrl: dataUrl });
    writeJson("authSession", { ...session, resumeName: name, resumeDataUrl: dataUrl });
  }

  if (applyCloseTargets.length) {
    applyCloseTargets.forEach((el) => el.addEventListener("click", closeApplyModal));
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && applyModal && !applyModal.hidden) closeApplyModal();
  });

  if (applyUseSavedBtn) {
    applyUseSavedBtn.addEventListener("click", () => {
      const { account } = readProfileData();
      selectedResumeName = account.resumeName || "";
      selectedResumeData = account.resumeDataUrl || "";
      applyResumeName.textContent = selectedResumeName || t("vac.applyResumeEmpty", "Файл не выбран");
      if (!selectedResumeData) notify(t("vac.applyNoSavedResume", "Сохраненного резюме пока нет"));
    });
  }

  if (applyUploadBtn && applyResumeInput) {
    applyUploadBtn.addEventListener("click", () => applyResumeInput.click());
    applyResumeInput.addEventListener("change", async () => {
      const file = applyResumeInput.files && applyResumeInput.files[0];
      applyResumeInput.value = "";
      if (!file) return;
      if (file.size > MAX_RESUME_SIZE) {
        if (applyError) {
          applyError.hidden = false;
          applyError.textContent = t("vac.applyResumeTooLarge", "Файл слишком большой (до 1.8MB)");
        }
        return;
      }
      try {
        selectedResumeData = await readFileAsDataUrl(file);
        selectedResumeName = file.name || "resume";
        applyResumeName.textContent = selectedResumeName;
        if (applyError) {
          applyError.hidden = true;
          applyError.textContent = "";
        }
      } catch {
        if (applyError) {
          applyError.hidden = false;
          applyError.textContent = t("vac.applyResumeReadFail", "Не удалось прочитать файл резюме");
        }
      }
    });
  }

  if (applyForm) {
    applyForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!activeJobRow) return;
      const role = String(activeJobRow.getAttribute("data-role") || "").trim();
      const company = String(activeJobRow.getAttribute("data-company") || "").trim();
      const location = String(activeJobRow.getAttribute("data-location") || "").trim();
      const email = String(applyEmail.value || "").trim();
      const fullName = String(applyName.value || "").trim();
      if (!fullName || !email) {
        if (applyError) {
          applyError.hidden = false;
          applyError.textContent = t("vac.applyFillRequired", "Заполните обязательные поля");
        }
        return;
      }
      if (!selectedResumeData) {
        if (applyError) {
          applyError.hidden = false;
          applyError.textContent = t("vac.applyNeedResume", "Прикрепите резюме перед отправкой");
        }
        return;
      }
      const applications = readJson(APPLICATIONS_KEY, {});
      const id = getRowJobId(activeJobRow);
      applications[id] = {
        id,
        role,
        company,
        location,
        fullName,
        email,
        phone: String(applyPhone.value || "").trim(),
        about: String(applyAbout.value || "").trim(),
        resumeName: selectedResumeName,
        submittedAt: new Date().toISOString(),
      };
      writeJson(APPLICATIONS_KEY, applications);
      saveResumeToProfile(selectedResumeName, selectedResumeData);
      refreshAppliedRows();
      renderAppliedList();
      closeApplyModal();
      if (typeof window.pushUiNotification === "function") {
        window.pushUiNotification(`${t("vac.applyDone", "Отклик отправлен")}: ${role}`);
      }
      notify(`${t("vac.applyDone", "Отклик отправлен")}: ${role}${company ? ` (${company})` : ""}`);
    });
  }

  document.querySelectorAll("[data-vac-apply]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const row = link.closest(".vac-job-row");
      if (!row) return;
      const id = getRowJobId(row);
      const applications = readJson(APPLICATIONS_KEY, {});
      if (applications[id]) {
        notify(t("vac.applyAlreadyDone", "Вы уже отправили отклик на эту вакансию"));
        return;
      }
      openApplyModal(row);
    });
  });

  document.addEventListener("uilangchange", () => {
    refreshAppliedRows();
    refreshSavedRows();
    renderAppliedList();
    renderSavedList();
    if (applyResumeName && !selectedResumeName) {
      applyResumeName.textContent = t("vac.applyResumeEmpty", "Файл не выбран");
    }
  });

  refreshAppliedRows();
  refreshSavedRows();
  renderHub();
  setHubTab(true);

  const postVacancyBtn = document.querySelector(".vac-jobs-post");
  if (postVacancyBtn) {
    postVacancyBtn.addEventListener("click", () => {
      const search = document.getElementById("vacSearchQuery");
      if (search) {
        search.focus();
        search.select();
      }
      notify("Открыл форму публикации: заполните фильтры и сохраните вакансию");
    });
  }
})();
