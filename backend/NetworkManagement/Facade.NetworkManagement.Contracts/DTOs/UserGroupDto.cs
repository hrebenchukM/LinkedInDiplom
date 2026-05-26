namespace Facade.NetworkManagement.Contracts.DTOs;

// DTO группы для frontend / Swagger
public record UserGroupDto
{
    public Guid Id { get; init; }

    public string OwnerId { get; init; } = default!;

    public string Name { get; init; } = default!;

    public string? Description { get; init; }

    public string? AvatarUrl { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}
