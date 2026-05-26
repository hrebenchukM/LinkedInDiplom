namespace Content.Contracts.DTOs;

// DTO подписки пользователя на хэштег
public record UserHashtagFollowDto
{
    public Guid Id { get; init; }

    public string UserId { get; init; } = default!;

    public Guid HashtagId { get; init; }

    public DateTime FollowedAt { get; init; }

    public DateTime? UnfollowedAt { get; init; }

    public HashtagDto? Hashtag { get; init; }
}
