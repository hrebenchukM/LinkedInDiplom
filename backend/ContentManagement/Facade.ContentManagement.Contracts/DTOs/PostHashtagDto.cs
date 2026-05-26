namespace Facade.ContentManagement.Contracts.DTOs;

// DTO связи поста и хэштега для frontend / Swagger
public record PostHashtagDto
{
    public Guid Id { get; init; }

    public Guid PostId { get; init; }

    public Guid HashtagId { get; init; }

    public DateTime CreatedAt { get; init; }

    public HashtagDto? Hashtag { get; init; }
}
