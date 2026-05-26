namespace Facade.NetworkManagement.Contracts.DTOs;

// DTO администратора страницы для frontend / Swagger
public record PageAdminDto
{
    public Guid Id { get; init; }

    public Guid PageId { get; init; }

    public string UserId { get; init; } = default!;

    public string Role { get; init; } = default!;

    public DateTime AssignedAt { get; init; }

    public DateTime? RevokedAt { get; init; }
}
