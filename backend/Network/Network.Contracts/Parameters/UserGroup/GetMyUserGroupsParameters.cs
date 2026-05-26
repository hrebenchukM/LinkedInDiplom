namespace Network.Contracts.Parameters.UserGroup;

// Параметры получения групп текущего пользователя (UserId из JWT)
public record GetMyUserGroupsParameters
{
    public string UserId { get; init; } = default!;
}
