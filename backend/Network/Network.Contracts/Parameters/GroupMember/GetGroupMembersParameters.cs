namespace Network.Contracts.Parameters.GroupMember;

// Параметры списка участников группы (UserId из JWT — проверка доступа)
public record GetGroupMembersParameters
{
    public string UserId { get; init; } = default!;

    public Guid GroupId { get; init; }
}
