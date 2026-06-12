namespace Content.Contracts.DTOs;

// DTO репоста поста
public record RepostDto
{
    public Guid Id { get; init; }

    public string UserId { get; init; } = default!;

    public Guid OriginalPostId { get; init; }

    public DateTime RepostedAt { get; init; }

    public DateTime? RemovedAt { get; init; }

    public PostDto? OriginalPost { get; init; }
}
