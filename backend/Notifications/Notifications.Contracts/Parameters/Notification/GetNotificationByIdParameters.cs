namespace Notifications.Contracts.Parameters.Notification;

public record GetNotificationByIdParameters
{
    public string UserId { get; init; } = default!;
    public Guid NotificationId { get; init; }
}
