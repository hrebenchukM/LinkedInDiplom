import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { useNetworkStore } from "../../features/network/NetworkStore";
import { useProfileStore } from "../../features/profile/ProfileStore";
import { useUiSettings } from "../../app/providers/AppProviders";
import { patchRegisteredAccount, readRegisteredAccount } from "../../shared/lib/registeredAccount";
import { resolveMediaUrl } from "../../features/profile/mapProfile";
import { readJson, writeJson } from "../../shared/lib/storage";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import { buildCreateCertificateBody } from "../../features/professional/mapCertificate";
import {
  buildCreateRecommendationBody,
  buildPatchRecommendationBody,
} from "../../features/professional/mapRecommendation";
import { buildCreateEducationBodyFromProfileForm } from "../../features/professional/mapEducation";
import { buildCreateExperienceBodyFromProfileForm } from "../../features/professional/mapExperience";
import {
  createMyCertificate,
  createMyEducation,
  createMyExperience,
  createMyUserLanguage,
  createMyUserSkill,
  createRecommendation,
  deleteMyCertificate,
  deleteMyEducation,
  deleteMyExperience,
  updateMyExperience,
  deleteMyUserLanguage,
  deleteMyUserSkill,
  deleteRecommendation,
  linkAcademyAffiliation,
  loadGivenRecommendationItems,
  loadMyAffiliatedAcademies,
  loadMyCertificateHistoryItems,
  loadMyEducationHistoryItems,
  loadMyExperienceHistoryItems,
  loadMyPrimaryCompany,
  loadMySkillsWithNames,
  loadMyUserLanguagesWithNames,
  loadReceivedRecommendationItems,
  loadRecommendedSkillSuggestions,
  patchRecommendation,
  resolveCompanyIdByName,
  savePrimaryCompanyFromForm,
  searchAcademies,
  searchLanguages,
  searchSkills,
  unlinkAcademyAffiliation,
} from "../../features/professional/professionalApi";
import { persistLocalProfileFields } from "../../features/profile/profileLocalFields";
import { fetchProfilesByUserIds } from "../../features/profile/profileApi";
import {
  fetchMyProfileViews,
  formatProfileViewDate,
  mapProfileViewsToRows,
} from "../../features/profile/profileViewsApi";
import { LoadStatus } from "../../shared/ui/LoadStatus";
import "./profile-legacy.css";

const VISIBILITY_KEY = "uiProfileVisibility";

function LocalOnlyBadge({ t }) {
  return (
    <span className="lk-local-only">{t("profile.localOnly", "Saved on this device only")}</span>
  );
}

const avatarIcons = [
  { id: "cat", label: "Cat", url: "https://api.iconify.design/twemoji:cat-face.svg" },
  { id: "dog", label: "Dog", url: "https://api.iconify.design/twemoji:dog-face.svg" },
  { id: "fox", label: "Fox", url: "https://api.iconify.design/twemoji:fox.svg" },
  { id: "bear", label: "Bear", url: "https://api.iconify.design/twemoji:bear.svg" },
  { id: "panda", label: "Panda", url: "https://api.iconify.design/twemoji:panda.svg" },
  { id: "koala", label: "Koala", url: "https://api.iconify.design/twemoji:koala.svg" },
  { id: "tiger", label: "Tiger", url: "https://api.iconify.design/twemoji:tiger.svg" },
  { id: "rabbit", label: "Rabbit", url: "https://api.iconify.design/twemoji:rabbit-face.svg" },
  { id: "mouse", label: "Mouse", url: "https://api.iconify.design/twemoji:mouse-face.svg" },
  { id: "monkey", label: "Monkey", url: "https://api.iconify.design/twemoji:monkey-face.svg" },
  { id: "wolf", label: "Wolf", url: "https://api.iconify.design/twemoji:wolf.svg" },
  { id: "lion", label: "Lion", url: "https://api.iconify.design/twemoji:lion.svg" },
];

const HOT_ACADEMIES = [
  "Kyiv Polytechnic Institute",
  "MIT",
  "Stanford University",
  "Harvard University",
  "University of Oxford",
  "ETH Zurich",
  "TU Munich",
  "Warsaw University of Technology",
];

const HOT_LANGUAGES = [
  "English",
  "Ukrainian",
  "German",
  "Spanish",
  "French",
  "Polish",
  "Italian",
  "Portuguese",
];

const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "Native"];

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("file_read_failed"));
    reader.readAsDataURL(file);
  });
}

function normalizeHistory(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      title: String(item.title || "").trim(),
      meta: String(item.meta || "").trim(),
      experienceId: item.experienceId ? String(item.experienceId) : undefined,
      educationId: item.educationId ? String(item.educationId) : undefined,
      certificateId: item.certificateId ? String(item.certificateId) : undefined,
      userLanguageId: item.userLanguageId ? String(item.userLanguageId) : undefined,
      academyId: item.academyId ? String(item.academyId) : undefined,
      recommendationId: item.recommendationId ? String(item.recommendationId) : undefined,
      _api: Boolean(item._api),
    }))
    .filter((item) => item.title);
}

function tmpl(key, vars, fallback) {
  return typeof window.uiTmpl === "function" ? window.uiTmpl(key, vars, fallback) : fallback || key;
}

function buildFormState(buildInitialForm, sessionUser) {
  const saved = readRegisteredAccount();
  const base = buildInitialForm();
  return {
    firstName: base.firstName,
    lastName: base.lastName,
    email: base.email || sessionUser?.email || saved.email || "",
    specialty: base.specialty,
    position: base.position,
    company: saved.company || "",
    experienceFrom: saved.experienceFrom || "",
    experienceTo: saved.experienceTo || "",
    city: base.city,
    country: base.country,
    phone: saved.phone || "",
    education: base.education,
    educationPeriod: saved.educationPeriod || "",
    about: base.about,
    avatarDataUrl: typeof saved.avatarDataUrl === "string" ? saved.avatarDataUrl : "",
    headerDataUrl: typeof saved.headerDataUrl === "string" ? saved.headerDataUrl : "",
    resumeName: typeof saved.resumeName === "string" ? saved.resumeName : "",
    resumeDataUrl: typeof saved.resumeDataUrl === "string" ? saved.resumeDataUrl : "",
    portfolioUrl: typeof saved.portfolioUrl === "string" ? saved.portfolioUrl : "",
    skills: [],
    experienceItems: normalizeHistory(saved.experienceItems),
    educationItems: [],
    projectItems: [],
    certificateItems: normalizeHistory(saved.certificateItems),
    languageItems: normalizeHistory(saved.languageItems),
    academyItems: normalizeHistory(saved.academyItems),
    recommendationItems: normalizeHistory(saved.recommendationItems),
    recommendationGivenItems: normalizeHistory(saved.recommendationGivenItems),
    visibility: readJson(VISIBILITY_KEY, "public"),
  };
}

export function ProfilePage() {
  const { session, syncUserProfile } = useAuth();
  const {
    profile,
    buildInitialForm,
    saveProfileForm,
    uploadAvatar,
    uploadHeader,
    isLoading,
    loadError,
    reloadFromApi,
    loadProfessionalIntoForm,
  } = useProfileStore();
  const { people } = useNetworkStore();
  const { theme, lang, setTheme, setLang, t } = useUiSettings();
  const usesApiProfile = session.isAuthenticated && !session.user?.isGuest && !USE_MOCK_AUTH;

  const [form, setForm] = useState(() => buildFormState(buildInitialForm, session.user));
  const [skillDraft, setSkillDraft] = useState("");
  const [skillInputFocused, setSkillInputFocused] = useState(false);
  const [saveHint, setSaveHint] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState(form.avatarDataUrl);
  const [apiSkills, setApiSkills] = useState([]);
  const [apiSkillSuggestions, setApiSkillSuggestions] = useState([]);
  const [apiPrimaryCompany, setApiPrimaryCompany] = useState(null);
  const [editingExperienceId, setEditingExperienceId] = useState(null);
  const [apiCertificates, setApiCertificates] = useState([]);
  const [certForm, setCertForm] = useState({ name: "", issueDate: "", expiryDate: "" });
  const [apiLanguages, setApiLanguages] = useState([]);
  const [languageDraft, setLanguageDraft] = useState("");
  const [languageLevelDraft, setLanguageLevelDraft] = useState("B2");
  const [languageInputFocused, setLanguageInputFocused] = useState(false);
  const [apiLanguageSuggestions, setApiLanguageSuggestions] = useState([]);
  const [apiAcademies, setApiAcademies] = useState([]);
  const [academyDraft, setAcademyDraft] = useState("");
  const [academyInputFocused, setAcademyInputFocused] = useState(false);
  const [apiAcademySuggestions, setApiAcademySuggestions] = useState([]);
  const [profileViewRows, setProfileViewRows] = useState([]);
  const [apiReceivedRecommendations, setApiReceivedRecommendations] = useState([]);
  const [apiGivenRecommendations, setApiGivenRecommendations] = useState([]);
  const [recommendationRecipientId, setRecommendationRecipientId] = useState("");
  const [recommendationText, setRecommendationText] = useState("");
  const [editingRecommendationId, setEditingRecommendationId] = useState("");

  const recommendationContacts = useMemo(() => {
    const currentUserId = String(session.user?.id || "");
    return people.filter((person) => person.userId && String(person.userId) !== currentUserId);
  }, [people, session.user?.id]);

  useEffect(() => {
    if (isLoading) return;
    const next = buildFormState(buildInitialForm, session.user);
    setForm(next);
    setPendingAvatar(next.avatarDataUrl);
  }, [isLoading, profile.name, profile.headline, profile.city, profile.about, session.user?.id, buildInitialForm, session.user]);

  useEffect(() => {
    if (!usesApiProfile) return;
    loadProfessionalIntoForm().then((items) => {
      if (!items.length) return;
      setForm((prev) => ({ ...prev, experienceItems: items }));
    });
  }, [usesApiProfile, loadProfessionalIntoForm]);

  useEffect(() => {
    if (!usesApiProfile) return;
    loadMyEducationHistoryItems()
      .then((items) => {
        setForm((prev) => ({ ...prev, educationItems: items }));
      })
      .catch(() => {});
  }, [usesApiProfile]);

  const reloadApiSkills = useCallback(async () => {
    if (!usesApiProfile) return;
    try {
      setApiSkills(await loadMySkillsWithNames());
    } catch {
      setApiSkills([]);
    }
  }, [usesApiProfile]);

  const reloadPrimaryCompany = useCallback(async () => {
    if (!usesApiProfile) return;
    try {
      const company = await loadMyPrimaryCompany();
      setApiPrimaryCompany(company);
      if (company?.name) {
        setForm((prev) => ({ ...prev, company: company.name }));
      }
    } catch {
      setApiPrimaryCompany(null);
    }
  }, [usesApiProfile]);

  const reloadApiCertificates = useCallback(async () => {
    if (!usesApiProfile) return;
    try {
      setApiCertificates(await loadMyCertificateHistoryItems());
    } catch {
      setApiCertificates([]);
    }
  }, [usesApiProfile]);

  const reloadApiLanguages = useCallback(async () => {
    if (!usesApiProfile) return;
    try {
      setApiLanguages(await loadMyUserLanguagesWithNames());
    } catch {
      setApiLanguages([]);
    }
  }, [usesApiProfile]);

  const reloadApiAcademies = useCallback(async () => {
    if (!usesApiProfile) return;
    try {
      setApiAcademies(await loadMyAffiliatedAcademies());
    } catch {
      setApiAcademies([]);
    }
  }, [usesApiProfile]);

  const recommendationContactIds = useMemo(
    () => recommendationContacts.map((person) => person.userId).filter(Boolean),
    [recommendationContacts],
  );

  const reloadReceivedRecommendations = useCallback(async () => {
    if (!usesApiProfile || !session.user?.id) return;
    try {
      setApiReceivedRecommendations(await loadReceivedRecommendationItems(session.user.id));
    } catch {
      setApiReceivedRecommendations([]);
    }
  }, [usesApiProfile, session.user?.id]);

  const reloadGivenRecommendations = useCallback(async () => {
    if (!usesApiProfile || !session.user?.id) return;
    try {
      setApiGivenRecommendations(
        await loadGivenRecommendationItems(session.user.id, recommendationContactIds),
      );
    } catch {
      setApiGivenRecommendations([]);
    }
  }, [usesApiProfile, session.user?.id, recommendationContactIds]);

  useEffect(() => {
    if (!usesApiProfile) return;
    patchRegisteredAccount({ skills: [], educationItems: [], projectItems: [] });
    setForm((prev) => ({ ...prev, skills: [], educationItems: [], projectItems: [] }));
    reloadApiSkills();
    reloadPrimaryCompany();
    reloadApiCertificates();
    reloadApiLanguages();
    reloadApiAcademies();
    reloadReceivedRecommendations();
    reloadGivenRecommendations();
  }, [
    usesApiProfile,
    reloadApiSkills,
    reloadPrimaryCompany,
    reloadApiCertificates,
    reloadApiLanguages,
    reloadApiAcademies,
    reloadReceivedRecommendations,
    reloadGivenRecommendations,
  ]);

  useEffect(() => {
    if (!usesApiProfile || !academyInputFocused) {
      setApiAcademySuggestions([]);
      return undefined;
    }
    let cancelled = false;
    const query = academyDraft.trim();
    searchAcademies(query)
      .then((items) => {
        if (cancelled) return;
        const used = new Set(apiAcademies.map((item) => String(item.academyId)));
        setApiAcademySuggestions(
          items.filter((item) => item?.id && !used.has(String(item.id))).slice(0, 8),
        );
      })
      .catch(() => {
        if (!cancelled) setApiAcademySuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [usesApiProfile, academyInputFocused, academyDraft, apiAcademies]);

  useEffect(() => {
    if (!usesApiProfile || !languageInputFocused) {
      setApiLanguageSuggestions([]);
      return undefined;
    }
    let cancelled = false;
    const query = languageDraft.trim();
    searchLanguages(query)
      .then((items) => {
        if (cancelled) return;
        const used = new Set(apiLanguages.map((item) => String(item.languageId)));
        setApiLanguageSuggestions(
          items.filter((item) => item?.id && !used.has(String(item.id))).slice(0, 8),
        );
      })
      .catch(() => {
        if (!cancelled) setApiLanguageSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [usesApiProfile, languageInputFocused, languageDraft, apiLanguages]);

  const reloadProfileViews = useCallback(async () => {
    if (!usesApiProfile) {
      setProfileViewRows([]);
      return;
    }
    try {
      const views = await fetchMyProfileViews();
      const viewerIds = views.map((item) => item.viewerUserId).filter(Boolean);
      const profiles = await fetchProfilesByUserIds(viewerIds);
      setProfileViewRows(mapProfileViewsToRows(views, profiles, t));
    } catch {
      setProfileViewRows([]);
    }
  }, [usesApiProfile, t]);

  useEffect(() => {
    reloadProfileViews();
  }, [reloadProfileViews]);

  useEffect(() => {
    if (!usesApiProfile || !skillInputFocused) {
      setApiSkillSuggestions([]);
      return undefined;
    }

    let cancelled = false;
    const query = skillDraft.trim();
    const position = form.position.trim() || form.specialty.trim();
    const usedSkillIds = new Set(apiSkills.map((item) => String(item.skillId)));

    async function loadSuggestions() {
      try {
        let items = [];
        if (query) {
          items = await searchSkills(query);
        } else if (position) {
          items = await loadRecommendedSkillSuggestions(position, {
            excludeSkillIds: [...usedSkillIds],
          });
        } else {
          items = await searchSkills("");
        }
        if (cancelled) return;
        setApiSkillSuggestions(
          items.filter((item) => item?.id && item?.name && !usedSkillIds.has(String(item.id))).slice(0, 8),
        );
      } catch {
        if (!cancelled) setApiSkillSuggestions([]);
      }
    }

    loadSuggestions();
    return () => {
      cancelled = true;
    };
  }, [usesApiProfile, skillInputFocused, skillDraft, apiSkills, form.position, form.specialty]);

  const fullName = `${form.firstName} ${form.lastName}`.trim() || "Profile";
  const avatarFallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName || "profile")}`;
  const avatarSrc = pendingAvatar || form.avatarDataUrl || avatarFallback;
  const displayedSkills = usesApiProfile ? apiSkills.map((item) => item.name) : form.skills;

  const completion = useMemo(() => {
    const values = [
      form.firstName,
      form.lastName,
      form.email,
      form.specialty,
      form.position,
      form.company,
      form.experienceFrom,
      form.experienceTo,
      form.city,
      form.country,
      form.phone,
      form.education,
      form.educationPeriod,
      form.about,
      displayedSkills.length ? "skills" : "",
    ];
    const filled = values.filter((item) => String(item || "").trim()).length;
    return Math.round((filled / values.length) * 100);
  }, [form, displayedSkills.length]);

  const metricViews = usesApiProfile ? profileViewRows.length : Math.max(12, completion + 48);
  const metricPostViews = Math.max(6, completion + 17);
  const recentProfileViews = profileViewRows.slice(0, 10);
  const displayedAcademies = usesApiProfile ? apiAcademies : form.academyItems;
  const displayedCertificates = usesApiProfile ? apiCertificates : form.certificateItems;
  const displayedLanguages = usesApiProfile
    ? apiLanguages.map((item) => ({ title: item.name, meta: item.level || item.meta || "—", userLanguageId: item.userLanguageId }))
    : form.languageItems;
  const displayedReceivedRecommendations = usesApiProfile
    ? apiReceivedRecommendations
    : form.recommendationItems;
  const displayedGivenRecommendations = usesApiProfile
    ? apiGivenRecommendations
    : form.recommendationGivenItems;

  const demoAcademySuggestions = useMemo(() => {
    if (usesApiProfile) return [];
    const used = new Set(form.academyItems.map((item) => item.title.toLowerCase()));
    const query = academyDraft.trim().toLowerCase();
    const pool = query
      ? HOT_ACADEMIES.filter((item) => item.toLowerCase().includes(query))
      : HOT_ACADEMIES;
    return pool.filter((item) => !used.has(item.toLowerCase())).slice(0, 8);
  }, [usesApiProfile, form.academyItems, academyDraft]);

  const demoLanguageSuggestions = useMemo(() => {
    if (usesApiProfile) return [];
    const used = new Set(form.languageItems.map((item) => item.title.toLowerCase()));
    const query = languageDraft.trim().toLowerCase();
    const pool = query
      ? HOT_LANGUAGES.filter((item) => item.toLowerCase().includes(query))
      : HOT_LANGUAGES;
    return pool.filter((item) => !used.has(item.toLowerCase())).slice(0, 8);
  }, [usesApiProfile, form.languageItems, languageDraft]);

  function patchForm(patch) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function formForLocalStorage(nextForm) {
    if (!usesApiProfile) {
      const {
        skills,
        educationItems,
        projectItems,
        resumeName,
        resumeDataUrl,
        ...rest
      } = nextForm;
      return rest;
    }
    const {
      skills,
      experienceItems,
      educationItems,
      projectItems,
      portfolioUrl,
      certificateItems,
      languageItems,
      academyItems,
      recommendationItems,
      recommendationGivenItems,
      company,
      resumeName,
      resumeDataUrl,
      ...rest
    } = nextForm;
    return rest;
  }

  function showApiRequiredHint() {
    setSaveHint(t("profile.apiRequired", "Sign in with a real account to sync this section."));
    window.setTimeout(() => setSaveHint(""), 2000);
  }

  function persistLocalOnly(nextForm, showHint = false) {
    const cleanVisibility =
      nextForm.visibility === "contacts" || nextForm.visibility === "private" ? nextForm.visibility : "public";
    writeJson(VISIBILITY_KEY, cleanVisibility);
    persistLocalProfileFields(nextForm, cleanVisibility);
    if (showHint) {
      setSaveHint(t("profile.hint.localSaved", "Saved on this device only."));
      window.setTimeout(() => setSaveHint(""), 1200);
    }
  }

  function patchLocalField(patch) {
    const next = { ...form, ...patch };
    setForm(next);
    if (usesApiProfile) persistLocalOnly(next);
  }

  async function persist(nextForm, showHint = true) {
    const cleanVisibility =
      nextForm.visibility === "contacts" || nextForm.visibility === "private" ? nextForm.visibility : "public";
    writeJson(VISIBILITY_KEY, cleanVisibility);
    patchRegisteredAccount({
      ...formForLocalStorage(nextForm),
      visibility: cleanVisibility,
    });

    if (usesApiProfile) {
      persistLocalProfileFields(nextForm, cleanVisibility);
      setIsSaving(true);
      try {
        const savedCompany = await savePrimaryCompanyFromForm(nextForm, apiPrimaryCompany);
        if (savedCompany) setApiPrimaryCompany(savedCompany);
        await saveProfileForm(nextForm);
        syncUserProfile({
          firstName: nextForm.firstName,
          lastName: nextForm.lastName,
          email: nextForm.email || session.user?.email,
          city: nextForm.city,
          country: nextForm.country,
          about: nextForm.about,
          specialty: nextForm.specialty,
          position: nextForm.position,
          avatarDataUrl: nextForm.avatarDataUrl || "",
        });
        if (showHint) {
          setSaveHint(t("profile.hint.saved", "Data saved."));
          window.setTimeout(() => setSaveHint(""), 1200);
        }
      } catch (error) {
        setSaveHint(error?.message || t("profile.hint.saveFailed", "Failed to save profile."));
      } finally {
        setIsSaving(false);
      }
      return;
    }

    syncUserProfile({
      firstName: nextForm.firstName,
      lastName: nextForm.lastName,
      email: nextForm.email,
      city: nextForm.city,
      country: nextForm.country,
      about: nextForm.about,
      specialty: nextForm.specialty,
      position: nextForm.position,
      company: nextForm.company,
      avatarDataUrl: nextForm.avatarDataUrl || "",
      headerDataUrl: nextForm.headerDataUrl || "",
    });
    if (showHint) {
      setSaveHint(t("profile.hint.saved", "Data saved."));
      window.setTimeout(() => setSaveHint(""), 1200);
    }
  }

  async function onHeaderUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSaveHint(t("profile.hint.needImage", "Please select an image."));
      return;
    }
    const maxBytes = usesApiProfile ? 5 * 1024 * 1024 : 1_200_000;
    if (file.size > maxBytes) {
      setSaveHint(
        usesApiProfile
          ? t("profile.hint.headerTooBigApi", "Cover image is too large (up to 5MB).")
          : t("profile.hint.headerTooBig", "Cover image is too large (up to 1.2MB)."),
      );
      return;
    }
    try {
      if (usesApiProfile) {
        setIsSaving(true);
        const dto = await uploadHeader(file);
        const resolved = resolveMediaUrl(dto?.headerUrl) || form.headerDataUrl;
        const next = { ...form, headerDataUrl: resolved };
        setForm(next);
        patchRegisteredAccount({ headerDataUrl: resolved });
        setSaveHint(t("profile.hint.headerSaved", "Cover photo updated."));
        window.setTimeout(() => setSaveHint(""), 1200);
        return;
      }

      const dataUrl = await toDataUrl(file);
      const next = { ...form, headerDataUrl: dataUrl };
      setForm(next);
      await persist(next);
    } catch (error) {
      setSaveHint(error?.message || t("profile.hint.headerFail", "Failed to upload cover photo."));
    } finally {
      setIsSaving(false);
    }
  }

  async function onAvatarUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSaveHint(t("profile.hint.needImage", "Please select an image."));
      return;
    }
    const maxBytes = usesApiProfile ? 5 * 1024 * 1024 : 1_200_000;
    if (file.size > maxBytes) {
      setSaveHint(
        usesApiProfile
          ? t("profile.hint.avatarTooBigApi", "Photo is too large (up to 5MB).")
          : t("profile.hint.avatarTooBig", "Photo is too large (up to 1.2MB)."),
      );
      return;
    }
    try {
      if (usesApiProfile) {
        setIsSaving(true);
        const dto = await uploadAvatar(file);
        const resolved = resolveMediaUrl(dto?.avatarUrl) || form.avatarDataUrl;
        const next = { ...form, avatarDataUrl: resolved };
        setPendingAvatar(resolved);
        setForm(next);
        setAvatarPickerOpen(false);
        patchRegisteredAccount({ avatarDataUrl: resolved });
        syncUserProfile({ avatarDataUrl: resolved });
        setSaveHint(t("profile.hint.saved", "Data saved."));
        window.setTimeout(() => setSaveHint(""), 1200);
        return;
      }

      const dataUrl = await toDataUrl(file);
      setPendingAvatar(dataUrl);
      const next = { ...form, avatarDataUrl: dataUrl };
      setForm(next);
      setAvatarPickerOpen(false);
      await persist(next);
    } catch (error) {
      setSaveHint(error?.message || t("profile.hint.avatarFail", "Failed to upload photo."));
    } finally {
      setIsSaving(false);
    }
  }

  async function onResumeUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 1_800_000) {
      setSaveHint(t("profile.hint.resumeTooBig", "Resume is too large (up to 1.8MB)."));
      return;
    }
    try {
      const dataUrl = await toDataUrl(file);
      const next = { ...form, resumeName: file.name || "resume", resumeDataUrl: dataUrl };
      setForm(next);
      persistLocalOnly(next, true);
    } catch {
      setSaveHint(t("profile.hint.resumeFail", "Failed to upload resume."));
    }
  }

  async function addSkill(nextValue = skillDraft, skillId) {
    const value = String(nextValue || "").trim();
    if (!value && !skillId) return;

    if (usesApiProfile) {
      if (skillId && apiSkills.some((item) => String(item.skillId) === String(skillId))) return;
      if (!skillId && apiSkills.some((item) => item.name.toLowerCase() === value.toLowerCase())) return;
      setIsSaving(true);
      try {
        let resolvedSkillId = skillId;
        if (!resolvedSkillId) {
          const matches = await searchSkills(value);
          const exact = matches.find((item) => item.name?.toLowerCase() === value.toLowerCase());
          const skill = exact || matches[0];
          if (!skill?.id) {
            setSaveHint(
              t("profile.skills.notInCatalog", "Skill not found in catalog. Try another name."),
            );
            return;
          }
          resolvedSkillId = skill.id;
        }
        await createMyUserSkill(resolvedSkillId);
        await reloadApiSkills();
        setSkillDraft("");
        setSaveHint(t("profile.skills.added", "Skill added."));
        window.setTimeout(() => setSaveHint(""), 1200);
      } catch (error) {
        setSaveHint(error?.message || t("profile.skills.addFailed", "Failed to add skill."));
      } finally {
        setIsSaving(false);
      }
      return;
    }

    showApiRequiredHint();
  }

  async function removeSkill(index) {
    if (usesApiProfile) {
      const target = apiSkills[index];
      if (!target?.userSkillId) return;
      setIsSaving(true);
      try {
        await deleteMyUserSkill(target.userSkillId);
        await reloadApiSkills();
        setSaveHint(t("profile.skills.removed", "Skill removed."));
        window.setTimeout(() => setSaveHint(""), 1200);
      } catch (error) {
        setSaveHint(error?.message || t("profile.skills.removeFailed", "Failed to remove skill."));
      } finally {
        setIsSaving(false);
      }
      return;
    }

    showApiRequiredHint();
  }

  async function addAcademy(nextValue = academyDraft, academyId, academyName) {
    const value = String(nextValue || academyName || "").trim();
    if (!value && !academyId) return;

    if (usesApiProfile) {
      if (academyId && apiAcademies.some((item) => String(item.academyId) === String(academyId))) return;
      setIsSaving(true);
      try {
        let academy = null;
        if (academyId) {
          const matches = await searchAcademies(value);
          academy = matches.find((item) => String(item.id) === String(academyId)) || { id: academyId, name: value };
        } else {
          const matches = await searchAcademies(value);
          const exact = matches.find((item) => item.name?.toLowerCase() === value.toLowerCase());
          academy = exact || matches[0];
        }
        if (!academy?.id) {
          setSaveHint(t("profile.academies.notInCatalog", "Academy not found in catalog. Try another name."));
          return;
        }
        await linkAcademyAffiliation(academy);
        await Promise.all([reloadApiAcademies(), reloadEducationItems()]);
        setAcademyDraft("");
        setSaveHint(t("profile.academies.added", "Academy added."));
        window.setTimeout(() => setSaveHint(""), 1200);
      } catch (error) {
        setSaveHint(error?.message || t("profile.academies.addFailed", "Could not add academy."));
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (form.academyItems.some((item) => item.title.toLowerCase() === value.toLowerCase())) return;
    const next = {
      ...form,
      academyItems: [{ title: value, meta: t("profile.academies.affiliation", "Affiliation") }, ...form.academyItems],
    };
    setForm(next);
    setAcademyDraft("");
    persist(next);
  }

  async function removeAcademy(index) {
    if (usesApiProfile) {
      const item = apiAcademies[index];
      if (!item?.academyId) return;
      setIsSaving(true);
      try {
        await unlinkAcademyAffiliation(item.academyId);
        await Promise.all([reloadApiAcademies(), reloadEducationItems()]);
        setSaveHint(t("profile.academies.removed", "Academy removed."));
        window.setTimeout(() => setSaveHint(""), 1200);
      } catch (error) {
        setSaveHint(error?.message || t("profile.academies.removeFailed", "Could not remove academy."));
      } finally {
        setIsSaving(false);
      }
      return;
    }
    const next = { ...form, academyItems: form.academyItems.filter((_, idx) => idx !== index) };
    setForm(next);
    persist(next);
  }

  async function addCertificate() {
    const name = certForm.name.trim();
    if (!name) {
      setSaveHint(t("profile.certificates.nameRequired", "Enter a certificate name."));
      return;
    }
    if (usesApiProfile) {
      setIsSaving(true);
      try {
        await createMyCertificate(buildCreateCertificateBody(certForm));
        await reloadApiCertificates();
        setCertForm({ name: "", issueDate: "", expiryDate: "" });
        setSaveHint(t("profile.certificates.added", "Certificate added."));
        window.setTimeout(() => setSaveHint(""), 1200);
      } catch (error) {
        setSaveHint(error?.message || t("profile.certificates.addFailed", "Could not add certificate."));
      } finally {
        setIsSaving(false);
      }
      return;
    }
    const issue = certForm.issueDate.trim();
    const expiry = certForm.expiryDate.trim();
    const meta = [issue, expiry].filter(Boolean).join(" - ") || t("profile.notSpecified", "Not specified");
    const next = {
      ...form,
      certificateItems: [{ title: name, meta }, ...form.certificateItems],
    };
    setForm(next);
    setCertForm({ name: "", issueDate: "", expiryDate: "" });
    persist(next);
  }

  async function removeCertificate(index) {
    if (usesApiProfile) {
      const item = apiCertificates[index];
      if (!item?.certificateId) return;
      setIsSaving(true);
      try {
        await deleteMyCertificate(item.certificateId);
        await reloadApiCertificates();
        setSaveHint(t("profile.certificates.removed", "Certificate removed."));
        window.setTimeout(() => setSaveHint(""), 1200);
      } catch (error) {
        setSaveHint(error?.message || t("profile.certificates.removeFailed", "Could not remove certificate."));
      } finally {
        setIsSaving(false);
      }
      return;
    }
    const next = { ...form, certificateItems: form.certificateItems.filter((_, idx) => idx !== index) };
    setForm(next);
    persist(next);
  }

  async function addLanguage(nextValue = languageDraft, languageId) {
    const value = String(nextValue || "").trim();
    if (!value && !languageId) return;

    if (usesApiProfile) {
      if (languageId && apiLanguages.some((item) => String(item.languageId) === String(languageId))) return;
      if (!languageId && apiLanguages.some((item) => item.name.toLowerCase() === value.toLowerCase())) return;
      setIsSaving(true);
      try {
        let resolvedLanguageId = languageId;
        if (!resolvedLanguageId) {
          const matches = await searchLanguages(value);
          const exact = matches.find((item) => item.name?.toLowerCase() === value.toLowerCase());
          const language = exact || matches[0];
          if (!language?.id) {
            setSaveHint(t("profile.languages.notInCatalog", "Language not found in catalog. Try another name."));
            return;
          }
          resolvedLanguageId = language.id;
        }
        await createMyUserLanguage(resolvedLanguageId, languageLevelDraft);
        await reloadApiLanguages();
        setLanguageDraft("");
        setSaveHint(t("profile.languages.added", "Language added."));
        window.setTimeout(() => setSaveHint(""), 1200);
      } catch (error) {
        setSaveHint(error?.message || t("profile.languages.addFailed", "Could not add language."));
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (form.languageItems.some((item) => item.title.toLowerCase() === value.toLowerCase())) return;
    const next = {
      ...form,
      languageItems: [
        { title: value, meta: languageLevelDraft || t("profile.notSpecified", "Not specified") },
        ...form.languageItems,
      ],
    };
    setForm(next);
    setLanguageDraft("");
    persist(next);
  }

  async function removeLanguage(index) {
    if (usesApiProfile) {
      const target = apiLanguages[index];
      if (!target?.userLanguageId) return;
      setIsSaving(true);
      try {
        await deleteMyUserLanguage(target.userLanguageId);
        await reloadApiLanguages();
        setSaveHint(t("profile.languages.removed", "Language removed."));
        window.setTimeout(() => setSaveHint(""), 1200);
      } catch (error) {
        setSaveHint(error?.message || t("profile.languages.removeFailed", "Could not remove language."));
      } finally {
        setIsSaving(false);
      }
      return;
    }
    const next = { ...form, languageItems: form.languageItems.filter((_, idx) => idx !== index) };
    setForm(next);
    persist(next);
  }

  function resetRecommendationForm() {
    setRecommendationRecipientId("");
    setRecommendationText("");
    setEditingRecommendationId("");
  }

  async function submitRecommendation() {
    const text = recommendationText.trim();
    if (!text) {
      setSaveHint(t("profile.recommendations.textRequired", "Enter recommendation text."));
      return;
    }

    if (usesApiProfile) {
      setIsSaving(true);
      try {
        if (editingRecommendationId) {
          await patchRecommendation(
            editingRecommendationId,
            buildPatchRecommendationBody({ text }),
          );
          setSaveHint(t("profile.recommendations.updated", "Recommendation updated."));
        } else {
          if (!recommendationRecipientId) {
            setSaveHint(t("profile.recommendations.recipientRequired", "Select a contact."));
            return;
          }
          await createRecommendation(
            buildCreateRecommendationBody({
              userId: recommendationRecipientId,
              text,
            }),
          );
          setSaveHint(t("profile.recommendations.sent", "Recommendation sent."));
        }
        resetRecommendationForm();
        await reloadGivenRecommendations();
        window.setTimeout(() => setSaveHint(""), 1200);
      } catch (error) {
        setSaveHint(error?.message || t("profile.recommendations.saveFailed", "Could not save recommendation."));
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (!recommendationRecipientId) {
      setSaveHint(t("profile.recommendations.recipientRequired", "Select a contact."));
      return;
    }
    const contact = recommendationContacts.find(
      (person) => String(person.userId) === String(recommendationRecipientId),
    );
    const recipientName = contact?.name || `User ${String(recommendationRecipientId).slice(0, 8)}`;
    const next = {
      ...form,
      recommendationGivenItems: [
        {
          title: recipientName,
          meta: text,
          userId: recommendationRecipientId,
        },
        ...form.recommendationGivenItems,
      ],
    };
    setForm(next);
    resetRecommendationForm();
    persist(next);
    setSaveHint(t("profile.recommendations.sent", "Recommendation sent."));
    window.setTimeout(() => setSaveHint(""), 1200);
  }

  function startEditRecommendation(index) {
    const item = displayedGivenRecommendations[index];
    if (!item) return;
    setEditingRecommendationId(item.recommendationId || "");
    setRecommendationRecipientId(item.userId || "");
    setRecommendationText(item.meta || "");
  }

  async function removeGivenRecommendation(index) {
    if (usesApiProfile) {
      const item = apiGivenRecommendations[index];
      if (!item?.recommendationId) return;
      setIsSaving(true);
      try {
        await deleteRecommendation(item.recommendationId);
        if (editingRecommendationId === item.recommendationId) {
          resetRecommendationForm();
        }
        await reloadGivenRecommendations();
        setSaveHint(t("profile.recommendations.removed", "Recommendation removed."));
        window.setTimeout(() => setSaveHint(""), 1200);
      } catch (error) {
        setSaveHint(error?.message || t("profile.recommendations.removeFailed", "Could not remove recommendation."));
      } finally {
        setIsSaving(false);
      }
      return;
    }
    const next = {
      ...form,
      recommendationGivenItems: form.recommendationGivenItems.filter((_, idx) => idx !== index),
    };
    setForm(next);
    persist(next);
  }

  async function clearAllSkills() {
    if (usesApiProfile) {
      if (!apiSkills.length) return;
      setIsSaving(true);
      try {
        await Promise.all(apiSkills.map((item) => deleteMyUserSkill(item.userSkillId)));
        await reloadApiSkills();
      } catch (error) {
        setSaveHint(error?.message || t("profile.skills.removeFailed", "Failed to remove skill."));
      } finally {
        setIsSaving(false);
      }
      return;
    }

    showApiRequiredHint();
  }

  async function reloadExperienceItems() {
    const items = await loadMyExperienceHistoryItems();
    setForm((prev) => ({ ...prev, experienceItems: items }));
    return items;
  }

  function cancelEditExperience() {
    setEditingExperienceId(null);
  }

  function startEditExperience(index) {
    const item = form.experienceItems[index];
    if (!item?.experienceId) return;
    setEditingExperienceId(String(item.experienceId));
    setForm((prev) => ({
      ...prev,
      position: item.position || prev.position,
      company: item.companyName || prev.company,
      experienceFrom: item.experienceFrom || "",
      experienceTo: item.experienceTo || "",
    }));
    setSaveHint(t("profile.experience.editing", "Editing experience — update fields and press + to save."));
    window.setTimeout(() => setSaveHint(""), 2800);
  }

  async function addExperienceViaApi() {
    const position = form.position.trim() || form.specialty.trim();
    if (!position) {
      setSaveHint(t("profile.experience.positionRequired", "Enter a position or specialty first."));
      return;
    }
    setIsSaving(true);
    try {
      let companyId;
      const companyName = form.company.trim();
      if (companyName) {
        companyId = await resolveCompanyIdByName(companyName, {
          location: [form.city, form.country].filter(Boolean).join(", "),
        });
      }
      const body = buildCreateExperienceBodyFromProfileForm(form, companyId);
      if (editingExperienceId) {
        await updateMyExperience(editingExperienceId, body);
        setEditingExperienceId(null);
        await reloadExperienceItems();
        setSaveHint(t("profile.experience.updated", "Experience updated."));
      } else {
        await createMyExperience(body);
        await reloadExperienceItems();
        setSaveHint(t("profile.experience.added", "Experience added."));
      }
      window.setTimeout(() => setSaveHint(""), 1200);
    } catch (error) {
      const fallback = editingExperienceId
        ? t("profile.experience.updateFailed", "Could not update experience.")
        : t("profile.experience.addFailed", "Could not add experience.");
      setSaveHint(error?.message || fallback);
    } finally {
      setIsSaving(false);
    }
  }

  async function removeExperienceViaApi(index) {
    const item = form.experienceItems[index];
    if (!item?.experienceId) {
      setForm((prev) => ({
        ...prev,
        experienceItems: prev.experienceItems.filter((_, idx) => idx !== index),
      }));
      return;
    }
    setIsSaving(true);
    try {
      await deleteMyExperience(item.experienceId);
      await reloadExperienceItems();
      setSaveHint(t("profile.experience.removed", "Experience removed."));
      window.setTimeout(() => setSaveHint(""), 1200);
    } catch (error) {
      setSaveHint(error?.message || t("profile.experience.removeFailed", "Could not remove experience."));
    } finally {
      setIsSaving(false);
    }
  }

  async function reloadEducationItems() {
    const items = await loadMyEducationHistoryItems();
    setForm((prev) => ({ ...prev, educationItems: items }));
    return items;
  }

  async function addEducationViaApi() {
    const institution = form.education.trim();
    if (!institution) {
      setSaveHint(t("profile.education.institutionRequired", "Enter an institution first."));
      return;
    }
    setIsSaving(true);
    try {
      await createMyEducation(buildCreateEducationBodyFromProfileForm(form));
      await reloadEducationItems();
      setSaveHint(t("profile.education.added", "Education added."));
      window.setTimeout(() => setSaveHint(""), 1200);
    } catch (error) {
      setSaveHint(error?.message || t("profile.education.addFailed", "Could not add education."));
    } finally {
      setIsSaving(false);
    }
  }

  async function removeEducationViaApi(index) {
    const item = form.educationItems[index];
    if (!item?.educationId) {
      setForm((prev) => ({
        ...prev,
        educationItems: prev.educationItems.filter((_, idx) => idx !== index),
      }));
      return;
    }
    setIsSaving(true);
    try {
      await deleteMyEducation(item.educationId);
      await reloadEducationItems();
      setSaveHint(t("profile.education.removed", "Education removed."));
      window.setTimeout(() => setSaveHint(""), 1200);
    } catch (error) {
      setSaveHint(error?.message || t("profile.education.removeFailed", "Could not remove education."));
    } finally {
      setIsSaving(false);
    }
  }

  async function clearAllExperience() {
    if (usesApiProfile) {
      const ids = form.experienceItems.map((item) => item.experienceId).filter(Boolean);
      if (!ids.length) {
        setForm((prev) => ({ ...prev, experienceItems: [] }));
        return;
      }
      setIsSaving(true);
      try {
        await Promise.all(ids.map((id) => deleteMyExperience(id)));
        setForm((prev) => ({ ...prev, experienceItems: [] }));
        setSaveHint(t("profile.experience.cleared", "Experience cleared."));
        window.setTimeout(() => setSaveHint(""), 1200);
      } catch (error) {
        setSaveHint(error?.message || t("profile.experience.removeFailed", "Could not remove experience."));
      } finally {
        setIsSaving(false);
      }
      return;
    }

    const next = { ...form, experienceItems: [] };
    setForm(next);
    persist(next);
  }

  async function addHistory(type) {
    if (type === "experience") {
      if (usesApiProfile) {
        await addExperienceViaApi();
        return;
      }
      const role = form.position.trim() || form.specialty.trim();
      if (!role) return;
      const period = [form.experienceFrom.trim(), form.experienceTo.trim()].filter(Boolean).join(" - ");
      const location = [form.city.trim(), form.country.trim()].filter(Boolean).join(", ");
      const item = {
        title: form.company.trim() ? `${role} - ${form.company.trim()}` : role,
        meta: `${period || t("profile.notSpecified", "Not specified")} - ${location || t("profile.notSpecifiedF", "Not specified")}`,
      };
      const next = { ...form, experienceItems: [item, ...form.experienceItems] };
      setForm(next);
      persist(next);
      return;
    }
    if (type === "education") {
      if (usesApiProfile) {
        await addEducationViaApi();
        return;
      }
      showApiRequiredHint();
      return;
    }
    showApiRequiredHint();
  }

  async function removeHistory(type, index) {
    if (type === "experience" && usesApiProfile) {
      await removeExperienceViaApi(index);
      return;
    }
    if (type === "education" && usesApiProfile) {
      await removeEducationViaApi(index);
      return;
    }
    if (type === "education" || type === "project") {
      showApiRequiredHint();
      return;
    }
    const key = "experienceItems";
    const next = { ...form, [key]: form[key].filter((_, idx) => idx !== index) };
    setForm(next);
    persist(next);
  }

  async function savePortfolioUrl() {
    if (!usesApiProfile) {
      showApiRequiredHint();
      return;
    }
    const url = String(form.portfolioUrl || "").trim();
    setIsSaving(true);
    try {
      await saveProfileForm({ ...form, portfolioUrl: url });
      setSaveHint(t("profile.portfolio.saved", "Portfolio link saved."));
      window.setTimeout(() => setSaveHint(""), 1200);
    } catch (error) {
      setSaveHint(error?.message || t("profile.portfolio.saveFailed", "Could not save portfolio link."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="page profile-page-legacy lk-page">
      <div className="lk-wrap">
        {usesApiProfile ? (
          <LoadStatus
            isLoading={isLoading}
            loadError={loadError}
            onRetry={reloadFromApi}
            t={t}
            className="lk-load-status"
          />
        ) : null}
        <section className={isLoading && usesApiProfile ? "lk-card lk-card--loading" : "lk-card"}>
          <div
            className={form.headerDataUrl ? "lk-cover lk-cover--has-image" : "lk-cover"}
            style={form.headerDataUrl ? { backgroundImage: `url("${form.headerDataUrl}")` } : undefined}
          >
            <div className="lk-cover__actions">
              <label
                htmlFor="headerInput"
                className={isSaving || isLoading ? "lk-cover__btn lk-cover__btn--disabled" : "lk-cover__btn"}
                aria-disabled={isSaving || isLoading}
              >
                {form.headerDataUrl
                  ? t("profile.header.change", "Change cover")
                  : t("profile.header.add", "Add cover photo")}
              </label>
              <input id="headerInput" type="file" accept="image/*" hidden onChange={onHeaderUpload} />
            </div>
          </div>
          <div className="lk-head">
            <div className="lk-head__row">
              <div className="lk-avatar-wrap">
                <img className="lk-avatar" src={avatarSrc} alt="" />
                <div className="lk-avatar-actions">
                  <button type="button" className="lk-avatar-edit" onClick={() => setAvatarPickerOpen((prev) => !prev)}>
                    {form.avatarDataUrl ? t("profile.avatar.change", "Change avatar") : t("profile.avatar.add", "Add avatar")}
                  </button>
                  {form.avatarDataUrl ? (
                    <button
                      type="button"
                      className="lk-avatar-edit lk-avatar-delete"
                      onClick={() => {
                        const next = { ...form, avatarDataUrl: "" };
                        setPendingAvatar("");
                        setForm(next);
                        persist(next);
                      }}
                    >
                      {t("profile.avatar.removePhoto", "Remove photo")}
                    </button>
                  ) : null}
                </div>
                <input id="avatarInput" type="file" accept="image/*" hidden onChange={onAvatarUpload} />
                {avatarPickerOpen ? (
                  <div className="lk-icon-picker lk-icon-picker--header">
                  <div className="lk-icon-picker-actions">
                    <p className="lk-muted">{t("profile.avatar.pickIcon", "Choose an animal icon")}</p>
                    <label htmlFor="avatarInput" className="lk-file-btn">
                      {t("profile.avatar.uploadPhoto", "Upload photo")}
                    </label>
                    <button
                      type="button"
                      className="lk-icon-save-btn"
                      onClick={() => {
                        const next = { ...form, avatarDataUrl: pendingAvatar || "" };
                        setForm(next);
                        setAvatarPickerOpen(false);
                        persist(next);
                      }}
                    >
                      {t("profile.avatar.saveIcon", "Save icon")}
                    </button>
                  </div>
                  <div className="lk-icon-grid">
                    {avatarIcons.map((icon) => (
                      <button
                        key={icon.id}
                        type="button"
                        className={
                          (pendingAvatar || form.avatarDataUrl) === icon.url
                            ? "lk-icon-option lk-icon-option--active"
                            : "lk-icon-option"
                        }
                        onClick={() => setPendingAvatar(icon.url)}
                      >
                        <img src={icon.url} alt={icon.label} />
                      </button>
                    ))}
                  </div>
                </div>
                ) : null}
              </div>
              <div className="lk-head__info">
                <h1 className="lk-name">{fullName}</h1>
                {form.specialty ? <p className="lk-headline">{form.specialty}</p> : null}
                <p className="lk-sub">{t("profile.sub", "Fill in your details for your profile.")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="lk-main">
          <article className="lk-card">
            <form
              className="lk-form"
              onSubmit={async (event) => {
                event.preventDefault();
                await persist(form);
              }}
            >
              <h2 className="lk-title">{t("profile.title", "Profile")}</h2>
              <fieldset className="lk-form__fields" disabled={isLoading || isSaving}>
              <label>
                {t("auth.field.firstName", "First name")}
                <input value={form.firstName} onChange={(e) => patchForm({ firstName: e.target.value })} required />
              </label>
              <label>
                {t("auth.field.lastName", "Last name")}
                <input value={form.lastName} onChange={(e) => patchForm({ lastName: e.target.value })} required />
              </label>
              <label>
                {t("auth.field.email", "Email")}
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => patchForm({ email: e.target.value })}
                  readOnly={usesApiProfile}
                  required
                />
              </label>
              <label>
                {t("profile.field.specialty", "Specialty")}
                <input value={form.specialty} onChange={(e) => patchForm({ specialty: e.target.value })} />
              </label>
              <div className="lk-inline">
                <label>
                  {t("profile.field.position", "Current position")}
                  <input value={form.position} onChange={(e) => patchForm({ position: e.target.value })} />
                </label>
                <label>
                  {t("profile.field.company", "Company")}
                  {usesApiProfile ? (
                    <span className="lk-muted lk-skills-api-hint">
                      {t("profile.company.apiHint", "Synced with Professional API companies.")}
                    </span>
                  ) : null}
                  <input
                    value={form.company}
                    onChange={(e) => patchForm({ company: e.target.value })}
                  />
                </label>
              </div>
              <div className="lk-inline">
                <label>
                  {t("profile.field.expFrom", "Experience start")}
                  <input value={form.experienceFrom} onChange={(e) => patchForm({ experienceFrom: e.target.value })} />
                </label>
                <label>
                  {t("profile.field.expTo", "Experience end")}
                  <input value={form.experienceTo} onChange={(e) => patchForm({ experienceTo: e.target.value })} />
                </label>
              </div>
              <div className="lk-inline">
                <label>
                  {t("profile.field.city", "City")}
                  <input value={form.city} onChange={(e) => patchForm({ city: e.target.value })} />
                </label>
                <label>
                  {t("profile.field.country", "Country")}
                  <input value={form.country} onChange={(e) => patchForm({ country: e.target.value })} />
                </label>
              </div>
              <label>
                {t("chat.profile.phone", "Phone")}
                {usesApiProfile ? <LocalOnlyBadge t={t} /> : null}
                <input
                  value={form.phone}
                  onChange={(e) =>
                    usesApiProfile ? patchLocalField({ phone: e.target.value }) : patchForm({ phone: e.target.value })
                  }
                />
              </label>
              <div className="lk-inline">
                <label>
                  {t("profile.field.education", "Education")}
                  <input value={form.education} onChange={(e) => patchForm({ education: e.target.value })} />
                </label>
                <label>
                  {t("profile.field.educationPeriod", "Education period")}
                  <input value={form.educationPeriod} onChange={(e) => patchForm({ educationPeriod: e.target.value })} />
                </label>
              </div>
              <label>
                {t("profile.field.about", "About")}
                <textarea value={form.about} onChange={(e) => patchForm({ about: e.target.value })} />
              </label>
              <label>
                {t("profile.field.resume", "Resume")}
                {usesApiProfile ? <LocalOnlyBadge t={t} /> : null}
                <div className="lk-file-row">
                  <label htmlFor="resumeInput" className="lk-file-btn">
                    {t("profile.resume.upload", "Upload file")}
                  </label>
                  <button
                    type="button"
                    className="lk-file-btn"
                    onClick={() => {
                      const next = { ...form, resumeName: "", resumeDataUrl: "" };
                      setForm(next);
                      if (usesApiProfile) persistLocalOnly(next, true);
                      else persist(next);
                    }}
                  >
                    {t("profile.clear", "Clear")}
                  </button>
                  <input id="resumeInput" type="file" hidden onChange={onResumeUpload} />
                </div>
                <p className="lk-muted">{form.resumeName || t("profile.resume.notUploaded", "File not uploaded")}</p>
                {form.resumeDataUrl && form.resumeName && (
                  <a className="lk-line" href={form.resumeDataUrl} download={form.resumeName}>
                    {t("profile.resume.download", "Download uploaded resume")}
                  </a>
                )}
              </label>
              <label>
                {t("profile.skills", "Skills")}
                {usesApiProfile ? (
                  <span className="lk-muted lk-skills-api-hint">
                    {t("profile.skills.apiHint", "Synced with Professional API (catalog skills).")}
                  </span>
                ) : (
                  <span className="lk-muted lk-skills-api-hint">{t("profile.apiRequired", "Sign in with a real account to sync this section.")}</span>
                )}
                <div className="skills-editor">
                  <div className="skills-row">
                    <input
                      value={skillDraft}
                      placeholder={t("profile.skills.placeholder", "For example: React")}
                      onChange={(e) => setSkillDraft(e.target.value)}
                      onFocus={() => setSkillInputFocused(true)}
                      onBlur={() => {
                        window.setTimeout(() => setSkillInputFocused(false), 140);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addSkill();
                        }
                      }}
                      disabled={!usesApiProfile}
                    />
                    <button type="button" className="skills-add-btn" onClick={addSkill} disabled={!usesApiProfile}>
                      {t("profile.add", "Add")}
                    </button>
                  </div>
                  {usesApiProfile && skillInputFocused && apiSkillSuggestions.length > 0 ? (
                    <div className="skills-hot-list" role="listbox" aria-label={t("profile.skills.hotList", "Suggested skills")}>
                      {apiSkillSuggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="skills-hot-list__item"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => addSkill(item.name, item.id)}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div className="skills-chips">
                    {displayedSkills.map((skill, index) => (
                      <span
                        className="skill-chip"
                        key={usesApiProfile ? apiSkills[index]?.userSkillId || `${skill}-${index}` : `${skill}-${index}`}
                      >
                        {skill}
                        {usesApiProfile ? (
                          <button type="button" onClick={() => removeSkill(index)}>
                            x
                          </button>
                        ) : null}
                      </span>
                    ))}
                  </div>
                  {!displayedSkills.length && (
                    <p className="skills-empty">{t("profile.skills.empty", "No skills yet.")}</p>
                  )}
                </div>
              </label>
              </fieldset>
              <button className="lk-cta" type="submit" disabled={isSaving || isLoading}>
                {isSaving
                  ? t("profile.saving", "Saving...")
                  : t("profile.cta", "Add your details to strengthen your profile")}
              </button>
              <p className="lk-save-hint">{saveHint}</p>
            </form>
          </article>

          <aside className="lk-card lk-side">
            <h3 className="lk-title">{t("profile.progress", "Profile progress")}</h3>
            <p className="lk-muted">{tmpl("profile.progressPercent", { n: completion }, `${completion}% completed`)}</p>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${completion}%` }} />
            </div>
            <p className="lk-muted">{t("profile.progressHint", "The more details you add, the better your profile looks.")}</p>
            <section className="lk-settings" aria-label="Profile settings">
              <h4>{t("profile.settingsMini", "Mini account settings")}</h4>
              <label>
                {t("profile.lang", "Interface language")}
                <select value={lang} onChange={(e) => setLang(e.target.value)}>
                  <option value="en">{t("lang.en", "English")}</option>
                  <option value="uk">{t("lang.uk", "Ukrainian")}</option>
                  <option value="es">{t("lang.es", "Spanish")}</option>
                  <option value="de">{t("lang.de", "German")}</option>
                </select>
              </label>
              <label>
                {t("profile.theme", "Theme")}
                <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                  <option value="light">{t("profile.theme.light", "Light")}</option>
                  <option value="dark">{t("profile.theme.dark", "Dark")}</option>
                </select>
              </label>
              <label>
                {t("profile.visibility", "Profile visibility")}
                <select
                  value={form.visibility}
                  onChange={(e) => {
                    const next = { ...form, visibility: e.target.value };
                    setForm(next);
                    persist(next);
                  }}
                >
                  <option value="public">{t("profile.visibility.public", "Public")}</option>
                  <option value="contacts">{t("profile.visibility.contacts", "Contacts only")}</option>
                  <option value="private">{t("profile.visibility.private", "Only me")}</option>
                </select>
              </label>
            </section>
          </aside>
        </section>

        <section className="lk-rows">
          <article className="lk-card lk-row-card">
            <div className="lk-row-head">
              <h3 className="lk-row-title">{t("profile.section.analytics", "Analytics")}</h3>
            </div>
            <div className="metrics">
              <div className="metric">
                <strong>{metricViews}</strong>
                <span>{t("profile.analytics.views", "Profile views")}</span>
              </div>
              <div className="metric">
                <strong>{metricPostViews}</strong>
                <span>{t("profile.analytics.postViews", "Post views")}</span>
              </div>
              <div className="metric">
                <strong>{completion}%</strong>
                <span>{t("profile.analytics.completion", "Profile completion")}</span>
              </div>
            </div>
            {usesApiProfile ? (
              <div className="lk-views">
                <h4 className="lk-views__title">{t("profile.views.recent", "Recent viewers")}</h4>
                {recentProfileViews.length > 0 ? (
                  <ul className="lk-views__list">
                    {recentProfileViews.map((row) => (
                      <li key={row.id} className="lk-views__item">
                        {row.viewerUserId && String(row.viewerUserId) !== String(session.user?.id) ? (
                          <Link className="lk-views__name" to={`/profile/${row.viewerUserId}`}>
                            {row.viewerName}
                          </Link>
                        ) : (
                          <span className="lk-views__name">{row.viewerName}</span>
                        )}
                        <span className="lk-views__meta">
                          {formatProfileViewDate(row.viewedAt, lang)}
                          {row.source ? ` · ${row.source}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="lk-muted lk-views__empty">
                    {t("profile.views.empty", "No profile views recorded yet.")}
                  </p>
                )}
              </div>
            ) : null}
          </article>

          <article className="lk-card lk-row-card">
            <div className="lk-row-head">
              <h3 className="lk-row-title">{t("profile.section.experience", "Experience")}</h3>
              <div className="lk-row-actions">
                {editingExperienceId ? (
                  <button type="button" className="lk-icon-btn" onClick={cancelEditExperience} title={t("profile.experience.cancelEdit", "Cancel edit")}>
                    ↩
                  </button>
                ) : null}
                <button
                  type="button"
                  className="lk-icon-btn"
                  onClick={() => addHistory("experience")}
                  title={editingExperienceId ? t("profile.experience.saveEdit", "Save changes") : t("profile.experience.add", "Add experience")}
                >
                  {editingExperienceId ? "✓" : "+"}
                </button>
                <button type="button" className="lk-icon-btn" onClick={() => clearAllExperience()}>
                  x
                </button>
              </div>
            </div>
            {editingExperienceId ? (
              <p className="lk-muted lk-skills-api-hint">{t("profile.experience.editingHint", "Editing an experience entry.")}</p>
            ) : null}
            <p className="lk-line">
              {t("profile.field.specialty", "Specialty")}: <strong>{form.specialty || t("profile.notSpecifiedF", "Not specified")}</strong>
            </p>
            <p className="lk-line">
              {t("profile.field.positionShort", "Position")}: <strong>{form.position || t("profile.notSpecifiedF", "Not specified")}</strong>
            </p>
            <p className="lk-line">
              {t("profile.field.company", "Company")}: <strong>{form.company || t("profile.notSpecifiedF", "Not specified")}</strong>
            </p>
            <p className="lk-line">
              {t("profile.field.period", "Period")}:{" "}
              <strong>{[form.experienceFrom, form.experienceTo].filter(Boolean).join(" - ") || t("profile.notSpecified", "Not specified")}</strong>
            </p>
            <div className="lk-history">
              {form.experienceItems.map((item, index) => (
                <div className="lk-history__item" key={item.experienceId || `${item.title}-${index}`}>
                  <div>
                    <p className="lk-history__title">{item.title}</p>
                    <p className="lk-history__meta">{item.meta}</p>
                  </div>
                  <div className="lk-history__actions">
                    {usesApiProfile && item.experienceId ? (
                      <button
                        type="button"
                        className="lk-icon-btn"
                        onClick={() => startEditExperience(index)}
                        title={t("profile.experience.edit", "Edit")}
                      >
                        ✎
                      </button>
                    ) : null}
                    <button type="button" className="lk-icon-btn" onClick={() => removeHistory("experience", index)}>
                      x
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="lk-card lk-row-card">
            <div className="lk-row-head">
              <h3 className="lk-row-title">{t("profile.section.education", "Education")}</h3>
              <div className="lk-row-actions">
                <button
                  type="button"
                  className="lk-icon-btn"
                  onClick={() => addHistory("education")}
                  disabled={!usesApiProfile}
                >
                  +
                </button>
              </div>
            </div>
            {!usesApiProfile ? (
              <p className="lk-muted lk-skills-api-hint">{t("profile.apiRequired", "Sign in with a real account to sync this section.")}</p>
            ) : null}
            <p className="lk-line">
              {t("profile.field.education", "Education")}: <strong>{form.education || t("profile.notSpecifiedN", "Not specified")}</strong>
            </p>
            <p className="lk-line">
              {t("profile.field.period", "Period")}: <strong>{form.educationPeriod || t("profile.notSpecified", "Not specified")}</strong>
            </p>
            <div className="lk-history">
              {form.educationItems.map((item, index) => (
                <div className="lk-history__item" key={item.educationId || `${item.title}-${index}`}>
                  <div>
                    <p className="lk-history__title">{item.title}</p>
                    <p className="lk-history__meta">{item.meta}</p>
                  </div>
                  <button type="button" className="lk-icon-btn" onClick={() => removeHistory("education", index)}>
                    x
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="lk-card lk-row-card">
            <div className="lk-row-head">
              <h3 className="lk-row-title">{t("profile.section.projects", "Projects")}</h3>
            </div>
            {usesApiProfile ? (
              <>
                <p className="lk-muted lk-skills-api-hint">
                  {t("profile.portfolio.hint", "Portfolio link is saved to your Profile API record.")}
                </p>
                <label>
                  {t("profile.portfolio.url", "Portfolio URL")}
                  <input
                    value={form.portfolioUrl || ""}
                    onChange={(e) => patchForm({ portfolioUrl: e.target.value })}
                    placeholder="https://github.com/you"
                  />
                </label>
                <div className="lk-head-actions">
                  <button
                    type="button"
                    className="lk-head-chip lk-head-chip--primary"
                    onClick={savePortfolioUrl}
                    disabled={isSaving}
                  >
                    {t("profile.portfolio.save", "Save portfolio link")}
                  </button>
                </div>
                {form.portfolioUrl ? (
                  <a className="lk-line lk-line--link" href={form.portfolioUrl} target="_blank" rel="noreferrer">
                    {form.portfolioUrl}
                  </a>
                ) : (
                  <p className="lk-line lk-muted">{t("profile.portfolio.empty", "No portfolio link yet.")}</p>
                )}
              </>
            ) : (
              <p className="lk-muted lk-skills-api-hint">{t("profile.apiRequired", "Sign in with a real account to sync this section.")}</p>
            )}
          </article>

          <article className="lk-card lk-row-card">
            <div className="lk-row-head">
              <h3 className="lk-row-title">{t("profile.section.academies", "Academies")}</h3>
            </div>
            {usesApiProfile ? (
              <p className="lk-muted lk-skills-api-hint">
                {t(
                  "profile.academies.apiHint",
                  "Browse the academy catalog. Adding links an education affiliation on your profile.",
                )}
              </p>
            ) : null}
            <div className="skills-editor">
              <div className="skills-row">
                <input
                  value={academyDraft}
                  placeholder={t("profile.academies.placeholder", "For example: MIT")}
                  onChange={(e) => setAcademyDraft(e.target.value)}
                  onFocus={() => setAcademyInputFocused(true)}
                  onBlur={() => {
                    window.setTimeout(() => setAcademyInputFocused(false), 140);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addAcademy();
                    }
                  }}
                />
                <button type="button" className="skills-add-btn" onClick={() => addAcademy()}>
                  {t("profile.add", "Add")}
                </button>
              </div>
              {academyInputFocused &&
              (usesApiProfile ? apiAcademySuggestions.length > 0 : demoAcademySuggestions.length > 0) ? (
                <div
                  className="skills-hot-list"
                  role="listbox"
                  aria-label={t("profile.academies.suggestions", "Suggested academies")}
                >
                  {usesApiProfile
                    ? apiAcademySuggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="skills-hot-list__item"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => addAcademy(item.name, item.id, item.name)}
                        >
                          {item.name}
                        </button>
                      ))
                    : demoAcademySuggestions.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className="skills-hot-list__item"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => addAcademy(item)}
                        >
                          {item}
                        </button>
                      ))}
                </div>
              ) : null}
              <div className="skills-chips">
                {displayedAcademies.map((item, index) => (
                  <span className="skill-chip" key={item.academyId || `${item.title}-${index}`}>
                    {item.title}
                    <button type="button" onClick={() => removeAcademy(index)}>
                      x
                    </button>
                  </span>
                ))}
              </div>
              {!displayedAcademies.length && (
                <p className="skills-empty">{t("profile.academies.empty", "No academies yet.")}</p>
              )}
            </div>
          </article>

          <article className="lk-card lk-row-card">
            <div className="lk-row-head">
              <h3 className="lk-row-title">{t("profile.section.certificates", "Certificates")}</h3>
            </div>
            <div className="lk-inline">
              <label>
                {t("profile.certificates.name", "Certificate name")}
                <input
                  value={certForm.name}
                  onChange={(e) => setCertForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={t("profile.certificates.namePh", "AWS Solutions Architect")}
                />
              </label>
              <label>
                {t("profile.certificates.issueDate", "Issue date")}
                <input
                  value={certForm.issueDate}
                  onChange={(e) => setCertForm((prev) => ({ ...prev, issueDate: e.target.value }))}
                  placeholder="2024-06-01"
                />
              </label>
              <label>
                {t("profile.certificates.expiryDate", "Expiry date")}
                <input
                  value={certForm.expiryDate}
                  onChange={(e) => setCertForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
                  placeholder="2027-06-01"
                />
              </label>
            </div>
            <div className="lk-head-actions">
              <button type="button" className="lk-head-chip lk-head-chip--primary" onClick={addCertificate}>
                {t("profile.certificates.add", "Add certificate")}
              </button>
            </div>
            <div className="lk-history">
              {displayedCertificates.length ? (
                displayedCertificates.map((item, index) => (
                  <div className="lk-history__item" key={item.certificateId || `${item.title}-${index}`}>
                    <div>
                      <p className="lk-history__title">{item.title}</p>
                      <p className="lk-history__meta">{item.meta}</p>
                    </div>
                    <button type="button" className="lk-icon-btn" onClick={() => removeCertificate(index)}>
                      x
                    </button>
                  </div>
                ))
              ) : (
                <p className="lk-line">{t("profile.certificates.empty", "No certificates yet.")}</p>
              )}
            </div>
          </article>

          <article className="lk-card lk-row-card">
            <div className="lk-row-head">
              <h3 className="lk-row-title">{t("profile.section.languages", "Languages")}</h3>
            </div>
            <div className="skills-editor">
              <div className="skills-row">
                <input
                  value={languageDraft}
                  placeholder={t("profile.languages.placeholder", "For example: English")}
                  onChange={(e) => setLanguageDraft(e.target.value)}
                  onFocus={() => setLanguageInputFocused(true)}
                  onBlur={() => {
                    window.setTimeout(() => setLanguageInputFocused(false), 140);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addLanguage();
                    }
                  }}
                />
                <select
                  value={languageLevelDraft}
                  onChange={(e) => setLanguageLevelDraft(e.target.value)}
                  aria-label={t("profile.languages.level", "Level")}
                >
                  {LANGUAGE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <button type="button" className="skills-add-btn" onClick={() => addLanguage()}>
                  {t("profile.add", "Add")}
                </button>
              </div>
              {languageInputFocused &&
              (usesApiProfile ? apiLanguageSuggestions.length > 0 : demoLanguageSuggestions.length > 0) ? (
                <div className="skills-hot-list" role="listbox" aria-label={t("profile.languages.suggestions", "Suggested languages")}>
                  {usesApiProfile
                    ? apiLanguageSuggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="skills-hot-list__item"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => addLanguage(item.name, item.id)}
                        >
                          {item.name}
                        </button>
                      ))
                    : demoLanguageSuggestions.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className="skills-hot-list__item"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => addLanguage(item)}
                        >
                          {item}
                        </button>
                      ))}
                </div>
              ) : null}
              <div className="skills-chips">
                {displayedLanguages.map((item, index) => (
                  <span
                    className="skill-chip"
                    key={item.userLanguageId || `${item.title}-${index}`}
                  >
                    {item.meta && item.meta !== "—" ? `${item.title} · ${item.meta}` : item.title}
                    <button type="button" onClick={() => removeLanguage(index)}>
                      x
                    </button>
                  </span>
                ))}
              </div>
              {!displayedLanguages.length && (
                <p className="skills-empty">{t("profile.languages.empty", "No languages yet.")}</p>
              )}
            </div>
          </article>

          <article className="lk-card lk-row-card">
            <div className="lk-row-head">
              <h3 className="lk-row-title">{t("profile.section.recommendations", "Recommendations")}</h3>
            </div>
            <h4 className="lk-sub">{t("profile.recommendations.received", "Received")}</h4>
            <div className="lk-history">
              {displayedReceivedRecommendations.length ? (
                displayedReceivedRecommendations.map((item, index) => (
                  <div
                    className="lk-history__item"
                    key={item.recommendationId || `${item.title}-${index}`}
                  >
                    <div>
                      <p className="lk-history__title">{item.title}</p>
                      {item.date ? <p className="lk-muted lk-history__meta">{item.date}</p> : null}
                      <p className="lk-history__meta">{item.meta}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="lk-line">{t("profile.recommendations.receivedEmpty", "No recommendations yet.")}</p>
              )}
            </div>

            <h4 className="lk-sub">{t("profile.recommendations.write", "Write a recommendation")}</h4>
            {usesApiProfile ? (
              <p className="lk-muted lk-skills-api-hint">
                {t(
                  "profile.recommendations.apiHint",
                  "Choose a network contact and write a short endorsement.",
                )}
              </p>
            ) : null}
            <div className="lk-inline">
              <label>
                {t("profile.recommendations.recipient", "Recipient")}
                <select
                  value={recommendationRecipientId}
                  onChange={(e) => setRecommendationRecipientId(e.target.value)}
                  disabled={Boolean(editingRecommendationId)}
                >
                  <option value="">{t("profile.recommendations.chooseContact", "Select contact")}</option>
                  {recommendationContacts.map((person) => (
                    <option key={person.userId} value={person.userId}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              {t("profile.recommendations.text", "Text")}
              <textarea
                rows={4}
                value={recommendationText}
                onChange={(e) => setRecommendationText(e.target.value)}
                placeholder={t(
                  "profile.recommendations.textPh",
                  "Describe your experience working with this person…",
                )}
              />
            </label>
            <div className="lk-head-actions">
              <button
                type="button"
                className="lk-head-chip lk-head-chip--primary"
                onClick={submitRecommendation}
              >
                {editingRecommendationId
                  ? t("profile.recommendations.update", "Update recommendation")
                  : t("profile.recommendations.send", "Send recommendation")}
              </button>
              {editingRecommendationId ? (
                <button type="button" className="lk-head-chip" onClick={resetRecommendationForm}>
                  {t("profile.recommendations.cancelEdit", "Cancel edit")}
                </button>
              ) : null}
            </div>

            <h4 className="lk-sub">{t("profile.recommendations.given", "Written by you")}</h4>
            <div className="lk-history">
              {displayedGivenRecommendations.length ? (
                displayedGivenRecommendations.map((item, index) => (
                  <div
                    className="lk-history__item"
                    key={item.recommendationId || `${item.title}-${index}`}
                  >
                    <div>
                      <p className="lk-history__title">{item.title}</p>
                      <p className="lk-history__meta">{item.meta}</p>
                    </div>
                    {usesApiProfile && item.recommendationId ? (
                      <button
                        type="button"
                        className="lk-icon-btn"
                        onClick={() => startEditRecommendation(index)}
                        title={t("profile.recommendations.edit", "Edit")}
                      >
                        ✎
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="lk-icon-btn"
                      onClick={() => removeGivenRecommendation(index)}
                    >
                      x
                    </button>
                  </div>
                ))
              ) : (
                <p className="lk-line">{t("profile.recommendations.givenEmpty", "You have not written any yet.")}</p>
              )}
            </div>
          </article>

          <article className="lk-card lk-row-card">
            <div className="lk-row-head">
              <h3 className="lk-row-title">{t("profile.section.skills", "Skills")}</h3>
              <div className="lk-row-actions">
                <button type="button" className="lk-icon-btn" onClick={clearAllSkills} disabled={!usesApiProfile}>
                  x
                </button>
              </div>
            </div>
            {!usesApiProfile ? (
              <p className="lk-muted lk-skills-api-hint">{t("profile.apiRequired", "Sign in with a real account to sync this section.")}</p>
            ) : null}
            <div className="skills-preview">
              {displayedSkills.length ? (
                displayedSkills.map((skill, idx) => (
                  <span
                    className="skill-pill"
                    key={usesApiProfile ? apiSkills[idx]?.userSkillId || `${skill}-${idx}` : `${skill}-${idx}`}
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="lk-line">{t("profile.skills.emptyYet", "Skills have not been added yet.")}</p>
              )}
            </div>
          </article>
        </section>

      </div>
    </section>
  );
}
