import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import { useProfileStore } from "../../features/profile/ProfileStore";
import { useUiSettings } from "../../app/providers/AppProviders";
import { patchRegisteredAccount, readRegisteredAccount } from "../../shared/lib/registeredAccount";
import { resolveMediaUrl } from "../../features/profile/mapProfile";
import { readJson, writeJson } from "../../shared/lib/storage";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import "./profile-legacy.css";

const VISIBILITY_KEY = "uiProfileVisibility";

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

const HOT_SKILLS = [
  "React",
  "TypeScript",
  "JavaScript",
  "HTML",
  "CSS",
  "Node.js",
  "Next.js",
  "Redux",
  "Tailwind CSS",
  "Figma",
  "UI Design",
  "UX Research",
  "Product Design",
  "Testing",
  "Cypress",
  "Playwright",
  "REST API",
  "GraphQL",
];

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
    }))
    .filter((item) => item.title);
}

function normalizeSkills(list) {
  if (Array.isArray(list)) return list.map((item) => String(item).trim()).filter(Boolean);
  if (typeof list === "string") return list.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
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
    resumeName: typeof saved.resumeName === "string" ? saved.resumeName : "",
    resumeDataUrl: typeof saved.resumeDataUrl === "string" ? saved.resumeDataUrl : "",
    skills: normalizeSkills(saved.skills),
    experienceItems: normalizeHistory(saved.experienceItems),
    educationItems: normalizeHistory(saved.educationItems),
    projectItems: normalizeHistory(saved.projectItems),
    visibility: readJson(VISIBILITY_KEY, "public"),
  };
}

export function ProfilePage() {
  const { session, syncUserProfile } = useAuth();
  const { profile, buildInitialForm, saveProfileForm, uploadAvatar, isLoading, loadError, reloadFromApi, loadProfessionalIntoForm } =
    useProfileStore();
  const { theme, lang, setTheme, setLang, t } = useUiSettings();
  const usesApiProfile = session.isAuthenticated && !session.user?.isGuest && !USE_MOCK_AUTH;

  const [form, setForm] = useState(() => buildFormState(buildInitialForm, session.user));
  const [skillDraft, setSkillDraft] = useState("");
  const [skillInputFocused, setSkillInputFocused] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [saveHint, setSaveHint] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState(form.avatarDataUrl);

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

  const fullName = `${form.firstName} ${form.lastName}`.trim() || "Profile";
  const avatarFallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName || "profile")}`;
  const avatarSrc = pendingAvatar || form.avatarDataUrl || avatarFallback;

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
      form.skills.length ? "skills" : "",
    ];
    const filled = values.filter((item) => String(item || "").trim()).length;
    return Math.round((filled / values.length) * 100);
  }, [form]);

  const metricViews = Math.max(12, completion + 48);
  const metricPostViews = Math.max(6, completion + 17);
  const skillSuggestions = useMemo(() => {
    const query = skillDraft.trim().toLowerCase();
    if (!query) return [];
    const used = new Set(form.skills.map((item) => item.toLowerCase()));
    return HOT_SKILLS.filter((item) => item.toLowerCase().includes(query) && !used.has(item.toLowerCase())).slice(0, 8);
  }, [form.skills, skillDraft]);

  function patchForm(patch) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function persist(nextForm, showHint = true) {
    const cleanVisibility =
      nextForm.visibility === "contacts" || nextForm.visibility === "private" ? nextForm.visibility : "public";
    writeJson(VISIBILITY_KEY, cleanVisibility);
    patchRegisteredAccount({
      ...nextForm,
      visibility: cleanVisibility,
    });

    if (usesApiProfile) {
      setIsSaving(true);
      try {
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
          company: nextForm.company,
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
    });
    if (showHint) {
      setSaveHint(t("profile.hint.saved", "Data saved."));
      window.setTimeout(() => setSaveHint(""), 1200);
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
      persist(next);
    } catch {
      setSaveHint(t("profile.hint.resumeFail", "Failed to upload resume."));
    }
  }

  function addSkill(nextValue = skillDraft) {
    const value = String(nextValue || "").trim();
    if (!value) return;
    if (form.skills.some((item) => item.toLowerCase() === value.toLowerCase())) return;
    const next = { ...form, skills: [...form.skills, value] };
    setForm(next);
    setSkillDraft("");
    persist(next);
  }

  function removeSkill(index) {
    const next = { ...form, skills: form.skills.filter((_, idx) => idx !== index) };
    setForm(next);
    persist(next);
  }

  function addHistory(type) {
    if (type === "experience") {
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
      const school = form.education.trim();
      if (!school) return;
      const next = {
        ...form,
        educationItems: [{ title: school, meta: form.educationPeriod.trim() || t("profile.notSpecified", "Not specified") }, ...form.educationItems],
      };
      setForm(next);
      persist(next);
      return;
    }
    const title = projectTitle.trim();
    if (!title) return;
    const next = {
      ...form,
      projectItems: [{ title, meta: projectLink.trim() || t("profile.notSpecifiedF", "Not specified") }, ...form.projectItems],
    };
    setForm(next);
    setProjectTitle("");
    setProjectLink("");
    persist(next);
  }

  function removeHistory(type, index) {
    const key = type === "experience" ? "experienceItems" : type === "education" ? "educationItems" : "projectItems";
    const next = { ...form, [key]: form[key].filter((_, idx) => idx !== index) };
    setForm(next);
    persist(next);
  }

  return (
    <section className="page profile-page-legacy lk-page">
      <div className="lk-wrap">
        <section className="lk-card">
          <div className="lk-cover" />
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
              {loadError ? (
                <p className="lk-save-hint" role="alert">
                  {loadError}{" "}
                  <button type="button" className="lk-line" onClick={() => reloadFromApi()}>
                    {t("common.retry", "Retry")}
                  </button>
                </p>
              ) : null}
              {isLoading ? <p className="lk-muted">{t("common.loading", "Loading…")}</p> : null}
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
                  <input value={form.company} onChange={(e) => patchForm({ company: e.target.value })} />
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
                <input value={form.phone} onChange={(e) => patchForm({ phone: e.target.value })} />
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
                      persist(next);
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
                    />
                    <button type="button" className="skills-add-btn" onClick={addSkill}>
                      {t("profile.add", "Add")}
                    </button>
                  </div>
                  {skillInputFocused && skillSuggestions.length > 0 ? (
                    <div className="skills-hot-list" role="listbox" aria-label={t("profile.skills.hotList", "Suggested skills")}>
                      {skillSuggestions.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className="skills-hot-list__item"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => addSkill(item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div className="skills-chips">
                    {form.skills.map((skill, index) => (
                      <span className="skill-chip" key={`${skill}-${index}`}>
                        {skill}
                        <button type="button" onClick={() => removeSkill(index)}>
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                  {!form.skills.length && <p className="skills-empty">{t("profile.skills.empty", "No skills yet.")}</p>}
                </div>
              </label>
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
          </article>

          <article className="lk-card lk-row-card">
            <div className="lk-row-head">
              <h3 className="lk-row-title">{t("profile.section.experience", "Experience")}</h3>
              <div className="lk-row-actions">
                <button type="button" className="lk-icon-btn" onClick={() => addHistory("experience")}>
                  +
                </button>
                <button
                  type="button"
                  className="lk-icon-btn"
                  onClick={() => {
                    const next = { ...form, experienceItems: [] };
                    setForm(next);
                    persist(next);
                  }}
                >
                  x
                </button>
              </div>
            </div>
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
                <div className="lk-history__item" key={`${item.title}-${index}`}>
                  <div>
                    <p className="lk-history__title">{item.title}</p>
                    <p className="lk-history__meta">{item.meta}</p>
                  </div>
                  <button type="button" className="lk-icon-btn" onClick={() => removeHistory("experience", index)}>
                    x
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="lk-card lk-row-card">
            <div className="lk-row-head">
              <h3 className="lk-row-title">{t("profile.section.education", "Education")}</h3>
              <div className="lk-row-actions">
                <button type="button" className="lk-icon-btn" onClick={() => addHistory("education")}>
                  +
                </button>
              </div>
            </div>
            <p className="lk-line">
              {t("profile.field.education", "Education")}: <strong>{form.education || t("profile.notSpecifiedN", "Not specified")}</strong>
            </p>
            <p className="lk-line">
              {t("profile.field.period", "Period")}: <strong>{form.educationPeriod || t("profile.notSpecified", "Not specified")}</strong>
            </p>
            <div className="lk-history">
              {form.educationItems.map((item, index) => (
                <div className="lk-history__item" key={`${item.title}-${index}`}>
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
            <div className="lk-inline">
              <label>
                {t("profile.projectName", "Project name")}
                <input value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} />
              </label>
              <label>
                {t("profile.link", "Link")}
                <input value={projectLink} onChange={(e) => setProjectLink(e.target.value)} />
              </label>
            </div>
            <div className="lk-head-actions">
              <button type="button" className="lk-head-chip lk-head-chip--primary" onClick={() => addHistory("project")}>
                {t("profile.addProject", "Add project")}
              </button>
            </div>
            <div className="lk-history">
              {form.projectItems.map((item, index) => (
                <div className="lk-history__item" key={`${item.title}-${index}`}>
                  <div>
                    <p className="lk-history__title">{item.title}</p>
                    <p className="lk-history__meta">{item.meta}</p>
                  </div>
                  <button type="button" className="lk-icon-btn" onClick={() => removeHistory("project", index)}>
                    x
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="lk-card lk-row-card">
            <div className="lk-row-head">
              <h3 className="lk-row-title">{t("profile.section.skills", "Skills")}</h3>
              <div className="lk-row-actions">
                <button
                  type="button"
                  className="lk-icon-btn"
                  onClick={() => {
                    const next = { ...form, skills: [] };
                    setForm(next);
                    persist(next);
                  }}
                >
                  x
                </button>
              </div>
            </div>
            <div className="skills-preview">
              {form.skills.length ? (
                form.skills.map((skill, idx) => (
                  <span className="skill-pill" key={`${skill}-${idx}`}>
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
