namespace Professional.Contracts.DTOs;

// DTO навыка пользователя
public record UserSkillDto
{
    public Guid Id { get; init; }

    // Id пользователя из Identity
    public string UserId { get; init; } = default!;

    public Guid SkillId { get; init; }

    public string? Level { get; init; }

    public bool IsMain { get; init; }

    public int OrderIndex { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}
