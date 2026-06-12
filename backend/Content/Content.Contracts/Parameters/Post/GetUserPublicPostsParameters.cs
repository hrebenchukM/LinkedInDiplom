namespace Content.Contracts.Parameters.Post;

// Параметры публичных постов пользователя для activity-секции профиля
public record GetUserPublicPostsParameters
{
    public string AuthorUserId { get; init; } = default!;

    public int Skip { get; init; }

    public int Take { get; init; }
}
