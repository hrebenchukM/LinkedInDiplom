namespace Content.Contracts.Parameters.Post;

// Параметры списка постов текущего пользователя (AuthorId из JWT)
public record GetMyPostsParameters
{
    public string AuthorId { get; init; } = default!;

    public int Skip { get; init; }

    public int Take { get; init; }
}
