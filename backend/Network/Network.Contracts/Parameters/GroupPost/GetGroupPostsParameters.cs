namespace Network.Contracts.Parameters.GroupPost;

// Параметры получения постов группы (UserId из JWT для проверки membership)
public record GetGroupPostsParameters
{
    public string UserId { get; init; } = default!;

    public Guid GroupId { get; init; }
}
