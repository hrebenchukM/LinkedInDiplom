namespace Content.Contracts.Parameters.PostHashtag;

// Параметры отвязки хэштега от поста (AuthorId из JWT)
public record DetachHashtagFromPostParameters
{
    public string AuthorId { get; init; } = default!;

    public Guid PostId { get; init; }

    public Guid HashtagId { get; init; }
}
