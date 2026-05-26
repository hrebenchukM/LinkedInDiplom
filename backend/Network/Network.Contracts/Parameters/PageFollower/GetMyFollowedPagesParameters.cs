namespace Network.Contracts.Parameters.PageFollower;

// Параметры списка страниц, на которые подписан пользователь (UserId из JWT)
public record GetMyFollowedPagesParameters
{
    public string UserId { get; init; } = default!;
}
