namespace Facade.ProfessionalManagement.Contracts.DTOs;

// DTO навыка пользователя для frontend / Swagger
public record UserSkillDto
{
    public Guid Id { get; init; }

    public string UserId { get; init; } = default!;

    public Guid SkillId { get; init; }

    public string? Level { get; init; }

    public bool IsMain { get; init; }

    public int OrderIndex { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}
