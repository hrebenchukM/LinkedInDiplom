namespace Facade.ProfessionalManagement.Contracts.DTOs;

// DTO текстовой рекомендации для frontend / Swagger
public record RecommendationDto
{
    public Guid Id { get; init; }

    public string AuthorId { get; init; } = default!;

    public string UserId { get; init; } = default!;

    public string Text { get; init; } = default!;

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}
