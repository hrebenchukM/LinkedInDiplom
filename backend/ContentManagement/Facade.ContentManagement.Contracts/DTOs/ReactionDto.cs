namespace Facade.ContentManagement.Contracts.DTOs;

// DTO реакции для frontend / Swagger
public record ReactionDto
{
    public Guid Id { get; init; }

    public Guid PostId { get; init; }

    public string UserId { get; init; } = default!;

    public string ReactionType { get; init; } = default!;

    public DateTime CreatedAt { get; init; }
}
