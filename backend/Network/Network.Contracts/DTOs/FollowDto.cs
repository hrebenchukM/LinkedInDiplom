namespace Network.Contracts.DTOs;

// DTO подписки пользователя на другого пользователя
public record FollowDto
{
    public Guid Id { get; init; }

    public string FollowerId { get; init; } = default!;

    public string FollowingId { get; init; } = default!;

    public DateTime FollowedAt { get; init; }

    public DateTime? UnfollowedAt { get; init; }
}
