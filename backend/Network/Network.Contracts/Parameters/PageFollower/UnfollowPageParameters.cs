namespace Network.Contracts.Parameters.PageFollower;

// Параметры отписки от страницы (UserId из JWT)
public record UnfollowPageParameters
{
    public string UserId { get; init; } = default!;

    public Guid PageId { get; init; }
}
