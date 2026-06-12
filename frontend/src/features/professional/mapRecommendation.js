export function normalizeRecommendationDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  const id = dto.id ?? dto.Id;
  if (!id) return null;
  return {
    id: String(id),
    authorId: String(dto.authorId ?? dto.AuthorId ?? ""),
    userId: String(dto.userId ?? dto.UserId ?? ""),
    text: String(dto.text ?? dto.Text ?? "").trim(),
    createdAt: dto.createdAt ?? dto.CreatedAt,
    updatedAt: dto.updatedAt ?? dto.UpdatedAt,
  };
}

function formatRecommendationDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export function mapRecommendationToReceivedItem(dto, authorName = "") {
  const normalized = normalizeRecommendationDto(dto);
  if (!normalized) return null;
  const author =
    String(authorName || "").trim() || `User ${normalized.authorId.slice(0, 8)}`;
  return {
    recommendationId: normalized.id,
    authorId: normalized.authorId,
    userId: normalized.userId,
    title: author,
    meta: normalized.text,
    date: formatRecommendationDate(normalized.createdAt),
    _api: true,
  };
}

export function mapRecommendationToGivenItem(dto, recipientName = "") {
  const normalized = normalizeRecommendationDto(dto);
  if (!normalized) return null;
  const recipient =
    String(recipientName || "").trim() || `User ${normalized.userId.slice(0, 8)}`;
  return {
    recommendationId: normalized.id,
    authorId: normalized.authorId,
    userId: normalized.userId,
    title: recipient,
    meta: normalized.text,
    _api: true,
  };
}

export function buildCreateRecommendationBody({ userId, text } = {}) {
  return {
    userId: String(userId || "").trim(),
    text: String(text || "").trim(),
  };
}

export function buildPatchRecommendationBody({ text } = {}) {
  return { text: String(text || "").trim() };
}
