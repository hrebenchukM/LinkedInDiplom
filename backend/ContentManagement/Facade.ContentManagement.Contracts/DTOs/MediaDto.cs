namespace Facade.ContentManagement.Contracts.DTOs;

// DTO медиа для frontend / Swagger
public record MediaDto
{
    public Guid Id { get; init; }

    public string Url { get; init; } = default!;

    public string Type { get; init; } = default!;

    public DateTime CreatedAt { get; init; }
}
