namespace Network.Contracts.Parameters.Follow;

// Параметры списка подписчиков текущего пользователя (UserId из JWT)
public record GetMyFollowersParameters
{
    public string UserId { get; init; } = default!;
}
