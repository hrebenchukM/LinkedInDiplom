namespace Content.Contracts.Parameters.Repost;

// Параметры отмены репоста (UserId из JWT)
public record UnrepostPostParameters
{
    public string UserId { get; init; } = default!;

    public Guid OriginalPostId { get; init; }
}
