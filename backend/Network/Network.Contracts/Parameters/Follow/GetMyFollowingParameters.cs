namespace Network.Contracts.Parameters.Follow;

// Параметры списка подписок текущего пользователя (UserId из JWT)
public record GetMyFollowingParameters
{
    public string UserId { get; init; } = default!;
}
