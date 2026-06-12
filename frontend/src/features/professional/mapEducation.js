import { parseExperienceDateInput } from "./mapExperience";

export function parseEducationPeriod(period) {
  const raw = String(period || "").trim();
  if (!raw) return { start: null, end: null };
  const parts = raw.split(/\s*(?:-|–|—|\bto\b)\s*/i).map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return {
      start: parseExperienceDateInput(parts[0]),
      end: parseExperienceDateInput(parts[1], { isEnd: true }),
    };
  }
  return {
    start: parseExperienceDateInput(parts[0]),
    end: null,
  };
}

export function normalizeEducationDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  const id = dto.id ?? dto.Id;
  if (!id) return null;
  const academyId = dto.academyId ?? dto.AcademyId;
  return {
    id: String(id),
    userId: String(dto.userId ?? dto.UserId ?? ""),
    academyId: academyId ? String(academyId) : null,
    institution: String(dto.institution ?? dto.Institution ?? "").trim(),
    degree: String(dto.degree ?? dto.Degree ?? "").trim(),
    fieldOfStudy: String(dto.fieldOfStudy ?? dto.FieldOfStudy ?? "").trim(),
    startDate: dto.startDate ?? dto.StartDate,
    endDate: dto.endDate ?? dto.EndDate,
    source: String(dto.source ?? dto.Source ?? "").trim(),
  };
}

export function buildCreateEducationBodyFromProfileForm(form, { academyId } = {}) {
  const institution = String(form.education || "").trim();
  const { start, end } = parseEducationPeriod(form.educationPeriod);
  const body = {
    institution,
    startDate: start || parseExperienceDateInput("", { isEnd: false }),
  };
  if (end) body.endDate = end;
  if (academyId) body.academyId = academyId;
  return body;
}

export function buildLinkAcademyEducationBody(academy) {
  const name = String(academy?.name || "").trim();
  return {
    institution: name,
    academyId: academy?.id,
    startDate: parseExperienceDateInput("", { isEnd: false }),
  };
}

export function mapEducationDtoToHistoryItem(dto = {}) {
  const normalized = normalizeEducationDto(dto);
  if (!normalized) return null;
  const start = normalized.startDate ? String(normalized.startDate).slice(0, 10) : "";
  const end = normalized.endDate ? String(normalized.endDate).slice(0, 10) : "Present";
  const title =
    [normalized.degree, normalized.institution].filter(Boolean).join(" — ") ||
    normalized.institution ||
    "Education";
  const meta = [normalized.fieldOfStudy, `${start} - ${end}`].filter(Boolean).join(" · ");
  return {
    educationId: normalized.id,
    title,
    meta,
    _api: true,
  };
}
