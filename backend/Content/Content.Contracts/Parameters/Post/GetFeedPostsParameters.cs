namespace Content.Contracts.Parameters.Post;

// Параметры публичной ленты постов (последние public-посты всех пользователей)
public record GetFeedPostsParameters
{
    public int Skip { get; init; }

    public int Take { get; init; }
}
