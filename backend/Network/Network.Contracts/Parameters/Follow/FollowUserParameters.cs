namespace Network.Contracts.Parameters.Follow;

// Параметры подписки на пользователя (FollowerId из JWT)
public record FollowUserParameters
{
    public string FollowerId { get; init; } = default!;

    public string FollowingId { get; init; } = default!;
}
