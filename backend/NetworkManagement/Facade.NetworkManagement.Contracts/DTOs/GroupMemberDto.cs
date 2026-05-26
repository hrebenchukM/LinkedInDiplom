namespace Facade.NetworkManagement.Contracts.DTOs;

// DTO участника группы для frontend / Swagger
public record GroupMemberDto
{
    public Guid Id { get; init; }

    public Guid GroupId { get; init; }

    public string UserId { get; init; } = default!;

    public string Role { get; init; } = default!;

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}
