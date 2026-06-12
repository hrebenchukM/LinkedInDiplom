export function normalizeJobRecommendationDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  const title = String(dto.title ?? dto.Title ?? "").trim();
  if (!title) return null;
  return {
    title,
    description: String(dto.description ?? dto.Description ?? "").trim(),
    matchScore: Number(dto.matchScore ?? dto.MatchScore ?? 0) || 0,
  };
}

export function mapJobRecommendationToCard(item, index = 0) {
  const normalized = item?.title ? item : normalizeJobRecommendationDto(item);
  if (!normalized) return null;
  const slug = normalized.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return {
    id: `ai-rec-${index}-${slug || index}`,
    title: normalized.title,
    role: normalized.title,
    company: "LinkUp AI",
    location: "",
    city: "",
    salaryMin: 0,
    salaryMax: 0,
    postedDays: 0,
    seed: normalized.title,
    desc: normalized.description,
    tags: normalized.matchScore > 0 ? [`${normalized.matchScore}% match`] : [],
    aiRecommendation: true,
    matchScore: normalized.matchScore,
  };
}
