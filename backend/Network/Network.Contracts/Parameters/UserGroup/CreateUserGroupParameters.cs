namespace Network.Contracts.Parameters.UserGroup;

// Параметры создания группы (OwnerId из JWT)
public record CreateUserGroupParameters
{
    public string OwnerId { get; init; } = default!;

    public string Name { get; init; } = default!;

    public string? Description { get; init; }

    public string? AvatarUrl { get; init; }
}
