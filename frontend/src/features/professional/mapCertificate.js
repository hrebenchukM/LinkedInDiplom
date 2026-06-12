import { parseExperienceDateInput } from "./mapExperience";

export function normalizeCertificateDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  const id = dto.id ?? dto.Id;
  if (!id) return null;
  return {
    id: String(id),
    userId: String(dto.userId ?? dto.UserId ?? ""),
    academyId: dto.academyId ?? dto.AcademyId ? String(dto.academyId ?? dto.AcademyId) : null,
    name: String(dto.name ?? dto.Name ?? "").trim(),
    downloadRef: String(dto.downloadRef ?? dto.DownloadRef ?? "").trim(),
    issueDate: dto.issueDate ?? dto.IssueDate,
    expiryDate: dto.expiryDate ?? dto.ExpiryDate,
    accreditationId: String(dto.accreditationId ?? dto.AccreditationId ?? "").trim(),
    organizationUrl: String(dto.organizationUrl ?? dto.OrganizationUrl ?? "").trim(),
  };
}

export function mapCertificateDtoToHistoryItem(dto) {
  const normalized = normalizeCertificateDto(dto);
  if (!normalized) return null;
  const issue = normalized.issueDate ? String(normalized.issueDate).slice(0, 10) : "";
  const expiry = normalized.expiryDate ? String(normalized.expiryDate).slice(0, 10) : "";
  const period = expiry ? `${issue} - ${expiry}` : issue || "—";
  const meta = [period, normalized.organizationUrl].filter(Boolean).join(" · ");
  return {
    certificateId: normalized.id,
    title: normalized.name,
    meta,
    _api: true,
  };
}

export function buildCreateCertificateBody({ name, issueDate, expiryDate, organizationUrl } = {}) {
  const trimmedName = String(name || "").trim();
  const body = {
    name: trimmedName,
    issueDate: parseExperienceDateInput(issueDate),
  };
  const expiry = parseExperienceDateInput(expiryDate, { isEnd: true });
  if (expiry) body.expiryDate = expiry;
  const orgUrl = String(organizationUrl || "").trim();
  if (orgUrl) body.organizationUrl = orgUrl;
  return body;
}
