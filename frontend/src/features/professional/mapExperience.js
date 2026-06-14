export function parseExperienceDateInput(value, { isEnd = false } = {}) {
  const raw = String(value || "").trim();
  if (!raw) return isEnd ? null : new Date().toISOString().slice(0, 10);
  if (/^(present|now|current)$/i.test(raw)) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (/^\d{4}$/.test(raw)) return `${raw}-01-01`;
  const parsed = Date.parse(raw);
  if (!Number.isNaN(parsed)) return new Date(parsed).toISOString().slice(0, 10);
  return isEnd ? null : new Date().toISOString().slice(0, 10);
}

export function normalizeExperienceDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  const id = dto.id ?? dto.Id;
  if (!id) return null;
  const companyId = dto.companyId ?? dto.CompanyId;
  return {
    id: String(id),
    userId: String(dto.userId ?? dto.UserId ?? ""),
    companyId: companyId ? String(companyId) : null,
    position: String(dto.position ?? dto.Position ?? "").trim(),
    employmentType: dto.employmentType ?? dto.EmploymentType ?? null,
    workLocationType: dto.workLocationType ?? dto.WorkLocationType ?? null,
    location: String(dto.location ?? dto.Location ?? "").trim(),
    startDate: dto.startDate ?? dto.StartDate,
    endDate: dto.endDate ?? dto.EndDate,
    description: String(dto.description ?? dto.Description ?? "").trim(),
  };
}

export function buildCreateExperienceBodyFromProfileForm(form, companyId) {
  const position = String(form.position || form.specialty || "").trim();
  const location = [form.city, form.country].map((value) => String(value || "").trim()).filter(Boolean).join(", ");
  const body = {
    position: position || "Professional",
    startDate: parseExperienceDateInput(form.experienceFrom),
    location: location || undefined,
  };
  const endDate = parseExperienceDateInput(form.experienceTo, { isEnd: true });
  if (endDate) body.endDate = endDate;
  if (companyId) body.companyId = companyId;
  return body;
}

export function mapExperienceDtoToHistoryItem(dto, companyName = "") {
  const normalized = normalizeExperienceDto(dto);
  if (!normalized) return null;
  const start = normalized.startDate ? String(normalized.startDate).slice(0, 10) : "";
  const end = normalized.endDate ? String(normalized.endDate).slice(0, 10) : "Present";
  const title = companyName
    ? `${normalized.position} — ${companyName}`
    : normalized.position;
  const period = `${start} - ${end}`;
  const meta = [period, normalized.location].filter(Boolean).join(" · ");
  return {
    experienceId: normalized.id,
    title,
    meta,
    description: normalized.description || "",
    companyId: normalized.companyId,
    companyName: String(companyName || "").trim(),
    position: normalized.position,
    experienceFrom: start,
    experienceTo: normalized.endDate ? String(normalized.endDate).slice(0, 10) : "",
    location: normalized.location,
    _api: true,
  };
}
