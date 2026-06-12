namespace Notifications.Contracts.Parameters.Notification;

public record MarkAllNotificationsReadParameters
{
    public string UserId { get; init; } = default!;
}
