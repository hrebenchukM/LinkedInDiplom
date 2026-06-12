namespace Facade.ProfessionalManagement.Contracts.DTOs;

// DTO языка пользователя для frontend / Swagger
public record UserLanguageDto
{
    public Guid Id { get; init; }

    public string UserId { get; init; } = default!;

    public Guid LanguageId { get; init; }

    public string? Level { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}
