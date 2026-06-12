namespace Notifications.Contracts.DTOs;

public record NotificationDto
{
    public Guid Id { get; init; }
    public string UserId { get; init; } = default!;
    public string? ActorUserId { get; init; }
    public string Type { get; init; } = default!;
    public string Title { get; init; } = default!;
    public string? Body { get; init; }
    public string? EntityType { get; init; }
    public Guid? EntityId { get; init; }
    public bool IsRead { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
