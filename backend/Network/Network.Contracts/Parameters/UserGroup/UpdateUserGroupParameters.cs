namespace Network.Contracts.Parameters.UserGroup;

// Параметры обновления группы (OwnerId из JWT)
public record UpdateUserGroupParameters
{
    public string OwnerId { get; init; } = default!;

    public Guid GroupId { get; init; }

    public string Name { get; init; } = default!;

    public string? Description { get; init; }

    public string? AvatarUrl { get; init; }
}
