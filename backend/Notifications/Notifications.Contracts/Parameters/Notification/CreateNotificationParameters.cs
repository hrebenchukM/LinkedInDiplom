namespace Notifications.Contracts.Parameters.Notification;

public record CreateNotificationParameters
{
    public string UserId { get; init; } = default!;
    public string? ActorUserId { get; init; }
    public string Type { get; init; } = default!;
    public string Title { get; init; } = default!;
    public string? Body { get; init; }
    public string? EntityType { get; init; }
    public Guid? EntityId { get; init; }
}
