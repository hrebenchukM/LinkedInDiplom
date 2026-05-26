namespace Network.Contracts.Parameters.BlockedUser;

// Параметры списка заблокированных пользователей (UserId из JWT)
public record GetMyBlockedUsersParameters
{
    public string UserId { get; init; } = default!;
}
