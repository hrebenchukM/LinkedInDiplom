namespace Content.Contracts.Parameters.Comment;

// Параметры списка комментариев поста (ViewerUserId из JWT — проверка доступа к посту)
public record GetCommentsByPostParameters
{
    public string ViewerUserId { get; init; } = default!;

    public Guid PostId { get; init; }

    public int Skip { get; init; }

    public int Take { get; init; }
}
