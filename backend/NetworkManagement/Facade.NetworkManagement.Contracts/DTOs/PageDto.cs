namespace Facade.NetworkManagement.Contracts.DTOs;

// DTO страницы для frontend / Swagger
public record PageDto
{
    public Guid Id { get; init; }

    public string OwnerId { get; init; } = default!;

    public string Name { get; init; } = default!;

    public string? Description { get; init; }

    public string? LogoUrl { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}
