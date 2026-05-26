namespace Content.Contracts.Parameters.Post;

// Параметры удаления поста (AuthorId из JWT; soft delete через DeletedAt)
public record DeletePostParameters
{
    public string AuthorId { get; init; } = default!;

    public Guid PostId { get; init; }
}
