namespace Content.Contracts.Parameters.PostMedia;

// Параметры отвязки медиа от поста (AuthorId из JWT)
public record DetachMediaFromPostParameters
{
    public string AuthorId { get; init; } = default!;

    public Guid PostId { get; init; }

    public Guid MediaId { get; init; }
}
