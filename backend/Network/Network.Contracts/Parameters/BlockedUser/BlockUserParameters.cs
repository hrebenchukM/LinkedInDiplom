namespace Network.Contracts.Parameters.BlockedUser;

// Параметры блокировки пользователя (UserId из JWT)
public record BlockUserParameters
{
    public string UserId { get; init; } = default!;

    public string BlockedUserId { get; init; } = default!;
}
