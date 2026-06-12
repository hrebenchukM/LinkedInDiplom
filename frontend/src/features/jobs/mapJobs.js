export function normalizeSearchQueryDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  const id = dto.id ?? dto.Id;
  if (!id) return null;
  return {
    id: String(id),
    userId: String(dto.userId ?? dto.UserId ?? ""),
    query: String(dto.query ?? dto.Query ?? "").trim(),
    location: String(dto.location ?? dto.Location ?? "").trim(),
    radius: dto.radius ?? dto.Radius ?? null,
    createdAt: dto.createdAt ?? dto.CreatedAt,
    updatedAt: dto.updatedAt ?? dto.UpdatedAt,
  };
}

export function formatSearchQueryLabel(item, fallback = "Saved search") {
  const parts = [item?.query, item?.location].map((value) => String(value || "").trim()).filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : fallback;
}

export function buildCreateSearchQueryBody({ query, location } = {}) {
  const trimmedQuery = String(query || "").trim();
  const trimmedLocation = String(location || "").trim();
  return {
    query: trimmedQuery || undefined,
    location: trimmedLocation || undefined,
  };
}

export function normalizeRecommendedQueryDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  const id = dto.id ?? dto.Id;
  const query = String(dto.query ?? dto.Query ?? "").trim();
  if (!id || !query) return null;
  return {
    id: String(id),
    query,
    createdAt: dto.createdAt ?? dto.CreatedAt,
  };
}

export function normalizeVacancyDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  const id = dto.id ?? dto.Id;
  if (!id) return null;
  return {
    id: String(id),
    companyId: dto.companyId ?? dto.CompanyId,
    postedBy: dto.postedBy ?? dto.PostedBy ?? "",
    title: dto.title ?? dto.Title ?? "",
    jobType: dto.jobType ?? dto.JobType ?? "",
    schedule: dto.schedule ?? dto.Schedule ?? "",
    location: dto.location ?? dto.Location ?? "",
    salaryFrom: dto.salaryFrom ?? dto.SalaryFrom,
    salaryTo: dto.salaryTo ?? dto.SalaryTo,
    salaryCurrency: dto.salaryCurrency ?? dto.SalaryCurrency ?? "",
    description: dto.description ?? dto.Description ?? "",
    postedAt: dto.postedAt ?? dto.PostedAt,
    updatedAt: dto.updatedAt ?? dto.UpdatedAt,
  };
}

export function mapVacancyDtoToJob(dto, companyName = "", currentUserId) {
  const normalized = normalizeVacancyDto(dto);
  if (!normalized) return null;

  const salaryFrom =
    normalized.salaryFrom != null ? Math.round(Number(normalized.salaryFrom) / 1000) : 0;
  const salaryTo = normalized.salaryTo != null ? Math.round(Number(normalized.salaryTo) / 1000) : 0;
  const postedAt = normalized.postedAt ? new Date(normalized.postedAt) : new Date();
  const postedDays = Math.max(0, Math.floor((Date.now() - postedAt.getTime()) / 86400000));
  const location = String(normalized.location || "Remote").trim();
  const description = String(normalized.description || "").trim();
  const schedule = String(normalized.schedule || "").trim();
  const remote = /remote/i.test(schedule) || /remote/i.test(location) ? "yes" : /hybrid/i.test(schedule) ? "hybrid" : "no";
  const userPosted =
    Boolean(currentUserId) && String(normalized.postedBy) === String(currentUserId);

  return {
    id: normalized.id,
    role: normalized.title,
    title: normalized.title,
    company: companyName || `Company ${String(normalized.companyId || "").slice(0, 8)}`,
    companyId: normalized.companyId ? String(normalized.companyId) : "",
    location,
    city: location,
    type: String(normalized.jobType || "full-time").toLowerCase(),
    level: "middle",
    remote,
    salaryMin: salaryFrom,
    salaryMax: salaryTo,
    postedDays,
    seed: normalized.title || "vacancy",
    keywords: `${normalized.title} ${description} ${location}`.toLowerCase(),
    tags: [normalized.jobType, normalized.schedule].filter(Boolean),
    desc: {
      en: description || normalized.title,
      ru: description || normalized.title,
      uk: description || normalized.title,
    },
    userPosted,
    _api: true,
  };
}

export function mapJobToPostForm(job = {}) {
  const description =
    typeof job.desc === "string" ? job.desc : String(job.desc?.en || job.desc?.uk || job.desc?.ru || "");
  return {
    role: String(job.role || job.title || ""),
    company: String(job.company || ""),
    location: String(job.location || job.city || ""),
    type: String(job.type || "full-time"),
    level: String(job.level || "middle"),
    remote: String(job.remote || "yes"),
    salaryMin: job.salaryMin != null && job.salaryMin !== "" ? String(job.salaryMin) : "",
    salaryMax: job.salaryMax != null && job.salaryMax !== "" ? String(job.salaryMax) : "",
    desc: description,
    keywords: String(job.keywords || ""),
  };
}

export function buildPostedJobFromForm(form, { id, userPosted = true } = {}) {
  return {
    id: id || `my-${Date.now()}`,
    role: form.role,
    company: form.company,
    location: form.location,
    type: form.type,
    level: form.level,
    remote: form.remote,
    salaryMin: Number(form.salaryMin) || 0,
    salaryMax: Number(form.salaryMax) || 0,
    postedDays: 0,
    seed: form.company || "CustomCompany",
    keywords: form.keywords,
    tags: [
      form.type === "full-time" ? "Full-time" : form.type,
      form.level,
      form.remote === "yes" ? "Remote" : form.remote === "hybrid" ? "Hybrid" : "On-site",
    ],
    desc: {
      en: form.desc || "Custom job description",
      ru: form.desc || "Custom job description",
      uk: form.desc || "Custom job description",
    },
    userPosted,
  };
}

/** Browse filters → `GET /api/jobs/vacancies` query params. */
export function buildVacancyBrowseParams({
  query = "",
  location = "",
  jobType = "",
  jobLevel = "",
  remoteOnly = false,
  salaryMin = "",
  sortBy = "relevance",
  page = 1,
  pageSize = 50,
} = {}) {
  const searchParts = [String(query || "").trim()];
  const level = String(jobLevel || "").trim();
  if (level) searchParts.push(level);
  const combinedQuery = searchParts.filter(Boolean).join(" ") || undefined;

  const minK = Number(salaryMin) || 0;
  let apiSortBy;
  let apiSortDirection;
  if (sortBy === "newest" || sortBy === "relevance") {
    apiSortBy = "createdAt";
    apiSortDirection = "desc";
  }

  return {
    query: combinedQuery,
    location: String(location || "").trim() || undefined,
    employmentType: jobType || undefined,
    schedule: remoteOnly ? "Remote" : undefined,
    minSalaryFrom: minK > 0 ? minK * 1000 : undefined,
    sortBy: apiSortBy,
    sortDirection: apiSortDirection,
    page,
    pageSize,
  };
}

export function mapPostFormToCreateVacancyRequest(form, companyId) {
  const schedule =
    form.remote === "yes" ? "Remote" : form.remote === "hybrid" ? "Hybrid" : "On-site";
  const salaryMinK = Number(form.salaryMin) || 0;
  const salaryMaxK = Number(form.salaryMax) || 0;

  return {
    companyId,
    title: String(form.role || "").trim(),
    jobType: String(form.type || "full-time"),
    schedule,
    location: String(form.location || "").trim(),
    salaryFrom: salaryMinK > 0 ? salaryMinK * 1000 : undefined,
    salaryTo: salaryMaxK > 0 ? salaryMaxK * 1000 : undefined,
    salaryCurrency: salaryMinK > 0 || salaryMaxK > 0 ? "USD" : undefined,
    description: String(form.desc || "").trim() || undefined,
  };
}
