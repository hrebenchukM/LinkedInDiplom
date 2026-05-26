namespace Network.Contracts.Parameters.UserGroup;

// Параметры удаления группы — soft delete (OwnerId из JWT)
public record DeleteUserGroupParameters
{
    public string OwnerId { get; init; } = default!;

    public Guid GroupId { get; init; }
}
