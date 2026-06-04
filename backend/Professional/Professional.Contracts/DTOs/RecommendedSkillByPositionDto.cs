namespace Professional.Contracts.DTOs;

// DTO рекомендованного навыка для должности (глобальный справочник)
public record RecommendedSkillByPositionDto
{
    public Guid Id { get; init; }

    public string Position { get; init; } = default!;

    public Guid SkillId { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}
