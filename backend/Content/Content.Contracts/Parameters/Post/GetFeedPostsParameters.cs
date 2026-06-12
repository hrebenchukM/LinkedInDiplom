namespace Content.Contracts.Parameters.Post;

// Параметры ленты постов: public feed или feed по network author ids
public record GetFeedPostsParameters
{
    public int Skip { get; init; }

    public int Take { get; init; }

    // Текущий пользователь (для private own posts в network feed)
    public string? ViewerUserId { get; init; }

    // Если задан и не пуст — посты только от этих авторов; иначе все public posts
    public IReadOnlyCollection<string>? AuthorUserIds { get; init; }
}
