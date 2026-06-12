namespace Network.Contracts.Parameters.PageFollower;

// Параметры списка подписчиков страницы (UserId из JWT — проверка доступа)
public record GetPageFollowersParameters
{
    public string UserId { get; init; } = default!;

    public Guid PageId { get; init; }
}
