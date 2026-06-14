import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { useChatStore } from "../../features/chat/ChatStore";
import * as aiApi from "../../features/ai/aiApi";
import * as jobsApi from "../../features/jobs/jobsApi";
import {
  buildCreateSearchQueryBody,
  buildVacancyBrowseParams,
  formatSearchQueryLabel,
  mapJobToPostForm,
  mapPostFormToCreateVacancyRequest,
  mapVacancyDtoToJob,
} from "../../features/jobs/mapJobs";
import { fetchCompaniesByIds, resolveCompanyIdByName } from "../../features/professional/professionalApi";
import { useBackendApi } from "../../shared/hooks/useBackendApi";
import { withLoadState } from "../../shared/lib/asyncLoad";
import { patchRegisteredAccount, readRegisteredAccount } from "../../shared/lib/registeredAccount";
import { LoadStatus } from "../../shared/ui/LoadStatus";

const DEMO_QUICK_CHIPS = ["react", "python", "devops", "remote"];
const DEMO_QUERY_PILLS = [
  "React",
  "Frontend",
  "Python",
  "DevOps",
  "TypeScript",
  "Kubernetes",
  "Machine learning",
  "Go",
  "Senior",
  "Remote",
];

const VAC_JOBS_NAV = [
  { id: "browse", labelKey: "vac.nav.parameters", fallback: "Parameters", icon: "parameters" },
  { id: "mine", labelKey: "vac.nav.myJobs", fallback: "My jobs", icon: "mine" },
  { id: "saved", labelKey: "vac.nav.savedJobs", fallback: "Saved vacancies", icon: "saved" },
];

function VacJobsNavIcon({ type }) {
  const common = { viewBox: "0 0 24 24", fill: "currentColor", focusable: "false" };
  if (type === "parameters") {
    return (
      <svg {...common}>
        <path d="M3 17h6v-2H3v2zm0-5h10v-2H3v2zm0-7v2h14V5H3zm8 12h4v-2h-4v2zm0-5h6v-2h-6v2zm0-5h8V7h-8v2z" />
      </svg>
    );
  }
  if (type === "mine") {
    return (
      <svg {...common}>
        <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15-5-2.18-5 2.18V5h10v13z" />
    </svg>
  );
}

function t(key, fallback) {
  return typeof window.uiT === "function" ? window.uiT(key, fallback) : fallback || key;
}

function tmpl(key, vars, fallback) {
  return typeof window.uiTmpl === "function" ? window.uiTmpl(key, vars) : fallback || key;
}

function formatSalary(min, max) {
  if (min && max) return tmpl("vac.salary.range", { min, max }, `$${min}k â€” $${max}k / year`);
  if (min) return tmpl("vac.salary.from", { min }, `$${min}k+ / year`);
  return "";
}

function formatPosted(days) {
  const n = Number(days) || 0;
  if (n <= 1) return t("vac.meta.dayAgo", "1 day ago");
  if (n < 7) return tmpl("vac.meta.daysAgo", { n }, `${n} days ago`);
  if (n < 14) return t("vac.meta.weekAgo", "1 week ago");
  return tmpl("vac.meta.weeksAgo", { n: Math.floor(n / 7) }, `${Math.floor(n / 7)} weeks ago`);
}

const EMPTY_POST_FORM = {
  role: "",
  company: "",
  location: "",
  type: "full-time",
  level: "middle",
  remote: "yes",
  salaryMin: "",
  salaryMax: "",
  desc: "",
  keywords: "",
};
const SAVED_JOBS_KEY = "vacancySavedJobs";
const APPLICATIONS_KEY = "vacancyApplications";
const MAX_RESUME_SIZE = 1_800_000;


function readSavedJobs() {
  try {
    const raw = localStorage.getItem(SAVED_JOBS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return Object.fromEntries(parsed.map((id) => [String(id), { id: String(id) }]));
    }
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeSavedJobs(map) {
  try {
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(map || {}));
  } catch {
    // ignore
  }
}

function readApplications() {
  try {
    const raw = localStorage.getItem(APPLICATIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeApplications(map) {
  try {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(map || {}));
  } catch {
    // ignore
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

function snapshotJob(job) {
  const role = String(job.role || job.title || "").trim();
  const company = String(job.company || "").trim();
  const location = String(job.location || job.city || "").trim();
  const id = `${role.toLowerCase()}|${company.toLowerCase()}|${location.toLowerCase()}`;
  return {
    id,
    role,
    company,
    location,
    salary: formatSalary(job.salaryMin, job.salaryMax),
    meta: formatPosted(job.postedDays),
  };
}

function formatDate(iso) {
  const ms = Date.parse(String(iso || ""));
  if (!Number.isFinite(ms)) return "â€”";
  const lang = typeof window.getUiLang === "function" && window.getUiLang() === "en" ? "en-US" : "ru-RU";
  return new Date(ms).toLocaleDateString(lang, { day: "2-digit", month: "short", year: "numeric" });
}

function getLang() {
  return typeof window.getUiLang === "function" ? window.getUiLang() : "en";
}

function jobDesc(job) {
  const lang = getLang();
  const d = job.desc || {};
  if (typeof d === "string") return d;
  return d[lang] || d.en || "";
}

export function VacanciesPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { chats } = useChatStore();
  const useApi = useBackendApi();
  const [mode, setMode] = useState("browse");
  const [activityTab, setActivityTab] = useState("applied");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobLevel, setJobLevel] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [activeJobForApply, setActiveJobForApply] = useState(null);
  const [apiJobs, setApiJobs] = useState([]);
  const [apiTotalCount, setApiTotalCount] = useState(0);
  const [recommendedQueries, setRecommendedQueries] = useState([]);
  const [aiRecommendedJobs, setAiRecommendedJobs] = useState([]);
  const [savedSearchQueries, setSavedSearchQueries] = useState([]);
  const [saveSearchLoading, setSaveSearchLoading] = useState(false);
  const [myPostedApiJobs, setMyPostedApiJobs] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postError, setPostError] = useState("");
  const [editingJob, setEditingJob] = useState(null);
  const [savedJobsMap, setSavedJobsMap] = useState(() => readSavedJobs());
  const [applicationsMap, setApplicationsMap] = useState(() => readApplications());
  const [, forceLangRerender] = useState(0);
  const [applyForm, setApplyForm] = useState({ fullName: "", email: "", phone: "", about: "" });
  const [applyError, setApplyError] = useState("");
  const [selectedResumeName, setSelectedResumeName] = useState("");
  const [selectedResumeData, setSelectedResumeData] = useState("");
  const [postForm, setPostForm] = useState(EMPTY_POST_FORM);

  const currentUserId = session.user?.id ?? null;

  const mapVacancyList = useCallback(
    async (dtos, { markPosted = false } = {}) => {
      const companyIds = dtos.map((dto) => dto.companyId).filter(Boolean);
      const companies = await fetchCompaniesByIds(companyIds);
      return dtos
        .map((dto) => {
          const job = mapVacancyDtoToJob(dto, companies[dto.companyId]?.name || "", currentUserId);
          if (!job) return null;
          if (markPosted) return { ...job, userPosted: true };
          return job;
        })
        .filter(Boolean);
    },
    [currentUserId],
  );

  const reloadVacancies = useCallback(async () => {
    if (!useApi) return;
    await withLoadState({ setIsLoading, setLoadError }, async () => {
      const browseParams = buildVacancyBrowseParams({
        query,
        location,
        jobType,
        jobLevel,
        remoteOnly,
        salaryMin,
        sortBy,
      });
      const [browsePaged, favorites, apps, myPostedPaged] = await Promise.all([
        jobsApi.fetchVacancies(browseParams),
        jobsApi.fetchMyFavorites(),
        jobsApi.fetchMyApplications(),
        currentUserId
          ? jobsApi.fetchVacancies({ postedByUserId: currentUserId, pageSize: 100 })
          : Promise.resolve({ items: [], totalCount: 0 }),
      ]);
      const [jobs, myPosted] = await Promise.all([
        mapVacancyList(browsePaged.items),
        mapVacancyList(myPostedPaged.items, { markPosted: true }),
      ]);
      setApiJobs(jobs);
      setApiTotalCount(browsePaged.totalCount);
      setMyPostedApiJobs(myPosted);
      setFavoriteIds(new Set((favorites || []).map((f) => String(f.vacancyId)).filter(Boolean)));
      const map = {};
      apps.forEach((app) => {
        const vacancyId = app?.vacancyId || app?.VacancyId;
        if (vacancyId) map[String(vacancyId)] = app;
      });
      setApplicationsMap(map);
      writeApplications(map);
    }, "Failed to load vacancies.");
  }, [useApi, query, location, jobType, jobLevel, remoteOnly, salaryMin, sortBy, currentUserId, mapVacancyList]);

  useEffect(() => {
    if (!useApi) return;
    try {
      localStorage.removeItem("vacancyPostedJobs");
    } catch {
      // ignore storage errors
    }
    reloadVacancies();
  }, [useApi, reloadVacancies]);

  const reloadSavedSearchQueries = useCallback(async () => {
    if (!useApi) {
      setSavedSearchQueries([]);
      return;
    }
    try {
      const items = await jobsApi.fetchMySearchQueries();
      setSavedSearchQueries(items);
    } catch {
      setSavedSearchQueries([]);
    }
  }, [useApi]);

  useEffect(() => {
    if (!useApi) {
      setRecommendedQueries([]);
      return undefined;
    }
    let cancelled = false;
    jobsApi
      .fetchRecommendedQueries()
      .then((items) => {
        if (!cancelled) setRecommendedQueries(items);
      })
      .catch(() => {
        if (!cancelled) setRecommendedQueries([]);
      });
    return () => {
      cancelled = true;
    };
  }, [useApi]);

  useEffect(() => {
    if (!useApi) {
      setAiRecommendedJobs([]);
      return undefined;
    }
    let cancelled = false;
    aiApi
      .fetchRecommendedJobs()
      .then((items) => {
        if (!cancelled) setAiRecommendedJobs(items);
      })
      .catch(() => {
        if (!cancelled) setAiRecommendedJobs([]);
      });
    return () => {
      cancelled = true;
    };
  }, [useApi]);

  useEffect(() => {
    reloadSavedSearchQueries();
  }, [reloadSavedSearchQueries]);

  const quickChips = useMemo(() => {
    if (useApi && recommendedQueries.length > 0) {
      return recommendedQueries.slice(0, 4).map((item) => ({ id: item.id, label: item.query }));
    }
    return DEMO_QUICK_CHIPS.map((chip) => ({ id: chip, label: chip }));
  }, [useApi, recommendedQueries]);

  const queryPills = useMemo(() => {
    if (useApi && recommendedQueries.length > 0) {
      return recommendedQueries.map((item) => ({ id: item.id, label: item.query }));
    }
    return DEMO_QUERY_PILLS.map((chip) => ({ id: chip, label: chip }));
  }, [useApi, recommendedQueries]);

  function applyRecommendedQuery(text) {
    const value = String(text || "").trim();
    if (!value) return;
    if (value.toLowerCase() === "remote") {
      setRemoteOnly(true);
      return;
    }
    setQuery(value);
  }

  function applyDemoQueryPill(chip) {
    if (chip.toLowerCase() === "senior") setJobLevel("senior");
    else if (chip.toLowerCase() === "remote") setRemoteOnly(true);
    else setQuery(chip.toLowerCase());
  }

  function applySavedSearch(item) {
    setQuery(item.query || "");
    setLocation(item.location || "");
    setActivityTab("searches");
    focusJobSearch();
  }

  async function handleSaveCurrentSearch() {
    const body = buildCreateSearchQueryBody({ query, location });
    if (!body.query && !body.location) {
      notify(t("vac.saveSearchNeedFilters", "Enter keywords or location to save a search."));
      return;
    }
    setSaveSearchLoading(true);
    try {
      await jobsApi.createSearchQuery(body);
      await reloadSavedSearchQueries();
      setActivityTab("searches");
      notify(t("vac.saveSearchDone", "Search saved."));
    } catch (error) {
      notify(error?.message || t("vac.saveSearchFailed", "Could not save search."));
    } finally {
      setSaveSearchLoading(false);
    }
  }

  async function handleDeleteSavedSearch(searchId) {
    try {
      await jobsApi.deleteSearchQuery(searchId);
      await reloadSavedSearchQueries();
      notify(t("vac.saveSearchRemoved", "Saved search removed."));
    } catch {
      notify(t("vac.saveSearchRemoveFailed", "Could not remove saved search."));
    }
  }

  const allJobs = useMemo(() => (useApi ? apiJobs : []), [apiJobs, useApi]);

  const filtered = useMemo(() => {
    if (useApi) {
      const list = [...allJobs];
      if (sortBy === "salary_desc") list.sort((a, b) => Number(b.salaryMin || 0) - Number(a.salaryMin || 0));
      if (sortBy === "salary_asc") list.sort((a, b) => Number(a.salaryMin || 0) - Number(b.salaryMin || 0));
      return list;
    }

    const q = query.trim().toLowerCase();
    const l = location.trim().toLowerCase();
    const min = Number(salaryMin) || 0;
    const list = allJobs.filter((job) => {
      const title = String(job.title || job.role || "").toLowerCase();
      const company = String(job.company || "").toLowerCase();
      const city = String(job.city || job.location || "").toLowerCase();
      const keywords = String(job.keywords || "").toLowerCase();
      const queryOk = !q || title.includes(q) || company.includes(q) || keywords.includes(q);
      const locOk = !l || city.includes(l);
      const typeOk = !jobType || String(job.type || "").toLowerCase() === jobType;
      const levelOk = !jobLevel || String(job.level || "").toLowerCase() === jobLevel;
      const remoteOk = !remoteOnly || String(job.remote || "").toLowerCase() === "yes" || city.includes("remote");
      const salaryOk = !min || Number(job.salaryMin || 0) >= min;
      return queryOk && locOk && typeOk && levelOk && remoteOk && salaryOk;
    });
    if (sortBy === "salary_desc") list.sort((a, b) => Number(b.salaryMin || 0) - Number(a.salaryMin || 0));
    if (sortBy === "salary_asc") list.sort((a, b) => Number(a.salaryMin || 0) - Number(b.salaryMin || 0));
    if (sortBy === "newest") list.sort((a, b) => Number(a.postedDays || 9999) - Number(b.postedDays || 9999));
    return list;
  }, [allJobs, jobLevel, jobType, location, query, remoteOnly, salaryMin, sortBy, useApi]);

  const browseTotal = useApi ? apiTotalCount : allJobs.length;

  const topJobs = useMemo(() => (useApi ? aiRecommendedJobs : []), [useApi, aiRecommendedJobs]);
  const topJobsFromAi = useApi && aiRecommendedJobs.length > 0;

  const focusJobSearch = ({ clearFilters = false, searchQuery } = {}) => {
    setMode("browse");
    if (clearFilters) {
      setQuery("");
      setLocation("");
      setJobType("");
      setJobLevel("");
      setSalaryMin("");
      setRemoteOnly(false);
      setSortBy("relevance");
    }
    if (searchQuery !== undefined) setQuery(searchQuery);
    window.requestAnimationFrame(() => {
      document.getElementById("vacAdvancedSearch")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const myJobs = useMemo(() => (useApi ? myPostedApiJobs : []), [useApi, myPostedApiJobs]);
  const savedJobIds = useMemo(() => new Set(Object.keys(savedJobsMap)), [savedJobsMap]);
  const appliedJobIds = useMemo(() => new Set(Object.keys(applicationsMap)), [applicationsMap]);
  const appliedJobs = useMemo(
    () =>
      Object.values(applicationsMap).sort(
        (a, b) => Date.parse(String(b.submittedAt || "")) - Date.parse(String(a.submittedAt || "")),
      ),
    [applicationsMap],
  );
  const savedJobs = useMemo(() => Object.values(savedJobsMap), [savedJobsMap]);

  useEffect(() => {
    function onUiLangChange() {
      forceLangRerender((v) => v + 1);
    }
    document.addEventListener("uilangchange", onUiLangChange);
    return () => document.removeEventListener("uilangchange", onUiLangChange);
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key !== "Escape") return;
      if (applyModalOpen) setApplyModalOpen(false);
      if (postModalOpen) closePostModal();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [applyModalOpen, postModalOpen]);

  useEffect(() => {
    const hasModal = applyModalOpen || postModalOpen;
    const prev = document.body.style.overflow;
    if (hasModal) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [applyModalOpen, postModalOpen]);

  useEffect(() => {
    document.dispatchEvent(new CustomEvent("vacjobsrendered"));
  }, [topJobs, filtered, myJobs]);

  useEffect(() => {
    window.renderVacancyJobs = () => {
      forceLangRerender((v) => v + 1);
    };
    window.renderVacancyJobsForList = () => {
      forceLangRerender((v) => v + 1);
    };
    window.renderMyPostedJobs = () => {
      forceLangRerender((v) => v + 1);
    };
    window.refreshVacancySearch = () => {
      forceLangRerender((v) => v + 1);
    };
    window.setVacancyView = (view) => {
      setMode(view === "mine" ? "mine" : "browse");
    };
    return () => {
      delete window.renderVacancyJobs;
      delete window.renderVacancyJobsForList;
      delete window.renderMyPostedJobs;
      delete window.refreshVacancySearch;
      delete window.setVacancyView;
    };
  }, []);

  function notify(text) {
    if (typeof window.showUiNotice === "function") {
      window.showUiNotice(text);
      return;
    }
    window.alert(text);
  }

  function getRowJobId(job) {
    const role = String(job.role || job.title || "").trim().toLowerCase();
    const company = String(job.company || "").trim().toLowerCase();
    const location = String(job.location || job.city || "").trim().toLowerCase();
    return [role, company, location].join("|");
  }

  async function handleSave(job) {
    const vacancyId = String(job.id);
    if (useApi && job._api) {
      const isFav = favoriteIds.has(vacancyId);
      try {
        if (isFav) {
          await jobsApi.removeFavorite(vacancyId);
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(vacancyId);
            return next;
          });
        } else {
          await jobsApi.addFavorite(vacancyId);
          setFavoriteIds((prev) => new Set(prev).add(vacancyId));
        }
      } catch {
        notify(t("vac.favoriteFailed", "Could not update saved vacancies."));
      }
      return;
    }
    const id = getRowJobId(job);
    setSavedJobsMap((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = snapshotJob(job);
      writeSavedJobs(next);
      return next;
    });
  }

  function handleWithdrawApplication(id) {
    setApplicationsMap((prev) => {
      const next = { ...prev };
      delete next[id];
      writeApplications(next);
      return next;
    });
    if (typeof window.pushUiNotification === "function") window.pushUiNotification(t("vac.withdrawDone", "Application withdrawn"));
    else notify(t("vac.withdrawDone", "Application withdrawn"));
  }

  function handleRemoveSaved(id) {
    setSavedJobsMap((prev) => {
      const next = { ...prev };
      delete next[id];
      writeSavedJobs(next);
      return next;
    });
    notify(t("vac.unsaved", "Removed from saved jobs"));
  }

  function fillApplyDefaults() {
    const account = readRegisteredAccount();
    const user = session.user || {};
    const fullName = [account.firstName, account.lastName].filter(Boolean).join(" ").trim();
    setApplyForm({
      fullName: fullName || user.name || "",
      email: account.email || user.email || "",
      phone: account.phone || "",
      about: "",
    });
    setSelectedResumeName(account.resumeName || "");
    setSelectedResumeData(account.resumeDataUrl || "");
    setApplyError("");
  }

  function openApplyModalFor(job) {
    setActiveJobForApply(job);
    fillApplyDefaults();
    setApplyModalOpen(true);
  }

  function saveResumeToProfile(name, dataUrl) {
    if (!name || !dataUrl) return;
    patchRegisteredAccount({ resumeName: name, resumeDataUrl: dataUrl });
  }

  function openSavedVacancies() {
    setMode("saved");
    setActivityTab("saved");
  }

  function openCreateJobModal() {
    if (!useApi) {
      notify(t("vac.apiOnly", "Sign in with your account to post and browse jobs."));
      return;
    }
    setEditingJob(null);
    setPostError("");
    setPostForm(EMPTY_POST_FORM);
    setPostModalOpen(true);
  }

  function openEditJobModal(job) {
    setEditingJob(job);
    setPostError("");
    setPostForm(mapJobToPostForm(job));
    setPostModalOpen(true);
  }

  function closePostModal() {
    setPostModalOpen(false);
    setEditingJob(null);
    setPostError("");
  }

  async function removePostedJob(job) {
    const id = String(job.id);
    if (useApi && job._api && job.userPosted) {
      try {
        await jobsApi.deleteVacancy(id);
        await reloadVacancies();
        notify(t("vac.postRemoved", "Job listing removed"));
      } catch {
        notify(t("vac.postRemoveFailed", "Could not remove job listing."));
      }
      return;
    }
  }

  async function handleDeletePostedJob(job) {
    if (!window.confirm(t("vac.deleteConfirm", "Delete this job listing?"))) return;
    await removePostedJob(job);
  }

  async function resolveVacancyCompanyId(job, companyName) {
    const trimmed = String(companyName || "").trim();
    if (job?.companyId && trimmed.toLowerCase() === String(job.company || "").trim().toLowerCase()) {
      return job.companyId;
    }
    return resolveCompanyIdByName(trimmed, { location: postForm.location });
  }

  async function handlePostSubmit(event) {
    event.preventDefault();
    const isEdit = Boolean(editingJob);
    const publishedCompany = String(postForm.company || "").trim();

    if (useApi && isEdit && editingJob._api) {
      setPostSubmitting(true);
      setPostError("");
      try {
        const companyId = await resolveVacancyCompanyId(editingJob, publishedCompany);
        const body = mapPostFormToCreateVacancyRequest(postForm, companyId);
        await jobsApi.updateVacancy(editingJob.id, body);
        closePostModal();
        setMode("mine");
        await reloadVacancies();
        notify(`${t("vac.postUpdated", "Job updated")}: ${body.title} â€” ${publishedCompany}`);
      } catch (error) {
        setPostError(error?.message || t("vac.postUpdateFailed", "Could not update job."));
      } finally {
        setPostSubmitting(false);
      }
      return;
    }

    if (useApi && !isEdit) {
      setPostSubmitting(true);
      setPostError("");
      try {
        const companyId = await resolveCompanyIdByName(publishedCompany, { location: postForm.location });
        const body = mapPostFormToCreateVacancyRequest(postForm, companyId);
        await jobsApi.createVacancy(body);
        closePostModal();
        setMode("mine");
        await reloadVacancies();
        notify(`${t("vac.postDone", "Job published")}: ${body.title} â€” ${publishedCompany}`);
      } catch (error) {
        setPostError(error?.message || t("vac.postFailed", "Could not publish job."));
      } finally {
        setPostSubmitting(false);
      }
      return;
    }

    notify(t("vac.apiOnly", "Sign in with your account to post and browse jobs."));
  }

  function JobList({ jobs, variant = "browse" }) {
    return (
      <ul className="vac-job-list">
        {jobs.map((job) => {
          const id = String(job.id);
          const rowId = getRowJobId(job);
          const role = job.role || job.title;
          const city = job.location || job.city || t("vac.location.remote", "Remote");
          const isAiRecommendation = Boolean(job.aiRecommendation);
          const isSaved = useApi && job._api ? favoriteIds.has(id) : savedJobIds.has(rowId);
          const isApplied = useApi && job._api ? appliedJobIds.has(id) : appliedJobIds.has(rowId);
          const isMine = variant === "mine";
          const salaryLine = formatSalary(job.salaryMin, job.salaryMax);
          return (
            <li key={id} className="vac-job-row" data-role={role} data-company={job.company} data-location={city}>
              <img
                className="vac-job-row__logo"
                src={`https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(job.seed || job.company)}`}
                width="44"
                height="44"
                alt=""
              />
              <div className="vac-job-row__main">
                <p className="vac-job-row__title">
                  {isAiRecommendation
                    ? role
                    : `${role} â€” ${job.company} â€” ${city}`}
                </p>
                {salaryLine ? <p className="vac-job-row__salary">{salaryLine}</p> : null}
                <p className="vac-job-row__meta">
                  {isAiRecommendation
                    ? t("vac.aiMatch", "{score}% profile match", { score: job.matchScore || 0 })
                    : formatPosted(job.postedDays)}
                </p>
                <p className="vac-job-row__desc">{jobDesc(job)}</p>
                <div className="vac-job-row__tags">
                  {(job.tags || []).map((tag) => (
                    <span key={`${id}-${tag}`} className="vac-job-row__tag">
                      {t(`vac.tag.${String(tag).toLowerCase().replace(/[^a-z0-9]+/g, "_")}`, tag)}
                    </span>
                  ))}
                </div>
                {isAiRecommendation ? (
                  <div className="vac-job-row__actions">
                    <button
                      type="button"
                      className="vac-job-row__cta"
                      onClick={() => focusJobSearch({ searchQuery: role })}
                    >
                      {t("vac.searchRole", "Search roles")}
                    </button>
                  </div>
                ) : isMine ? (
                  <div className="vac-job-row__actions vac-job-row__actions--mine">
                    <button type="button" className="vac-job-row__edit" onClick={() => openEditJobModal(job)}>
                      {t("vac.editJob", "Edit")}
                    </button>
                    <button type="button" className="vac-job-row__delete" onClick={() => handleDeletePostedJob(job)}>
                      {t("vac.deleteJob", "Delete")}
                    </button>
                  </div>
                ) : (
                  <div className="vac-job-row__actions">
                    <button
                      type="button"
                      className="vac-job-row__cta"
                      disabled={isApplied}
                      aria-disabled={isApplied ? "true" : "false"}
                      onClick={() => {
                        if (!isApplied) openApplyModalFor(job);
                      }}
                    >
                      {isApplied ? t("vac.applied", "Applied") : t("vac.apply", "Apply")}
                    </button>
                    <button
                      type="button"
                      className={isSaved ? "vac-job-row__save vac-job-row__save--active" : "vac-job-row__save"}
                      aria-pressed={isSaved ? "true" : "false"}
                      onClick={() => handleSave(job)}
                    >
                      {isSaved ? t("vac.saved", "Saved") : t("vac.save", "Save")}
                    </button>
                  </div>
                )}
              </div>
              {!isMine && job.userPosted ? (
                <button
                  type="button"
                  className="vac-job-row__dismiss"
                  aria-label={t("vac.deleteJob", "Delete")}
                  onClick={() => handleDeletePostedJob(job)}
                >
                  Ã—
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <section className="page vacancies-page-legacy">
      <div className="home-shell home-shell--vacancies home-shell--jobs">
        <aside className="home-col-left home-card vac-jobs-sidebar">
          <nav className="vac-jobs-nav" aria-label={t("vac.nav.aria", "Job sections")}>
            {VAC_JOBS_NAV.map((item) => {
              const isActive = mode === item.id;
              const onSelect =
                item.id === "saved"
                  ? openSavedVacancies
                  : () => setMode(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={
                    isActive
                      ? `vac-jobs-nav__link vac-jobs-nav__link--active vac-jobs-nav__link--${item.icon}`
                      : `vac-jobs-nav__link vac-jobs-nav__link--${item.icon}`
                  }
                  onClick={onSelect}
                >
                  <span className={`vac-jobs-nav__icon vac-jobs-nav__icon--${item.icon}`} aria-hidden="true">
                    <VacJobsNavIcon type={item.icon} />
                  </span>
                  <span className="vac-jobs-nav__label">{t(item.labelKey, item.fallback)}</span>
                </button>
              );
            })}
          </nav>
          <button
            type="button"
            className="vac-jobs-post"
            onClick={openCreateJobModal}
          >
            <span className="vac-jobs-post__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </span>
            <span>{t("vac.postJob", "Post a job")}</span>
          </button>
        </aside>

        <main className="home-col-feed vac-jobs-feed">
          {useApi ? (
            <LoadStatus
              isLoading={isLoading}
              loadError={loadError}
              onRetry={reloadVacancies}
              t={t}
            />
          ) : (
            <p className="vac-advanced-search__subtitle">
              {t("vac.apiOnly", "Sign in with your account to post and browse jobs.")}
            </p>
          )}
          {mode === "browse" && (
            <>
              <section className="home-card vac-advanced-search" id="vacAdvancedSearch">
                <header className="vac-advanced-search__head">
                  <div className="vac-advanced-search__head-row">
                    <div className="vac-advanced-search__head-text">
                      <h2 className="vac-advanced-search__title">{t("vac.search.title", "Advanced job search")}</h2>
                      <p className="vac-advanced-search__subtitle">
                        {t("vac.search.subtitle", "Filter by role, location, work type, seniority, and salary â€” like LinkedIn.")}
                      </p>
                    </div>
                  </div>
                  <p className="vac-advanced-search__stats-bar">
                    {tmpl(
                      "vac.search.found",
                      { found: String(filtered.length), total: String(browseTotal) },
                      `Found: ${filtered.length} of ${browseTotal} jobs`,
                    )}
                  </p>
                </header>
                <div className="vac-advanced-search__body">
                  <div className="vac-advanced-search__body-inner">
                    <form
                      className="vac-advanced-search__form"
                      onSubmit={(event) => event.preventDefault()}
                    >
                      <label className="vac-field vac-field--query">
                        <span>{t("vac.field.keywords", "Keywords")}</span>
                        <input
                          type="search"
                          placeholder={t("vac.placeholder.keywords", "e.g. Frontend Developer, DevOps, React")}
                          value={query}
                          onChange={(event) => setQuery(event.target.value)}
                        />
                      </label>
                      <label className="vac-field vac-field--location">
                        <span>{t("vac.field.location", "Location")}</span>
                        <input
                          type="text"
                          placeholder={t("vac.placeholder.location", "Remote, Toronto, San Francisco")}
                          value={location}
                          onChange={(event) => setLocation(event.target.value)}
                        />
                      </label>
                      <label className="vac-field">
                        <span>{t("vac.field.employment", "Employment type")}</span>
                        <select value={jobType} onChange={(event) => setJobType(event.target.value)}>
                          <option value="">{t("vac.any", "Any")}</option>
                          <option value="full-time">{t("vac.type.full", "Full-time")}</option>
                          <option value="part-time">{t("vac.type.part", "Part-time")}</option>
                          <option value="contract">{t("vac.type.contract", "Contract")}</option>
                          <option value="internship">{t("vac.type.internship", "Internship")}</option>
                        </select>
                      </label>
                      <label className="vac-field">
                        <span>{t("vac.field.seniority", "Seniority")}</span>
                        <select value={jobLevel} onChange={(event) => setJobLevel(event.target.value)}>
                          <option value="">{t("vac.any", "Any")}</option>
                          <option value="entry">{t("vac.level.entry", "Junior / Entry")}</option>
                          <option value="middle">{t("vac.level.middle", "Middle")}</option>
                          <option value="senior">{t("vac.level.senior", "Senior")}</option>
                          <option value="lead">{t("vac.level.lead", "Lead")}</option>
                        </select>
                      </label>
                      <label className="vac-field">
                        <span>{t("vac.field.minSalary", "Min. salary (k $/year)")}</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder={t("vac.placeholder.minSalary", "e.g. 80")}
                          value={salaryMin}
                          onChange={(event) => setSalaryMin(event.target.value)}
                        />
                      </label>
                      <label className="vac-field">
                        <span>{t("vac.field.sortBy", "Sort by")}</span>
                        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                          <option value="relevance">{t("vac.sort.relevance", "Relevance")}</option>
                          <option value="salary_desc">{t("vac.sort.salaryDesc", "Salary â†“")}</option>
                          <option value="salary_asc">{t("vac.sort.salaryAsc", "Salary â†‘")}</option>
                          <option value="newest">{t("vac.sort.newest", "Newest first")}</option>
                        </select>
                      </label>
                      <div className="vac-advanced-search__form-footer">
                        <label className="vac-advanced-search__checkbox">
                          <input
                            type="checkbox"
                            checked={remoteOnly}
                            onChange={(event) => setRemoteOnly(event.target.checked)}
                          />
                          <span>{t("vac.remoteOnly", "Remote only")}</span>
                        </label>
                        <div className="vac-advanced-search__actions">
                          <button
                            type="button"
                            className="vac-advanced-search__btn vac-advanced-search__btn--primary"
                            onClick={() => reloadVacancies()}
                          >
                            {t("vac.applyFilters", "Apply filters")}
                          </button>
                          {useApi ? (
                            <button
                              type="button"
                              className="vac-advanced-search__btn"
                              disabled={saveSearchLoading}
                              onClick={handleSaveCurrentSearch}
                            >
                              {saveSearchLoading
                                ? t("vac.saveSearchSaving", "Saving...")
                                : t("vac.saveSearch", "Save search")}
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="vac-advanced-search__btn"
                            onClick={() => {
                              setQuery("");
                              setLocation("");
                              setJobType("");
                              setJobLevel("");
                              setSalaryMin("");
                              setSortBy("relevance");
                              setRemoteOnly(false);
                            }}
                          >
                            {t("vac.reset", "Reset")}
                          </button>
                        </div>
                      </div>
                    </form>
                    <div className="vac-advanced-search__quick">
                      {quickChips.map((chip) => (
                        <button
                          key={chip.id}
                          type="button"
                          className="vac-quick-chip"
                          onClick={() =>
                            useApi && recommendedQueries.length > 0
                              ? applyRecommendedQuery(chip.label)
                              : chip.label === "remote"
                                ? setRemoteOnly(true)
                                : setQuery(chip.label)
                          }
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="home-card vac-job-card vac-job-card--queries">
                <h2 className="vac-job-card__title vac-job-card__title--sm">
                  {useApi && recommendedQueries.length > 0
                    ? t("vac.recommendedQueries", "Recommended searches")
                    : t("vac.quickFilters", "Quick filters")}
                </h2>
                <p className="vac-job-card__subtitle vac-job-card__subtitle--sm">
                  {useApi && recommendedQueries.length > 0
                    ? t("vac.recommendedQueriesSub", "Suggested job searches from LinkUp.")
                    : t("vac.quickFiltersSub", "Tap a tag to instantly filter job listings.")}
                </p>
                <div className="vac-query-pills">
                  {queryPills.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      className="vac-query-pill"
                      onClick={() =>
                        useApi && recommendedQueries.length > 0
                          ? applyRecommendedQuery(chip.label)
                          : applyDemoQueryPill(chip.label)
                      }
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </section>

              {topJobs.length > 0 && (
                <section className="home-card vac-job-card">
                  <header className="vac-job-card__header">
                    <h2 className="vac-job-card__title">
                      {topJobsFromAi
                        ? t("vac.aiTopPicks", "AI recommended jobs")
                        : t("vac.topPicks", "Top job picks")}
                    </h2>
                    <p className="vac-job-card__subtitle">
                      {topJobsFromAi
                        ? t("vac.aiTopPicksSub", "Personalised roles based on your skills and experience.")
                        : t("vac.topPicksSub", "Based on your profile, settings, and activity.")}
                    </p>
                  </header>
                  <JobList jobs={topJobs} />
                  <button
                    type="button"
                    className="vac-job-card__footer-link"
                    onClick={() => focusJobSearch({ clearFilters: true })}
                  >
                    <span>{t("vac.showAll", "Show all")}</span> <span aria-hidden="true">â†’</span>
                  </button>
                </section>
              )}

              {useApi && filtered.length > 0 && (
                <section className="home-card vac-job-card">
                  <header className="vac-job-card__header">
                    <h2 className="vac-job-card__title">{t("vac.searchResults", "Search results")}</h2>
                    <p className="vac-job-card__subtitle">
                      {t("vac.searchResultsSub", "Vacancies matching your filters from LinkUp.")}
                    </p>
                  </header>
                  <JobList jobs={filtered} />
                </section>
              )}

              <section className="home-card vac-user-hub" id="vacUserHub">
                <header className="vac-user-hub__head">
                  <h2 className="vac-user-hub__title">{t("vac.myActivity", "My activity")}</h2>
                  <div className="vac-user-hub__tabs">
                    <button
                      type="button"
                      className={activityTab === "applied" ? "vac-user-hub__tab vac-user-hub__tab--active" : "vac-user-hub__tab"}
                      onClick={() => setActivityTab("applied")}
                    >
                      {t("vac.myApplied", "My applied")}
                    </button>
                    <button
                      type="button"
                      className={activityTab === "saved" ? "vac-user-hub__tab vac-user-hub__tab--active" : "vac-user-hub__tab"}
                      onClick={() => setActivityTab("saved")}
                    >
                      {t("vac.mySaved", "Saved")}
                    </button>
                    {useApi ? (
                      <button
                        type="button"
                        className={
                          activityTab === "searches"
                            ? "vac-user-hub__tab vac-user-hub__tab--active"
                            : "vac-user-hub__tab"
                        }
                        onClick={() => setActivityTab("searches")}
                      >
                        {t("vac.mySavedSearches", "Saved searches")}
                      </button>
                    ) : null}
                  </div>
                </header>
                {activityTab === "searches" && useApi ? (
                  savedSearchQueries.length > 0 ? (
                    <ul className="vac-user-hub__list">
                      {savedSearchQueries.map((item) => (
                        <li key={`search-${item.id}`} className="vac-user-hub__item">
                          <strong>
                            {formatSearchQueryLabel(item, t("vac.savedSearchUntitled", "Saved search"))}
                          </strong>
                          <span>
                            {item.query ? `${t("vac.field.keywords", "Keywords")}: ${item.query}` : ""}
                            {item.query && item.location ? " Â· " : ""}
                            {item.location ? `${t("vac.field.location", "Location")}: ${item.location}` : ""}
                          </span>
                          <div className="vac-user-hub__item-actions">
                            <button type="button" className="vac-user-hub__btn" onClick={() => applySavedSearch(item)}>
                              {t("vac.runSearch", "Run search")}
                            </button>
                            <button
                              type="button"
                              className="vac-user-hub__btn"
                              onClick={() => handleDeleteSavedSearch(item.id)}
                            >
                              {t("vac.removeSavedSearch", "Remove")}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="vac-user-hub__empty">
                      {t("vac.emptySavedSearches", "No saved searches yet. Use Save search in the filter form.")}
                    </p>
                  )
                ) : activityTab === "applied" ? (
                  appliedJobs.length ? (
                    <ul className="vac-user-hub__list">
                      {appliedJobs.map((item) => (
                        <li key={`applied-${item.id}`} className="vac-user-hub__item">
                          <strong>{`${item.role || "Role"} â€” ${item.company || "Company"}`}</strong>
                          <span>
                            {`${item.location || ""} Â· ${t("vac.appliedOn", "Applied on")}: ${formatDate(item.submittedAt)}`}
                          </span>
                          <span>{`${t("vac.resume", "Resume")}: ${item.resumeName || "â€”"}`}</span>
                          <div className="vac-user-hub__item-actions">
                            <button type="button" className="vac-user-hub__btn" onClick={() => handleWithdrawApplication(item.id)}>
                              {t("vac.withdraw", "Withdraw")}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="vac-user-hub__empty">{t("vac.emptyApplied", "You have not applied yet.")}</p>
                  )
                ) : savedJobs.length ? (
                  <ul className="vac-user-hub__list">
                    {savedJobs.map((item) => (
                      <li key={`saved-${item.id}`} className="vac-user-hub__item">
                        <strong>{`${item.role || "Role"} â€” ${item.company || "Company"}`}</strong>
                        <span>{`${item.location || ""} Â· ${item.salary || "â€”"}`}</span>
                        <span>{item.meta || ""}</span>
                        <div className="vac-user-hub__item-actions">
                          <button type="button" className="vac-user-hub__btn" onClick={() => handleRemoveSaved(item.id)}>
                            {t("vac.removeSaved", "Remove")}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="vac-user-hub__empty">{t("vac.emptySaved", "No saved jobs yet.")}</p>
                )}
              </section>
            </>
          )}

          {mode === "mine" && (
            <section className="home-card vac-job-card" id="vacMyJobsCard">
              <header className="vac-job-card__header">
                <h2 className="vac-job-card__title">{t("vac.myPosted", "My posted jobs")}</h2>
                <p className="vac-job-card__subtitle">{t("vac.myPostedSub", "Vacancies you created with Post a job.")}</p>
              </header>
              {myJobs.length > 0 ? (
                <JobList jobs={myJobs} variant="mine" />
              ) : (
                <div className="vac-my-jobs-empty">
                  <p>{t("vac.emptyPosted", "You haven't posted any jobs yet. Create your first listing.")}</p>
                  <button type="button" className="vac-jobs-post vac-jobs-post--inline" onClick={openCreateJobModal}>
                    <span>{t("vac.postJob", "Post a job")}</span>
                  </button>
                </div>
              )}
            </section>
          )}

          {mode === "saved" && (
            <section className="home-card vac-job-card" id="vacSavedJobsCard">
              <header className="vac-job-card__header">
                <h2 className="vac-job-card__title">{t("vac.nav.savedJobs", "Saved vacancies")}</h2>
                <p className="vac-job-card__subtitle">{t("vac.emptySaved", "No saved jobs yet.")}</p>
              </header>
              {savedJobs.length ? (
                <ul className="vac-user-hub__list">
                  {savedJobs.map((item) => (
                    <li key={`saved-mode-${item.id}`} className="vac-user-hub__item">
                      <strong>{`${item.role || "Role"} â€” ${item.company || "Company"}`}</strong>
                      <span>{`${item.location || ""} Â· ${item.salary || "â€”"}`}</span>
                      <span>{item.meta || ""}</span>
                      <div className="vac-user-hub__item-actions">
                        <button type="button" className="vac-user-hub__btn" onClick={() => handleRemoveSaved(item.id)}>
                          {t("vac.removeSaved", "Remove")}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="vac-my-jobs-empty">
                  <p>{t("vac.emptySaved", "No saved jobs yet.")}</p>
                </div>
              )}
            </section>
          )}
        </main>

        <aside className="home-col-right home-card home-messages">
          <div className="home-messages__head">
            <h2 className="home-messages__title">{t("vac.messages.title", "Messages")}</h2>
          </div>
          <input className="home-messages__search" type="search" placeholder={t("vac.messages.search", "Search messages")} />
          <div className="home-messages__list">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <button key={chat.id} type="button" className="home-messages__item" onClick={() => navigate("/chat")}>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(chat.peer)}`} width="34" height="34" alt="" />
                  <span>
                    <strong>{chat.peer}</strong>
                    <small>{chat.messages?.[chat.messages.length - 1]?.text || t("vac.messages.noneYet", "No messages yet")}</small>
                  </span>
                </button>
              ))
            ) : (
              <div className="home-messages__empty">
                <p>{t("vac.messages.empty", "No messages yet. Send one to start a conversation.")}</p>
                <button type="button" className="home-messages__cta" onClick={() => navigate("/chat")}>
                  {t("vac.messages.write", "Write a message")}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {postModalOpen && (
        <div className="vac-apply-modal">
          <div className="vac-apply-modal__backdrop" onClick={closePostModal} />
          <section className="vac-apply-modal__dialog vac-apply-modal__dialog--wide">
            <button type="button" className="vac-apply-modal__close" onClick={closePostModal}>
              Ã—
            </button>
            <header className="vac-apply-modal__head">
              <h3 className="vac-apply-modal__title">
                {editingJob ? t("vac.editJob", "Edit job") : t("vac.postJob", "Post a job")}
              </h3>
              <p className="vac-apply-modal__subtitle">
                {editingJob
                  ? t("vac.editJobSub", "Update your listing â€” changes appear in job picks right away.")
                  : t("vac.postJobSub", "Create a new listing â€” it appears in job picks right away.")}
              </p>
            </header>
            <form
              className="vac-apply-modal__form"
              onSubmit={handlePostSubmit}
            >
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.jobTitle", "Job title")}</span>
                <input
                  type="text"
                  required
                  placeholder={t("vac.placeholder.jobTitle", "e.g. Frontend Developer")}
                  value={postForm.role}
                  onChange={(event) => setPostForm((prev) => ({ ...prev, role: event.target.value }))}
                />
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.company", "Company")}</span>
                <input
                  type="text"
                  required
                  placeholder={t("vac.placeholder.company", "e.g. Acme Inc")}
                  value={postForm.company}
                  onChange={(event) => setPostForm((prev) => ({ ...prev, company: event.target.value }))}
                />
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.location", "Location")}</span>
                <input
                  type="text"
                  required
                  placeholder={t("vac.placeholder.postLocation", "Remote, Kyiv, Berlinâ€¦")}
                  value={postForm.location}
                  onChange={(event) => setPostForm((prev) => ({ ...prev, location: event.target.value }))}
                />
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.employment", "Employment type")}</span>
                <select value={postForm.type} onChange={(event) => setPostForm((prev) => ({ ...prev, type: event.target.value }))}>
                  <option value="full-time">{t("vac.type.full", "Full-time")}</option>
                  <option value="part-time">{t("vac.type.part", "Part-time")}</option>
                  <option value="contract">{t("vac.type.contract", "Contract")}</option>
                  <option value="internship">{t("vac.type.internship", "Internship")}</option>
                </select>
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.seniority", "Seniority")}</span>
                <select value={postForm.level} onChange={(event) => setPostForm((prev) => ({ ...prev, level: event.target.value }))}>
                  <option value="entry">{t("vac.level.entry", "Junior / Entry")}</option>
                  <option value="middle">{t("vac.level.middle", "Middle")}</option>
                  <option value="senior">{t("vac.level.senior", "Senior")}</option>
                  <option value="lead">{t("vac.level.lead", "Lead")}</option>
                </select>
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.workFormat", "Work format")}</span>
                <select value={postForm.remote} onChange={(event) => setPostForm((prev) => ({ ...prev, remote: event.target.value }))}>
                  <option value="yes">{t("vac.remote", "Remote")}</option>
                  <option value="hybrid">{t("vac.hybrid", "Hybrid")}</option>
                  <option value="no">{t("vac.onsite", "On-site")}</option>
                </select>
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.minSalary", "Min. salary (k $/year)")}</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder={t("vac.placeholder.minSalary", "e.g. 80")}
                  value={postForm.salaryMin}
                  onChange={(event) => setPostForm((prev) => ({ ...prev, salaryMin: event.target.value }))}
                />
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.maxSalary", "Max. salary (k $/year)")}</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder={t("vac.placeholder.maxSalary", "e.g. 120")}
                  value={postForm.salaryMax}
                  onChange={(event) => setPostForm((prev) => ({ ...prev, salaryMax: event.target.value }))}
                />
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.jobDescription", "Job description")}</span>
                <textarea
                  rows={4}
                  placeholder={t("vac.placeholder.jobDescription", "Describe responsibilities, stack, and requirementsâ€¦")}
                  value={postForm.desc}
                  onChange={(event) => setPostForm((prev) => ({ ...prev, desc: event.target.value }))}
                />
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.keywordsOptional", "Keywords (optional)")}</span>
                <input
                  type="text"
                  placeholder={t("vac.placeholder.keywordsShort", "react, typescript, remote")}
                  value={postForm.keywords}
                  onChange={(event) => setPostForm((prev) => ({ ...prev, keywords: event.target.value }))}
                />
              </label>
              {postError ? <p className="vac-apply-modal__error">{postError}</p> : null}
              <div className="vac-apply-modal__actions">
                <button
                  type="button"
                  className="vac-apply-modal__btn vac-apply-modal__btn--ghost"
                  disabled={postSubmitting}
                  onClick={closePostModal}
                >
                  {t("vac.cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="vac-apply-modal__btn vac-apply-modal__btn--primary"
                  disabled={postSubmitting}
                >
                  {postSubmitting
                    ? editingJob
                      ? t("vac.postSaving", "Saving...")
                      : t("vac.postPublishing", "Publishing...")
                    : editingJob
                      ? t("vac.saveChanges", "Save changes")
                      : t("vac.publishJob", "Publish job")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {applyModalOpen && (
        <div className="vac-apply-modal">
          <div className="vac-apply-modal__backdrop" onClick={() => setApplyModalOpen(false)} />
          <section className="vac-apply-modal__dialog">
            <button type="button" className="vac-apply-modal__close" onClick={() => setApplyModalOpen(false)}>
              Ã—
            </button>
            <header className="vac-apply-modal__head">
              <h3 className="vac-apply-modal__title">{t("vac.quickApply", "Quick apply")}</h3>
              <p className="vac-apply-modal__subtitle">
                {activeJobForApply
                  ? `${activeJobForApply.role || activeJobForApply.title} Â· ${activeJobForApply.company} Â· ${formatSalary(
                      activeJobForApply.salaryMin,
                      activeJobForApply.salaryMax,
                    )}`
                  : "â€”"}
              </p>
            </header>
            <form
              className="vac-apply-modal__form"
              onSubmit={(event) => {
                event.preventDefault();
                if (!activeJobForApply) return;
                const fullName = String(applyForm.fullName || "").trim();
                const email = String(applyForm.email || "").trim();
                if (!fullName || !email) {
                  setApplyError(t("vac.applyFillRequired", "Fill in required fields"));
                  return;
                }
                if (!selectedResumeData) {
                  setApplyError(t("vac.applyNeedResume", "Attach a resume before submitting"));
                  return;
                }
                const rowId = getRowJobId(activeJobForApply);
                const submitLocal = () => {
                  const entry = {
                    id: rowId,
                    role: String(activeJobForApply.role || activeJobForApply.title || "").trim(),
                    company: String(activeJobForApply.company || "").trim(),
                    location: String(activeJobForApply.location || activeJobForApply.city || "").trim(),
                    fullName,
                    email,
                    phone: String(applyForm.phone || "").trim(),
                    about: String(applyForm.about || "").trim(),
                    resumeName: selectedResumeName || "resume",
                    submittedAt: new Date().toISOString(),
                  };
                  setApplicationsMap((prev) => {
                    const next = { ...prev, [rowId]: entry };
                    writeApplications(next);
                    return next;
                  });
                  saveResumeToProfile(selectedResumeName, selectedResumeData);
                  setApplyModalOpen(false);
                  notify(`${t("vac.applyDone", "Application sent")}: ${entry.role}`);
                };

                if (useApi && activeJobForApply._api) {
                  jobsApi
                    .applyToVacancy(String(activeJobForApply.id))
                    .then(() => reloadVacancies())
                    .then(() => {
                      saveResumeToProfile(selectedResumeName, selectedResumeData);
                      setApplyModalOpen(false);
                      notify(`${t("vac.applyDone", "Application sent")}: ${activeJobForApply.role || activeJobForApply.title}`);
                    })
                    .catch(() => setApplyError(t("vac.applyFailed", "Failed to submit application.")));
                  return;
                }
                submitLocal();
              }}
            >
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.fullName", "Full name")}</span>
                <input
                  type="text"
                  required
                  value={applyForm.fullName}
                  onChange={(event) => setApplyForm((prev) => ({ ...prev, fullName: event.target.value }))}
                />
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("auth.field.email", "Email")}</span>
                <input
                  type="email"
                  required
                  value={applyForm.email}
                  onChange={(event) => setApplyForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.phone", "Phone")}</span>
                <input
                  type="tel"
                  value={applyForm.phone}
                  onChange={(event) => setApplyForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </label>
              <label className="vac-apply-modal__field">
                <span>{t("vac.field.whyFit", "Why you are a fit")}</span>
                <textarea
                  rows={4}
                  placeholder={t("vac.placeholder.whyFit", "Briefly describe your relevant experience...")}
                  value={applyForm.about}
                  onChange={(event) => setApplyForm((prev) => ({ ...prev, about: event.target.value }))}
                />
              </label>
              <div className="vac-apply-modal__field">
                <span>{t("vac.resume", "Resume")}</span>
                <p className="vac-apply-modal__resume-name">
                  {selectedResumeName || t("vac.applyResumeEmpty", "No file selected")}
                </p>
                <div className="vac-apply-modal__actions vac-apply-modal__actions--inline">
                  <button
                    type="button"
                    className="vac-apply-modal__btn vac-apply-modal__btn--ghost"
                    onClick={() => {
                      try {
                        const account = readRegisteredAccount();
                        setSelectedResumeName(account.resumeName || "");
                        setSelectedResumeData(account.resumeDataUrl || "");
                        if (account.resumeDataUrl) setApplyError("");
                        else setApplyError(t("vac.applyNoSavedResume", "Saved resume is not available yet"));
                      } catch {
                        setApplyError(t("vac.applyNoSavedResume", "Saved resume is not available yet"));
                      }
                    }}
                  >
                    {t("vac.applyUseSavedResume", "Use saved")}
                  </button>
                  <label className="vac-apply-modal__btn vac-apply-modal__btn--ghost">
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        event.target.value = "";
                        if (file.size > MAX_RESUME_SIZE) {
                          setApplyError(t("vac.applyResumeTooLarge", "File is too large (up to 1.8MB)"));
                          return;
                        }
                        try {
                          const dataUrl = await readFileAsDataUrl(file);
                          setSelectedResumeName(file.name || "resume");
                          setSelectedResumeData(dataUrl);
                          setApplyError("");
                        } catch {
                          setApplyError(t("vac.applyResumeReadFail", "Failed to read resume file"));
                        }
                      }}
                    />
                    {t("vac.applyUploadResume", "Upload")}
                  </label>
                </div>
              </div>
              {applyError ? <p className="vac-apply-modal__error">{applyError}</p> : null}
              <div className="vac-apply-modal__actions">
                <button type="button" className="vac-apply-modal__btn vac-apply-modal__btn--ghost" onClick={() => setApplyModalOpen(false)}>
                  {t("vac.cancel", "Cancel")}
                </button>
                <button type="submit" className="vac-apply-modal__btn vac-apply-modal__btn--primary">
                  {t("vac.submitApply", "Submit application")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
