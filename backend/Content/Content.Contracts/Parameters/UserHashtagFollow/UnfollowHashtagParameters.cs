namespace Content.Contracts.Parameters.UserHashtagFollow;

// Параметры отписки пользователя от хэштега (UserId из JWT)
public record UnfollowHashtagParameters
{
    public string UserId { get; init; } = default!;

    public Guid HashtagId { get; init; }
}
