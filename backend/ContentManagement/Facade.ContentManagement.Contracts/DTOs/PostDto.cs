namespace Facade.ContentManagement.Contracts.DTOs;

// DTO поста для frontend / Swagger
public record PostDto
{
    public Guid Id { get; init; }

    public string UserId { get; init; } = default!;

    public string Content { get; init; } = default!;

    public string Visibility { get; init; } = default!;

    public int ReactionCount { get; init; }

    public int CommentCount { get; init; }

    public int RepostCount { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? EditedAt { get; init; }

    public IReadOnlyCollection<MediaDto>? Media { get; init; }
}
