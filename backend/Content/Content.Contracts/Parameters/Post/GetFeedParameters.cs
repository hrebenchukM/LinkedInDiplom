namespace Content.Contracts.Parameters.Post;

// Параметры публичной ленты постов для авторизованного пользователя
public record GetFeedParameters
{
    public string ViewerUserId { get; init; } = default!;

    public int Limit { get; init; } = 50;
}
