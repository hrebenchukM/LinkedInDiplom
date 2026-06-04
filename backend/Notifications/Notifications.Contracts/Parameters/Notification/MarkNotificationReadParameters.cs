namespace Notifications.Contracts.Parameters.Notification;

public record MarkNotificationReadParameters
{
    public string UserId { get; init; } = default!;
    public Guid NotificationId { get; init; }
}
