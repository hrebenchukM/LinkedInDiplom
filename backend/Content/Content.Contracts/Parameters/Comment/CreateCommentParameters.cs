namespace Content.Contracts.Parameters.Comment;

// Параметры создания комментария (AuthorId из JWT)
public record CreateCommentParameters
{
    public string AuthorId { get; init; } = default!;

    public Guid PostId { get; init; }

    public string Content { get; init; } = default!;

    public Guid? ParentCommentId { get; init; }
}
