namespace Network.Contracts.Parameters.Follow;

// Параметры отписки (FollowerId из JWT)
public record UnfollowUserParameters
{
    public string FollowerId { get; init; } = default!;

    public string FollowingId { get; init; } = default!;
}
