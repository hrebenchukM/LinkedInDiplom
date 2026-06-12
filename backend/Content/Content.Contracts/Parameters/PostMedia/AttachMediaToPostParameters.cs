namespace Content.Contracts.Parameters.PostMedia;

// Параметры привязки медиа к посту (AuthorId из JWT)
public record AttachMediaToPostParameters
{
    public string AuthorId { get; init; } = default!;

    public Guid PostId { get; init; }

    public Guid MediaId { get; init; }
}
