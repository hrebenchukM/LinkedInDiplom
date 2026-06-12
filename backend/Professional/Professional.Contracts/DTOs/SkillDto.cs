namespace Professional.Contracts.DTOs;

// DTO навыка в справочнике
public record SkillDto
{
    public Guid Id { get; init; }

    public string Name { get; init; } = default!;

    public string? Description { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}
