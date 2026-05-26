namespace Network.Contracts.Parameters.BlockedUser;

// Параметры разблокировки (UserId из JWT)
public record UnblockUserParameters
{
    public string UserId { get; init; } = default!;

    public string BlockedUserId { get; init; } = default!;
}
