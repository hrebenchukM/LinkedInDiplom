namespace Network.Contracts.Parameters.GroupMember;

// Параметры вступления в группу (UserId из JWT; role member задаётся в service)
public record JoinGroupParameters
{
    public string UserId { get; init; } = default!;

    public Guid GroupId { get; init; }
}
