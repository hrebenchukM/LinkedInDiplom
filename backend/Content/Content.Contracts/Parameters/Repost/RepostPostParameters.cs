namespace Content.Contracts.Parameters.Repost;

// Параметры репоста поста (UserId из JWT)
public record RepostPostParameters
{
    public string UserId { get; init; } = default!;

    public Guid OriginalPostId { get; init; }
}
