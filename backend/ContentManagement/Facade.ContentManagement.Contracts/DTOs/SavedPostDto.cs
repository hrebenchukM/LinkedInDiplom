namespace Facade.ContentManagement.Contracts.DTOs;

// DTO сохранённого поста для frontend / Swagger
public record SavedPostDto
{
    public Guid Id { get; init; }

    public string UserId { get; init; } = default!;

    public Guid PostId { get; init; }

    public DateTime SavedAt { get; init; }

    public DateTime? UnsavedAt { get; init; }

    public PostDto? Post { get; init; }
}
