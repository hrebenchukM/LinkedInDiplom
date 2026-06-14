export function normalizeSkillDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  const id = dto.id ?? dto.Id;
  const name = String(dto.name ?? dto.Name ?? "").trim();
  if (!id || !name) return null;
  return {
    id: String(id),
    name,
    description: String(dto.description ?? dto.Description ?? "").trim(),
  };
}

export function normalizeUserSkillDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  const id = dto.id ?? dto.Id;
  const skillId = dto.skillId ?? dto.SkillId;
  if (!id || !skillId) return null;
  return {
    id: String(id),
    userId: String(dto.userId ?? dto.UserId ?? ""),
    skillId: String(skillId),
    level: dto.level ?? dto.Level ?? null,
    isMain: Boolean(dto.isMain ?? dto.IsMain),
    orderIndex: Number(dto.orderIndex ?? dto.OrderIndex ?? 0),
  };
}

export function normalizeRecommendedSkillDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  const id = dto.id ?? dto.Id;
  const skillId = dto.skillId ?? dto.SkillId;
  if (!id || !skillId) return null;
  return {
    id: String(id),
    position: String(dto.position ?? dto.Position ?? "").trim(),
    skillId: String(skillId),
  };
}
