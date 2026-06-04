namespace Network.Contracts.Parameters.GroupMember;

// Параметры выхода из группы — soft leave (UserId из JWT)
public record LeaveGroupParameters
{
    public string UserId { get; init; } = default!;

    public Guid GroupId { get; init; }
}
