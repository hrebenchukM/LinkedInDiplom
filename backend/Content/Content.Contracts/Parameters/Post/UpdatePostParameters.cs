namespace Content.Contracts.Parameters.Post;

// Параметры обновления поста (AuthorId из JWT; visibility: public | private)
public record UpdatePostParameters
{
    public string AuthorId { get; init; } = default!;

    public Guid PostId { get; init; }

    public string Content { get; init; } = default!;

    public string Visibility { get; init; } = default!;
}
