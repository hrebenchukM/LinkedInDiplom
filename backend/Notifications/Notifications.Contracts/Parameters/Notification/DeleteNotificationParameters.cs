namespace Notifications.Contracts.Parameters.Notification;

public record DeleteNotificationParameters
{
    public string UserId { get; init; } = default!;
    public Guid NotificationId { get; init; }
}
