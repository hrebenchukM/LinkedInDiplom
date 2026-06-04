namespace Notifications.Contracts.Parameters.Notification;

public record GetMyNotificationsParameters
{
    public string UserId { get; init; } = default!;
    public bool? IsRead { get; init; }
    public int? Limit { get; init; }
}
