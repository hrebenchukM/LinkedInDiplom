export function normalizeLanguageDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  const id = dto.id ?? dto.Id;
  const name = String(dto.name ?? dto.Name ?? "").trim();
  if (!id || !name) return null;
  return {
    id: String(id),
    name,
  };
}

export function normalizeUserLanguageDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  const id = dto.id ?? dto.Id;
  const languageId = dto.languageId ?? dto.LanguageId;
  if (!id || !languageId) return null;
  return {
    id: String(id),
    userId: String(dto.userId ?? dto.UserId ?? ""),
    languageId: String(languageId),
    level: String(dto.level ?? dto.Level ?? "").trim(),
  };
}

export function mapUserLanguageToHistoryItem(userLanguage, languageName = "") {
  const normalized = normalizeUserLanguageDto(userLanguage);
  if (!normalized) return null;
  const title = languageName || normalized.languageId;
  return {
    userLanguageId: normalized.id,
    title,
    meta: normalized.level || "—",
    languageId: normalized.languageId,
    _api: true,
  };
}
