using Notifications.Contracts.DTOs;

namespace Notifications.Contracts.Results;

public record NotificationsPageResult
{
    public IReadOnlyCollection<NotificationDto> Items { get; init; } = Array.Empty<NotificationDto>();

    public int TotalCount { get; init; }
}
