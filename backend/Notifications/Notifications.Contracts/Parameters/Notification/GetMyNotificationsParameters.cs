namespace Notifications.Contracts.Parameters.Notification;

public record GetMyNotificationsParameters
{
    public string UserId { get; init; } = default!;

    public int Skip { get; init; }

    public int Take { get; init; }

    public bool? IsRead { get; init; }

    public string? Type { get; init; }

    public DateTime? FromCreatedAt { get; init; }

    public DateTime? ToCreatedAt { get; init; }
}
