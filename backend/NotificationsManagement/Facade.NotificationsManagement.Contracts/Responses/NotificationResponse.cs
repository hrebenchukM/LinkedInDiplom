using Facade.NotificationsManagement.Contracts.DTOs;

namespace Facade.NotificationsManagement.Contracts.Responses;

public record NotificationResponse
{
    public bool Success { get; init; }
    public NotificationDto? Notification { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
