namespace Facade.ContentManagement.Contracts.DTOs;

// DTO связи поста и медиа для frontend / Swagger
public record PostMediaDto
{
    public Guid Id { get; init; }

    public Guid PostId { get; init; }

    public Guid MediaId { get; init; }

    public DateTime CreatedAt { get; init; }

    public MediaDto? Media { get; init; }
}
