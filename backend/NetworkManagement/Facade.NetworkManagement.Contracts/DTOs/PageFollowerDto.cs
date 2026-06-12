namespace Facade.NetworkManagement.Contracts.DTOs;

// DTO подписчика страницы для frontend / Swagger
public record PageFollowerDto
{
    public Guid Id { get; init; }

    public Guid PageId { get; init; }

    public string UserId { get; init; } = default!;

    public DateTime FollowedAt { get; init; }

    public DateTime? UnfollowedAt { get; init; }
}
