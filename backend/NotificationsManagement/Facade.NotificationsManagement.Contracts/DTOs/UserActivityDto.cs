namespace Facade.NotificationsManagement.Contracts.DTOs;

public record UserActivityDto
{
    public Guid Id { get; init; }
    public string UserId { get; init; } = default!;
    public string Action { get; init; } = default!;
    public string? EntityType { get; init; }
    public Guid? EntityId { get; init; }
    public string? Meta { get; init; }
    public DateTime CreatedAt { get; init; }
}
