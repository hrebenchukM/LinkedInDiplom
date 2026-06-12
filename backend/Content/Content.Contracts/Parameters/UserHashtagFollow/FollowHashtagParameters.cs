namespace Content.Contracts.Parameters.UserHashtagFollow;

// Параметры подписки пользователя на хэштег (UserId из JWT)
public record FollowHashtagParameters
{
    public string UserId { get; init; } = default!;

    public Guid HashtagId { get; init; }
}
