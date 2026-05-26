namespace Facade.ContentManagement.Contracts.DTOs;

// DTO хэштега для frontend / Swagger
public record HashtagDto
{
    public Guid Id { get; init; }

    public string Name { get; init; } = default!;

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}
