namespace Network.Contracts.Parameters.PageFollower;

// Параметры подписки на страницу (UserId из JWT)
public record FollowPageParameters
{
    public string UserId { get; init; } = default!;

    public Guid PageId { get; init; }
}
