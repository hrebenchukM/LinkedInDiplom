namespace Facade.NetworkManagement.Contracts.DTOs;

// DTO подписки для frontend / Swagger
public record FollowDto
{
    public Guid Id { get; init; }

    public string FollowerId { get; init; } = default!;

    public string FollowingId { get; init; } = default!;

    public DateTime FollowedAt { get; init; }

    public DateTime? UnfollowedAt { get; init; }
}
