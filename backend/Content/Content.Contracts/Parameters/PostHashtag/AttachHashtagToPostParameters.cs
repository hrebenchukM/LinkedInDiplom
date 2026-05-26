namespace Content.Contracts.Parameters.PostHashtag;

// Параметры привязки хэштега к посту (AuthorId из JWT)
public record AttachHashtagToPostParameters
{
    public string AuthorId { get; init; } = default!;

    public Guid PostId { get; init; }

    public Guid HashtagId { get; init; }
}
