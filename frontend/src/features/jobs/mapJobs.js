export function mapVacancyDtoToJob(dto, companyName = "") {
  const salaryFrom = dto.salaryFrom != null ? Math.round(Number(dto.salaryFrom) / 1000) : 0;
  const salaryTo = dto.salaryTo != null ? Math.round(Number(dto.salaryTo) / 1000) : 0;
  const postedAt = dto.postedAt ? new Date(dto.postedAt) : new Date();
  const postedDays = Math.max(0, Math.floor((Date.now() - postedAt.getTime()) / 86400000));
  const location = String(dto.location || "Remote").trim();
  const description = String(dto.description || "").trim();

  return {
    id: String(dto.id),
    role: dto.title,
    title: dto.title,
    company: companyName || `Company ${String(dto.companyId || "").slice(0, 8)}`,
    location,
    city: location,
    type: String(dto.jobType || "full-time").toLowerCase(),
    level: "middle",
    remote: /remote/i.test(location) ? "yes" : "no",
    salaryMin: salaryFrom,
    salaryMax: salaryTo,
    postedDays,
    seed: dto.title || "vacancy",
    keywords: `${dto.title} ${description} ${location}`.toLowerCase(),
    tags: [dto.jobType, dto.schedule].filter(Boolean),
    desc: {
      en: description || dto.title,
      ru: description || dto.title,
      uk: description || dto.title,
    },
    _api: true,
  };
}
