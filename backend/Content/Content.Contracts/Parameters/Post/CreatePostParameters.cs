namespace Content.Contracts.Parameters.Post;

// Параметры создания поста (AuthorId из JWT; visibility: public | private)
public record CreatePostParameters
{
    public string AuthorId { get; init; } = default!;

    public string Content { get; init; } = default!;

    public string Visibility { get; init; } = default!;

    public IReadOnlyCollection<Guid>? MediaIds { get; init; }
}
