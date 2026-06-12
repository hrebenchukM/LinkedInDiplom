export function normalizeAcademyDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  const id = dto.id ?? dto.Id;
  const name = String(dto.name ?? dto.Name ?? "").trim();
  if (!id || !name) return null;
  return {
    id: String(id),
    name,
    logoUrl: String(dto.logoUrl ?? dto.LogoUrl ?? "").trim(),
    websiteUrl: String(dto.websiteUrl ?? dto.WebsiteUrl ?? "").trim(),
  };
}

export function mapAcademyDtoToHistoryItem(dto) {
  const normalized = normalizeAcademyDto(dto);
  if (!normalized) return null;
  return {
    academyId: normalized.id,
    title: normalized.name,
    meta: normalized.websiteUrl || "—",
    _api: true,
  };
}
