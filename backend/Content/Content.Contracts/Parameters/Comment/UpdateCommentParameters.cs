namespace Content.Contracts.Parameters.Comment;

// Параметры обновления комментария (AuthorId из JWT; только автор)
public record UpdateCommentParameters
{
    public string AuthorId { get; init; } = default!;

    public Guid CommentId { get; init; }

    public string Content { get; init; } = default!;
}
