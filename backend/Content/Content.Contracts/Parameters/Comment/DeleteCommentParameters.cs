namespace Content.Contracts.Parameters.Comment;

// Параметры удаления комментария (AuthorId из JWT; soft delete через DeletedAt)
public record DeleteCommentParameters
{
    public string AuthorId { get; init; } = default!;

    public Guid CommentId { get; init; }
}
