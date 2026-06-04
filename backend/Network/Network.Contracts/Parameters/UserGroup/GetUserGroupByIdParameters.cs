namespace Network.Contracts.Parameters.UserGroup;

// Параметры получения группы по Id (UserId из JWT — проверка доступа участника)
public record GetUserGroupByIdParameters
{
    public string UserId { get; init; } = default!;

    public Guid GroupId { get; init; }
}
